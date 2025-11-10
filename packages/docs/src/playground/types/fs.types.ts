import type { FSWatchCallback, FSWatchOptions } from '@webcontainer/api';

/**
 * These files make it possible for the editor to interact with a "file system".
 * This is NOT tightly coupled to whatever webcontainers, nodejs etc. are doing, but instead aims for a simple interface.
 */

export interface DirectoryNode {
  directory: FileSystemTree;
}

export interface FileNode {
  file: {
    /**
     * The contents of the file, either as a UTF-8 string or as raw binary.
     */
    contents: string | Uint8Array;
  };
}

export interface SymlinkNode {
  file: {
    /**
     * The target of the symlink.
     */
    symlink: string;
  };
}

export type FileSystemNode = DirectoryNode | FileNode | SymlinkNode;

/**
 * A simple, tree-like structure to describe the contents of a folder to be mounted.
 * This was heavily inspired by the Webcontainers Filesystem API.
 */
export type FileSystemTree = Record<string, FileSystemNode>;

export function nodeIsFileNode(node: DirectoryNode | FileNode | SymlinkNode): node is FileNode {
  if ('file' in node && 'contents' in node.file) return true;

  return false;
}

export function nodeIsSymlinkNode(node: DirectoryNode | FileNode | SymlinkNode): node is SymlinkNode {
  if ('file' in node && 'symlink' in node.file) return true;

  return false;
}

export function nodeIsDirectoryNode(node: DirectoryNode | FileNode | SymlinkNode): node is DirectoryNode {
  if ('directory' in node) return true;

  return false;
}

/** Handles read operations triggered by the editor. Currently only supports strings, might be extended to support Binary formats later */
export type ReadFileHandler = (filepath: string) => Promise<string>;

/** Handles write operations triggered by the editor. Currently only supports strings, might be extended to support Binary formats later */
export type WriteFileHandler = (filepath: string, content: string) => Promise<void>;

export type WatchOptions = FSWatchOptions;

export type WatchCallback = FSWatchCallback;

export type WatchFileHandler = (filepath: string, options: WatchOptions, callback: WatchCallback) => () => void;
