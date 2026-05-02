import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const login = "8tp";
const query = `query($login:String!){
  user(login:$login){
    followers{totalCount}
    following{totalCount}
    repositories(privacy:PUBLIC, ownerAffiliations:OWNER, first:100, orderBy:{field:UPDATED_AT,direction:DESC}){
      totalCount
      nodes{name stargazerCount forkCount primaryLanguage{name} updatedAt}
    }
    contributionsCollection{
      contributionCalendar{
        totalContributions
        weeks{contributionDays{date contributionCount}}
      }
    }
    repositoriesContributedTo(contributionTypes:[COMMIT,PULL_REQUEST,ISSUE,REPOSITORY], first:1){totalCount}
  }
}`;

const rawProfile = execFileSync("gh", ["api", "graphql", "-f", `query=${query}`, "-f", `login=${login}`], {
  encoding: "utf8",
});
const user = JSON.parse(rawProfile).data.user;
const repos = user.repositories.nodes;
const days = user.contributionsCollection.contributionCalendar.weeks.flatMap((week) => week.contributionDays);
const nonzero = days.filter((day) => day.contributionCount > 0).map((day) => [day.date, day.contributionCount]);
const repoMetrics = Object.fromEntries(
  repos.map((repo) => [
    repo.name.toLowerCase(),
    {
      stars: repo.stargazerCount,
      forks: repo.forkCount,
      language: repo.primaryLanguage?.name ?? null,
      updatedAt: repo.updatedAt,
    },
  ]),
);

const rawEvents = execFileSync("gh", ["api", `users/${login}/events/public`, "--paginate"], { encoding: "utf8" });
const recentActivity = JSON.parse(rawEvents).slice(0, 6).map((event) => {
  let label = event.type;
  if (event.type === "PushEvent") label = `pushed to ${event.repo.name.replace(`${login}/`, "")}`;
  if (event.type === "PullRequestEvent") label = `${event.payload.action ?? "opened"} PR in ${event.repo.name.replace(`${login}/`, "")}`;
  if (event.type === "CreateEvent") label = `created ${event.payload.ref_type ?? "ref"} in ${event.repo.name.replace(`${login}/`, "")}`;
  if (event.type === "WatchEvent") label = `starred ${event.repo.name}`;
  return { label, repo: event.repo.name, at: event.created_at };
});

const snapshot = {
  generatedAt: new Date().toISOString(),
  profile: {
    publicRepos: user.repositories.totalCount,
    followers: user.followers.totalCount,
    following: user.following.totalCount,
    yearlyContributions: user.contributionsCollection.contributionCalendar.totalContributions,
    contributedToRepos: user.repositoriesContributedTo.totalCount,
    totalStars: repos.reduce((sum, repo) => sum + repo.stargazerCount, 0),
    totalForks: repos.reduce((sum, repo) => sum + repo.forkCount, 0),
  },
  contributions: {
    start: days[0]?.date,
    end: days.at(-1)?.date,
    nonzero,
  },
  repoMetrics,
  recentActivity,
};

const file = `export const github = ${JSON.stringify(snapshot, null, 2)} as const;

export type RepoMetric = {
  stars: number;
  forks: number;
  language: string | null;
  updatedAt: string;
};

export function getRepoMetric(slug: string, name: string): RepoMetric | undefined {
  const metrics = github.repoMetrics as Record<string, RepoMetric>;
  return metrics[slug.toLowerCase()] ?? metrics[name.toLowerCase()];
}

export function formatCompact(value: number): string {
  return new Intl.NumberFormat("en", { notation: "compact" }).format(value);
}

export function formatShortDate(value: string): string {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "2-digit", timeZone: "UTC" }).format(new Date(value));
}

export function contributionLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count >= 20) return 4;
  if (count >= 10) return 3;
  if (count >= 4) return 2;
  if (count > 0) return 1;
  return 0;
}
`;

writeFileSync(new URL("../src/data/github.ts", import.meta.url), file);
console.log(`Updated GitHub snapshot for ${login}`);
