/**
 * Utility to trigger Next.js hot reload after file changes
 */

import { promises as fs } from 'fs';
import path from 'path';

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