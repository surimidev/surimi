import { useState } from 'react';

import './TabPanel.css';

export interface TabPanelProps {
  previewContent: React.ReactNode;
  outputContent: React.ReactNode;
}

export default function TabPanel({ previewContent, outputContent }: TabPanelProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'output'>('output');

  return (
    <div className="tab-panel">
      <div className="tab-panel__header">
        <button
          className={`tab-panel__tab ${activeTab === 'preview' ? 'tab-panel__tab--active' : ''}`}
          onClick={() => {
            setActiveTab('preview');
          }}
          type="button"
        >
          Preview
        </button>
        <button
          className={`tab-panel__tab ${activeTab === 'output' ? 'tab-panel__tab--active' : ''}`}
          onClick={() => {
            setActiveTab('output');
          }}
          type="button"
        >
          Output
        </button>
      </div>
      <div className="tab-panel__content">{activeTab === 'preview' ? previewContent : outputContent}</div>
    </div>
  );
}
