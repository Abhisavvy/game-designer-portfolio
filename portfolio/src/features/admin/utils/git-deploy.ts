/**
 * Utility to automatically commit and push changes for Vercel deployment
 */
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface DeployOptions {
  message?: string;
  branch?: string;
}

export async function deployToVercel(options: DeployOptions = {}): Promise<void> {
  const { message = 'Admin panel update', branch = 'main' } = options;
  
  try {
    console.log('Starting auto-deployment process...');
    
    // Change to the workspace root directory for git operations
    const workspaceRoot = process.cwd().includes('/portfolio') 
      ? process.cwd().replace('/portfolio', '') 
      : process.cwd();
    
    // Check if there are any changes to commit
    const { stdout: statusOutput } = await execAsync('git status --porcelain', { cwd: workspaceRoot });
    if (!statusOutput.trim()) {
      console.log('No changes to commit, skipping deployment');
      return;
    }
    
    console.log('Changes detected:', statusOutput.trim());
    
    // Add all changes
    await execAsync('git add .', { cwd: workspaceRoot });
    console.log('Files staged for commit');
    
    // Commit with timestamp
    const timestamp = new Date().toISOString();
    const commitMessage = `${message} - ${timestamp}`;
    await execAsync(`git commit -m "${commitMessage}"`, { cwd: workspaceRoot });
    console.log(`Committed with message: ${commitMessage}`);
    
    // Push to remote
    await execAsync(`git push origin ${branch}`, { cwd: workspaceRoot });
    console.log(`Pushed to ${branch} branch - Vercel deployment triggered`);
    
  } catch (error) {
    console.error('Auto-deployment failed:', error);
    throw new Error(`Deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getGitStatus(): Promise<{ hasChanges: boolean; files: string[] }> {
  try {
    // Change to the workspace root directory for git operations
    const workspaceRoot = process.cwd().includes('/portfolio') 
      ? process.cwd().replace('/portfolio', '') 
      : process.cwd();
      
    const { stdout } = await execAsync('git status --porcelain', { cwd: workspaceRoot });
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