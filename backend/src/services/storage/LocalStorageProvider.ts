import path from 'path';
import fs from 'fs/promises';
import { StorageProvider } from './StorageProvider.js';
import { env } from '../../config/env.js';

export class LocalStorageProvider implements StorageProvider {
  private baseDir: string;

  constructor() {
    this.baseDir = path.resolve(env.uploadsDir);
  }

  async save(filePath: string, destination: string) {
    const dest = path.join(this.baseDir, destination);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.copyFile(filePath, dest);
    return dest;
  }

  getPath(relativePath: string) {
    return path.join(this.baseDir, relativePath);
  }
}
