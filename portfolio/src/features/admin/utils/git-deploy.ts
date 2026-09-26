/**
 * Utility to automatically commit and push changes for Vercel deployment
 */
import { execFile } from 'child_process';
import { promisify } from 'util';

// execFile passes arguments straight to git without a shell, so request-derived
// text (commit messages, slugs) can never be interpreted as shell syntax.
const execFileAsync = promisify(execFile);

const SAFE_BRANCH = /^[A-Za-z0-9][A-Za-z0-9._/-]*$/;

export interface DeployOptions {
  message?: string;
  branch?: string;
}

function git(args: string[], cwd: string) {
  return execFileAsync('git', args, { cwd });
}

async function getWorkspaceRoot(): Promise<string> {
  const { stdout } = await git(['rev-parse', '--show-toplevel'], process.cwd());
  return stdout.trim();
}

export async function deployToVercel(options: DeployOptions = {}): Promise<void> {
  const { message = 'Admin panel update', branch = 'main' } = options;

  if (!SAFE_BRANCH.test(branch)) {
    throw new Error(`Invalid branch name: ${branch}`);
  }

  try {
    console.log('Starting auto-deployment process...');

    const workspaceRoot = await getWorkspaceRoot();

    // Check if there are any changes to commit
    const { stdout: statusOutput } = await git(['status', '--porcelain'], workspaceRoot);
    if (!statusOutput.trim()) {
      console.log('No changes to commit, skipping deployment');
      return;
    }

    console.log('Changes detected:', statusOutput.trim());

    // Add all changes
    await git(['add', '.'], workspaceRoot);
    console.log('Files staged for commit');

    // Commit with timestamp
    const timestamp = new Date().toISOString();
    const commitMessage = `${String(message).slice(0, 200)} - ${timestamp}`;
    await git(['commit', '-m', commitMessage], workspaceRoot);
    console.log(`Committed with message: ${commitMessage}`);

    // Push to remote
    await git(['push', 'origin', branch], workspaceRoot);
    console.log(`Pushed to ${branch} branch - Vercel deployment triggered`);

  } catch (error) {
    console.error('Auto-deployment failed:', error);
    throw new Error(`Deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getGitStatus(): Promise<{ hasChanges: boolean; files: string[] }> {
  try {
    const workspaceRoot = await getWorkspaceRoot();
    const { stdout } = await git(['status', '--porcelain'], workspaceRoot);
    const files = stdout.trim().split('\n').filter(line => line.trim());
    return {
      hasChanges: files.length > 0,
      files: files.map(line => line.trim()),
    };
  } catch (error) {
    console.error('Failed to get git status:', error);
    return { hasChanges: false, files: [] };
  }
}
