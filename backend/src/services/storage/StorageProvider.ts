export interface StorageProvider {
  save(filePath: string, destination: string): Promise<string>;
  getPath(relativePath: string): string;
}
