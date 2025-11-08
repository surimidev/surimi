import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

import type { CompileResult } from '.';

interface CacheEntry {
  hash: string;
  result: CompileResult;
  dependencies: string[];
  dependencyHashes: Map<string, string>;
  timestamp: number;
}

// Build cache for incremental compilation in watch mode
export class BuildCache {
  private cache = new Map<string, CacheEntry>();
  private stats = {
    hits: 0,
    misses: 0,
  };

  private async getFileHash(filePath: string): Promise<string> {
    try {
      const content = await readFile(filePath, 'utf-8');
      return createHash('sha256').update(content).digest('hex');
    } catch {
      return '';
    }
  }

  async get(inputPath: string): Promise<CompileResult | undefined> {
    const entry = this.cache.get(inputPath);

    if (!entry) {
      this.stats.misses++;
      return undefined;
    }

    const currentHash = await this.getFileHash(inputPath);
    if (currentHash !== entry.hash) {
      this.stats.misses++;
      return undefined;
    }

    for (const depPath of entry.dependencies) {
      const currentDepHash = await this.getFileHash(depPath);
      const cachedDepHash = entry.dependencyHashes.get(depPath);

      if (!cachedDepHash || currentDepHash !== cachedDepHash) {
        this.stats.misses++;
        return undefined;
      }
    }

    this.stats.hits++;
    return entry.result;
  }

  async set(inputPath: string, result: CompileResult): Promise<void> {
    const hash = await this.getFileHash(inputPath);

    const dependencyHashes = new Map<string, string>();
    for (const depPath of result.dependencies) {
      const depHash = await this.getFileHash(depPath);
      dependencyHashes.set(depPath, depHash);
    }

    this.cache.set(inputPath, {
      hash,
      result,
      dependencies: result.dependencies,
      dependencyHashes,
      timestamp: Date.now(),
    });
  }

  // Invalidates cache entries that depend on the changed file
  invalidateDependents(changedPath: string): void {
    const toInvalidate: string[] = [];

    for (const [path, entry] of this.cache.entries()) {
      if (entry.dependencies.includes(changedPath)) {
        toInvalidate.push(path);
      }
    }

    for (const path of toInvalidate) {
      this.cache.delete(path);
    }
  }

  clear(): void {
    this.cache.clear();
    this.stats.hits = 0;
    this.stats.misses = 0;
  }

  getStats(): { hits: number; misses: number; size: number; hitRate: number } {
    const total = this.stats.hits + this.stats.misses;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.cache.size,
      hitRate: total > 0 ? this.stats.hits / total : 0,
    };
  }
}
