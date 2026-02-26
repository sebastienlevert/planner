import { useEffect, useRef } from 'react';

const GITHUB_API_URL =
  'https://api.github.com/repos/sebastienlevert/planner/commits?sha=main&per_page=1';
const CHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const COMMIT_AGE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Polls GitHub for new commits on main. When a commit newer than the one
 * loaded at startup is found and is older than 5 minutes, reloads the page
 * while preserving the current URL, hash, and query string.
 */
export const useAutoReload = () => {
  const baselineCommitRef = useRef<string | null>(null);

  useEffect(() => {
    const fetchLatestCommit = async (): Promise<{
      sha: string;
      date: string;
    } | null> => {
      try {
        const res = await fetch(GITHUB_API_URL, {
          headers: { Accept: 'application/vnd.github.v3+json' },
        });
        if (!res.ok) return null;
        const [latest] = await res.json();
        return {
          sha: latest.sha as string,
          date: latest.commit.committer.date as string,
        };
      } catch {
        return null;
      }
    };

    // Capture the current HEAD on first successful fetch
    const init = async () => {
      const commit = await fetchLatestCommit();
      if (commit) {
        baselineCommitRef.current = commit.sha;
      }
    };

    init();

    const interval = setInterval(async () => {
      const commit = await fetchLatestCommit();
      if (!commit) return;

      // First successful fetch — store baseline
      if (!baselineCommitRef.current) {
        baselineCommitRef.current = commit.sha;
        return;
      }

      // Same commit — nothing new
      if (commit.sha === baselineCommitRef.current) return;

      // New commit found — only reload if it's older than the threshold
      const commitAge = Date.now() - new Date(commit.date).getTime();
      if (commitAge >= COMMIT_AGE_THRESHOLD_MS) {
        window.location.reload();
      }
    }, CHECK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);
};
