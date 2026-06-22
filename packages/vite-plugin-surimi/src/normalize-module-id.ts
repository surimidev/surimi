import { existsSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { normalizePath } from 'vite';

import { VIRTUAL_CSS_SUFFIX } from './constants.js';

/**
 * Canonical, absolute, symlink-resolved, posix module id. Used as the single key for caches, the
 * module runner, and dependency graphs so one file is never tracked under two shapes (e.g. macOS
 * `/var` vs `/private/var`, or a Vite root-relative URL like `/src/x` vs its on-disk path).
 */
export function normalizeModuleId(id: string, root?: string): string {
  const cleanId = id.split('?')[0] ?? id;
  const absoluteId = toAbsolute(cleanId, root);

  try {
    return normalizePath(realpathSync.native?.(absoluteId) ?? realpathSync(absoluteId));
  } catch {
    return normalizePath(absoluteId);
  }
}

function toAbsolute(cleanId: string, root?: string): string {
  if (!path.isAbsolute(cleanId)) {
    return root ? path.join(root, cleanId) : path.resolve(cleanId);
  }
  // Vite emits root-relative URLs ("/src/x") that also pass path.isAbsolute. When the literal path
  // is missing but the rooted one exists, it was a URL — resolve it against root.
  if (root && !existsSync(cleanId)) {
    const rooted = path.join(root, cleanId.slice(1));
    if (existsSync(rooted)) return rooted;
  }
  return cleanId;
}

/**
 * Absolutize an id that may be root-relative even when it does not exist on disk (e.g. virtual CSS
 * ids). Falls back to a first-segment comparison so non-existent root-relative URLs still rebase.
 */
export function toAbsoluteModuleId(filePath: string, root: string): string {
  const alreadyAbsolute =
    filePath.startsWith(root) ||
    (path.isAbsolute(filePath) && filePath.split(path.posix.sep)[1] === root.split(path.posix.sep)[1]);
  return normalizeModuleId(alreadyAbsolute ? filePath : path.join(root, filePath), root);
}

export function toImportPath(dependencyId: string, ownerId: string, root?: string): string {
  const absoluteDependency = normalizeModuleId(dependencyId, root);
  const absoluteOwner = normalizeModuleId(ownerId, root);
  const relative = path.relative(path.dirname(absoluteOwner), absoluteDependency);
  const posixRelative = relative.split(path.sep).join(path.posix.sep);
  return posixRelative.startsWith('.') ? posixRelative : `./${posixRelative}`;
}

export function toVirtualCssImportPath(sourceId: string, ownerId: string, root?: string): string {
  return `${toImportPath(sourceId, ownerId, root)}${VIRTUAL_CSS_SUFFIX}`;
}

export const toVirtualCssId = (sourceId: string): string => `${sourceId}${VIRTUAL_CSS_SUFFIX}`;
export const fromVirtualCssId = (virtualId: string): string => virtualId.replace(VIRTUAL_CSS_SUFFIX, '');
