import { execSync } from 'child_process';

/**
 * Retrieves the name of the current Git branch.
 * @returns The name of the current branch as a string, or null if not in a Git repository or an error occurs.
 */
export function getCurrentBranch(): string | null {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim();
    return branch;
  } catch {
    return null;
  }
}

/**
 * Checks if the current working directory is inside a Git repository.
 * @returns True if it's a Git repository, false otherwise.
 */
export function isGitRepository(): boolean {
  try {
    execSync('git rev-parse --git-dir', {
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    return true;
  } catch {
    return false;
  }
}
