/**
 * Utility to trigger Next.js hot reload after file changes and deploy to Vercel
 */

import { promises as fs } from 'fs';
import path from 'path';
import { deployToVercel } from './git-deploy';

export async function triggerHotReload(filePath: string): Promise<void> {
  try {
    // Touch the file to trigger Next.js hot reload
    const stats = await fs.stat(filePath);
    const now = new Date();
    await fs.utimes(filePath, now, now);
    
    // Also touch a dummy file to ensure reload
    const dummyPath = path.join(process.cwd(), '.next-hot-reload-trigger');
    await fs.writeFile(dummyPath, Date.now().toString());
    await fs.unlink(dummyPath).catch(() => {}); // Ignore errors
    
    console.log(`Hot reload triggered for: ${filePath}`);
  } catch (error) {
    console.warn('Failed to trigger hot reload:', error);
  }
}

export async function triggerHotReloadAndDeploy(filePath: string, deployMessage?: string): Promise<void> {
  // First trigger hot reload for local development
  await triggerHotReload(filePath);
  
  // Then deploy to Vercel for production
  try {
    await deployToVercel({ message: deployMessage });
    console.log('Successfully deployed to Vercel');
  } catch (error) {
    console.error('Deployment failed:', error);
    // Don't throw - we want the local changes to still work even if deployment fails
  }
}