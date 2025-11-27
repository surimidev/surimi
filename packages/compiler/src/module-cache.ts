import { createHash } from 'node:crypto';

interface ModuleCacheEntry {
  hash: string;
  transformedCode: string;
  timestamp: number;
}

/**
 * Module-level cache for PostCSS/Surimi build results
 *
 * This cache operates at a lower level than BuildCache, caching the transformed
 * code of individual modules before they are bundled. This prevents redundant
 * SurimiContext.build() calls for shared dependencies across different bundles.
 *
 * Performance characteristics:
 * - Eliminates duplicate PostCSS processing for shared dependencies
 * - Content-based cache invalidation using SHA-256 hashing
 * - Memory usage: O(n) where n = maxSize (default: 500 modules)
 *
 * Example: If button.css.ts and input.css.ts both import mixins.css.ts,
 * mixins.css.ts will only be transformed once and reused across both bundles.
 */
export class ModuleBuildCache {
  private cache = new Map<string, ModuleCacheEntry>();
  private accessOrder: string[] = [];
  private maxSize: number;
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
  };

  constructor(maxSize = 500) {
    this.maxSize = maxSize;
  }

  private getContentHash(content: string): string {
    return createHash('sha256').update(content).digest('hex');
  }

  /**
   * Get cached transformed code for a module
   * @param moduleId - The module identifier (file path)
   * @param content - The original module content
   * @returns Cached transformed code if available and valid, undefined otherwise
   */
  get(moduleId: string, content: string): string | undefined {
    const entry = this.cache.get(moduleId);

    if (!entry) {
      this.stats.misses++;
      return undefined;
    }

    const currentHash = this.getContentHash(content);
    if (currentHash !== entry.hash) {
      // Content changed, invalidate cache
      this.cache.delete(moduleId);
      this.stats.misses++;
      return undefined;
    }

    this.updateAccessOrder(moduleId);
    this.stats.hits++;
    return entry.transformedCode;
  }

  /**
   * Cache transformed code for a module
   * @param moduleId - The module identifier (file path)
   * @param content - The original module content
   * @param transformedCode - The transformed code to cache
   */
  set(moduleId: string, content: string, transformedCode: string): void {
    const hash = this.getContentHash(content);

    this.evictLRU();

    this.cache.set(moduleId, {
      hash,
      transformedCode,
      timestamp: Date.now(),
    });

    this.updateAccessOrder(moduleId);
  }

  private updateAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
    this.accessOrder.push(key);
  }

  private evictLRU(): void {
    if (this.cache.size >= this.maxSize && this.accessOrder.length > 0) {
      const lruKey = this.accessOrder.shift();
      if (lruKey) {
        this.cache.delete(lruKey);
        this.stats.evictions++;
      }
    }
  }

  /**
   * Clear all cached entries
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
    this.stats.hits = 0;
    this.stats.misses = 0;
    this.stats.evictions = 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): { hits: number; misses: number; size: number; hitRate: number; evictions: number } {
    const total = this.stats.hits + this.stats.misses;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.cache.size,
      hitRate: total > 0 ? this.stats.hits / total : 0,
      evictions: this.stats.evictions,
    };
  }

  /**
   * Invalidate a specific module from the cache
   * @param moduleId - The module identifier to invalidate
   */
  invalidate(moduleId: string): void {
    this.cache.delete(moduleId);
    const index = this.accessOrder.indexOf(moduleId);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }
}
