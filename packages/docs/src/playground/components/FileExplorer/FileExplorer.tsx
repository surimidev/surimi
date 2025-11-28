import { useFilesystemTree } from '@containerkit/react';
import type { FileSystemTree } from '@containerkit/react/webcontainer';
import { useState } from 'react';

import './FileExplorer.css';

export interface FileExplorerProps {
  onFileClick: (filePath: string) => void;
  selectedFile?: string | undefined;
}

export default function FileExplorer({ onFileClick, selectedFile }: FileExplorerProps) {
  const fsTree = useFilesystemTree('/src');

  return (
    <div className="file-explorer">
      <div className="file-explorer__header">
        <h3>Files</h3>
      </div>
      <div className="file-explorer__tree">
        <FileTreeView tree={fsTree} path="/src" onFileClick={onFileClick} selectedFile={selectedFile} />
      </div>
    </div>
  );
}

interface FileTreeViewProps {
  tree: FileSystemTree;
  path: string;
  level?: number;
  onFileClick: (filePath: string) => void;
  selectedFile?: string | undefined;
}

function FileTreeView({ tree, path, onFileClick, selectedFile, level = 0 }: FileTreeViewProps) {
  return (
    <div style={{ paddingLeft: level > 0 ? '1rem' : 0 }}>
      {Object.entries(tree).map(([name, node]) => (
        <FileTreeNode
          key={name}
          name={name}
          node={node}
          level={level}
          path={`${path}/${name}`}
          onFileClick={onFileClick}
          selectedFile={selectedFile}
        />
      ))}
    </div>
  );
}

interface FileTreeNodeProps {
  name: string;
  node: FileSystemTree[string];
  path: string;
  level: number;
  onFileClick: (filePath: string) => void;
  selectedFile?: string | undefined;
}

function FileTreeNode({ name, node, level, path, onFileClick, selectedFile }: FileTreeNodeProps) {
  const [isOpen, setIsOpen] = useState(level === 0);

  if ('directory' in node) {
    const hasChildren = Object.keys(node.directory).length > 0;

    return (
      <div>
        <div
          onClick={() => {
            setIsOpen(!isOpen);
          }}
          className="file-explorer__folder"
        >
          <span className="file-explorer__icon">{isOpen ? '📂' : '📁'}</span>
          <span className="file-explorer__name">{name}</span>
        </div>
        {isOpen && hasChildren && (
          <FileTreeView
            tree={node.directory}
            level={level + 1}
            path={path}
            onFileClick={onFileClick}
            selectedFile={selectedFile}
          />
        )}
      </div>
    );
  }

  if ('file' in node) {
    const isSelected = selectedFile === path;
    return (
      <div
        className={`file-explorer__file ${isSelected ? 'file-explorer__file--selected' : ''}`}
        onClick={() => {
          onFileClick(path);
        }}
      >
        <span className="file-explorer__icon">📄</span>
        <span className="file-explorer__name">{name}</span>
      </div>
    );
  }

  return null;
}
