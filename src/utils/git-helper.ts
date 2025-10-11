import { execSync } from 'child_process';

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
