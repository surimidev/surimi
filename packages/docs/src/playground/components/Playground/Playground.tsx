import {
  Containerkit,
  ContainerkitProvider,
  Editor,
  Terminal as ReactTerminal,
  useContainerkit,
  type TerminalHandle,
} from '@containerkit/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

import Header from '#playground/components/Header/Header';
import LectureContent from '#playground/components/LectureContent/LectureContent';
import OutputViewer from '#playground/components/OutputViewer/OutputViewer';
import PreviewPanel from '#playground/components/PreviewPanel/PreviewPanel';
import TabPanel from '#playground/components/TabPanel/TabPanel';
import { lectures } from '#playground/lectures';

import './playground.css';

function PlaygroundContent() {
  const containerkit = useContainerkit();
  const [status, setStatus] = useState<string>('Initializing...');
  const [isReady, setIsReady] = useState(false);
  const [currentLectureIndex, setCurrentLectureIndex] = useState(0);
  const [selectedFile, setSelectedFile] = useState<string | undefined>();
  const [outputFilePath] = useState<string>('build/index.css.css');
  const [serverUrl, setServerUrl] = useState<string | undefined>();

  const terminalRef = useRef<TerminalHandle>(null);

  const currentLecture = lectures[currentLectureIndex];

  if (!currentLecture) {
    throw new Error(`Lecture at index ${currentLectureIndex} not found`);
  }

  const initializePlayground = useCallback(async () => {
    console.log('ON MOUNT CALLED');
    console.log(containerkit, terminalRef.current);
    if (!containerkit || !terminalRef.current) return;
    const instance = terminalRef.current.getInstance();
    console.log('INSTANCE', instance);
    if (!instance) return;

    try {
      setStatus('Mounting files...');
      // await containerkit.mount(currentLecture.files);

      setStatus('Installing dependencies...');
      // await instance.write('pnpm install --prefer-offline\n');

      setSelectedFile(currentLecture.initialFile);

      // setStatus('Starting development server...');
      // await instance.write('export NODE_NO_WARNINGS=1\n');

      // Start build watch process in background
      // void containerkit.spawn('pnpm', ['run', 'build']);

      // Start dev server
      // await instance.write('pnpm run dev\n');

      // Listen for server ready event
      // containerkit.webContainer?.on('server-ready', (_port, url) => {
      //   setServerUrl(url);
      // });

      // setStatus('Ready');
      // setIsReady(true);
    } catch (error) {
      console.error('Failed to initialize playground:', error);
      setStatus('Error initializing playground');
    }
  }, [containerkit]);

  const handleLectureChange = async (newIndex: number) => {
    if (newIndex < 0 || newIndex >= lectures.length) return;

    const newLecture = lectures[newIndex];
    if (!newLecture) return;

    setIsReady(false);
    setStatus('Loading lecture...');
    setCurrentLectureIndex(newIndex);
    setServerUrl(undefined);

    // Remount files for new lecture
    if (containerkit) {
      try {
        await containerkit.mount(newLecture.files);
        setSelectedFile(newLecture.initialFile);
      } catch (error) {
        console.error('Failed to load lecture files:', error);
      }
    }
  };

  const handleRestartCompiler = () => {
    if (!containerkit) return;

    try {
      void terminalRef.current?.write('pnpm run build\n');
    } catch (error) {
      console.error('Failed to restart compiler:', error);
    }
  };

  const handleDownloadProject = () => {
    if (!containerkit) return;

    try {
      console.log('Download project functionality needs implementation');
    } catch (error) {
      console.error('Failed to download project:', error);
    }
  };

  if (!containerkit) {
    return <div>Loading Containerkit...</div>;
  }

  return (
    <div className="surimi-playground">
      <Header disabled={!isReady} onRestartCompiler={handleRestartCompiler} onDownloadProject={handleDownloadProject} />

      <div className="surimi-playground__container">
        <PanelGroup direction="horizontal">
          {/* Left Panel - Lecture Content */}
          <Panel defaultSize={25} minSize={20} maxSize={40}>
            <LectureContent
              title={currentLecture.title}
              content={currentLecture.markdown}
              currentIndex={currentLectureIndex}
              totalLectures={lectures.length}
              onPrevious={() => {
                void handleLectureChange(currentLectureIndex - 1);
              }}
              onNext={() => {
                void handleLectureChange(currentLectureIndex + 1);
              }}
            />
          </Panel>

          <PanelResizeHandle className="surimi-playground__resize-handle" />

          {/* Middle Panel - File Explorer and Editor */}
          <Panel defaultSize={40} minSize={30} maxSize={60}>
            <div className="surimi-playground__editor-section">
              <div className="surimi-playground__editor-container">
                <div className="surimi-playground__editor">
                  {selectedFile && <Editor path={selectedFile} monacoOptions={{ theme: 'vs-light' }} />}
                  {!isReady && (
                    <div className="surimi-playground__overlay">
                      <div className="surimi-playground__status">{status}</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="surimi-playground__terminal">
                <ReactTerminal
                  onMount={() => {
                    void initializePlayground();
                  }}
                  ref={terminalRef}
                  xtermOptions={{
                    theme: {
                      foreground: '#383a42',
                      background: '#ffffff',
                      cursor: '#bfceff',
                      black: '#383a42',
                      red: '#e45649',
                      green: '#50a14f',
                      yellow: '#c18401',
                      blue: '#4078f2',
                      magenta: '#a626a4',
                      cyan: '#0184bc',
                      white: '#a0a1a7',
                      brightBlack: '#696c77',
                    },
                  }}
                />
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className="surimi-playground__resize-handle" />

          {/* Right Panel - Preview/Output Tabs */}
          <Panel defaultSize={35} minSize={20} maxSize={50}>
            <TabPanel
              previewContent={<PreviewPanel src={serverUrl} />}
              outputContent={<OutputViewer outputFilePath={outputFilePath} />}
            />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}

const instance = new Containerkit();

export default function Playground() {
  return (
    <ContainerkitProvider instance={instance} name="surimi">
      <PlaygroundContent />
    </ContainerkitProvider>
  );
}
