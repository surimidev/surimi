import { memfs } from '@rolldown/browser/experimental';
import type { Volume } from 'memfs';
import { useCallback, useEffect, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import surimiCode from 'surimi?bundle';

import { compile, type CompileResult } from '@surimi/compiler';

import CodeEditor from '#playground/components/Editor/CodeEditor';
import Header from '#playground/components/Header/Header';
import HtmlCssView from '#playground/components/HtmlCssView/HtmlCssView';
import LectureContent from '#playground/components/LectureContent/LectureContent';
import OutputViewer from '#playground/components/OutputViewer/OutputViewer';
import { lectures } from '#playground/lectures';

import './playground.css';

const FS = memfs as { fs: unknown; volume: Volume };

function initFs() {
  FS.volume.reset();
  FS.volume.fromJSON({
    '/node_modules/surimi/package.json': JSON.stringify({
      name: 'surimi',
      version: '1.0.0',
      main: 'index.js',
      module: 'index.js',
    }),
    '/node_modules/surimi/index.js': surimiCode,
  });
}

function getLectureFilePaths(lecture: (typeof lectures)[number]): string[] {
  const paths = Object.keys(lecture.files);
  const entryPath = `/${lecture.entryFile}`;
  if (paths.includes(entryPath)) {
    return [entryPath, ...paths.filter(p => p !== entryPath)];
  }
  return paths;
}

export default function Playground() {
  const [isReady, setIsReady] = useState(false);
  const [currentLectureIndex, setCurrentLectureIndex] = useState(0);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [fileContent, setFileContent] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [compileResult, setCompileResult] = useState<CompileResult | undefined>(undefined);

  const currentLecture = lectures[currentLectureIndex];
  const filePaths = currentLecture ? getLectureFilePaths(currentLecture) : [];
  const vol = FS.volume;

  useEffect(() => {
    initFs();
    setIsReady(true);
  }, []);

  // When lecture changes or isReady: write lecture files to memfs, select first file, read from memfs
  useEffect(() => {
    if (!isReady || !currentLecture) return;
    for (const [path, content] of Object.entries(currentLecture.files)) {
      vol.writeFileSync(path, content);
    }
    const paths = getLectureFilePaths(currentLecture);
    const first = paths[0];
    if (first) {
      setSelectedFile(first);
      setFileContent(vol.readFileSync(first, 'utf-8') as string);
    }
    if ('/index.html' in currentLecture.files) {
      const indexHtml = vol.readFileSync('/index.html', 'utf-8');
      setHtmlContent(typeof indexHtml === 'string' ? indexHtml : '');
    } else {
      setHtmlContent('');
    }
  }, [isReady, currentLectureIndex, currentLecture, vol]);

  const runCompile = useCallback(async () => {
    if (!currentLecture) return;
    try {
      const res = await compile({
        input: currentLecture.entryFile,
        cwd: '/',
        include: ['**/*.css.ts'],
        exclude: ['**/node_modules/**'],
      });
      setCompileResult(res);
    } catch (err) {
      console.error('Compile failed:', err);
      setCompileResult(undefined);
    }
  }, [currentLecture]);

  // Persist current file to memfs and trigger debounced compile when content changes
  useEffect(() => {
    if (!isReady || !selectedFile) return;
    vol.writeFileSync(selectedFile, fileContent);
    if (selectedFile === '/index.html') setHtmlContent(fileContent);
    runCompile().catch((err: unknown) => {
      console.error('Compile failed:', err);
      setCompileResult(undefined);
    });
  }, [fileContent, isReady, selectedFile, vol]);

  const handleTabSelect = useCallback(
    (path: string) => {
      if (path === selectedFile) return;
      vol.writeFileSync(selectedFile, fileContent);
      if (selectedFile === '/index.html') setHtmlContent(fileContent);
      setSelectedFile(path);
      setFileContent(vol.readFileSync(path, 'utf-8') as string);
    },
    [selectedFile, fileContent, vol],
  );

  const handleLectureChange = useCallback((newIndex: number) => {
    if (newIndex < 0 || newIndex >= lectures.length) return;
    setCurrentLectureIndex(newIndex);
  }, []);

  if (!currentLecture) {
    return <div>No lecture found.</div>;
  }

  return (
    <div className="surimi-playground">
      <Header />

      <div className="surimi-playground__container">
        <PanelGroup direction="horizontal">
          <Panel defaultSize={25} minSize={20} maxSize={40}>
            <LectureContent
              title={currentLecture.title}
              content={currentLecture.markdown}
              currentIndex={currentLectureIndex}
              totalLectures={lectures.length}
              onPrevious={() => {
                handleLectureChange(currentLectureIndex - 1);
              }}
              onNext={() => {
                handleLectureChange(currentLectureIndex + 1);
              }}
            />
          </Panel>

          <PanelResizeHandle className="surimi-playground__resize-handle" />

          <Panel defaultSize={40} minSize={30} maxSize={60}>
            <div className="surimi-playground__editor-section">
              <div className="surimi-playground__editor-container">
                <div className="surimi-playground__editor-tabs">
                  {filePaths.map(path => (
                    <button
                      key={path}
                      type="button"
                      className={`surimi-playground__editor-tab ${path === selectedFile ? 'surimi-playground__editor-tab--active' : ''}`}
                      onClick={() => {
                        handleTabSelect(path);
                      }}
                    >
                      {path.replace(/^\//, '')}
                    </button>
                  ))}
                </div>
                <div className="surimi-playground__editor">
                  <CodeEditor
                    value={fileContent}
                    onChange={setFileContent}
                    language={selectedFile.endsWith('.html') ? 'html' : 'typescript'}
                  />
                </div>
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className="surimi-playground__resize-handle" />

          <Panel defaultSize={35} minSize={20} maxSize={50}>
            <div className="surimi-playground__output-section">
              <OutputViewer css={compileResult?.css ?? ''} />
              <HtmlCssView html={htmlContent} css={compileResult?.css ?? ''} />
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
