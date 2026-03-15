import { memfs } from '@rolldown/browser/experimental';
import type { Volume } from 'memfs';
import { useCallback, useEffect, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import surimiCode from 'surimi?bundle';

import { compile, type CompileResult } from '@surimi/compiler/browser';

import CodeEditor from '#playground/components/Editor/CodeEditor';
import HtmlCssView from '#playground/components/HtmlCssView/HtmlCssView';
import LectureContent from '#playground/components/LectureContent/LectureContent';
import OutputViewer from '#playground/components/OutputViewer/OutputViewer';

import './playground.css';

const FS = memfs as { fs: unknown; volume: Volume };

export interface PlaygroundLecture {
  id: string;
  title: string;
  description: string;
  files: Record<string, string>;
  /** Rendered HTML from Astro (marked.parse(entry.body)) */
  contentHtml: string;
}

export interface PlaygroundProps {
  lectures: PlaygroundLecture[];
  initialLectureId: string;
  /** Astro client directive; not actually passed to the component */
  'client:only'?: boolean;
}

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

const ENTRY_FILE = 'index.css.ts';
const MOBILE_BREAKPOINT = 768;

type MobileView = 'lecture' | 'editor' | 'output';

function getLectureFilePaths(lecture: PlaygroundLecture): string[] {
  const paths = Object.keys(lecture.files);
  const entryPath = `/${ENTRY_FILE}`;
  if (paths.includes(entryPath)) {
    return [entryPath, ...paths.filter(p => p !== entryPath)];
  }
  return paths;
}

export default function Playground({ lectures, initialLectureId }: PlaygroundProps) {
  const [isReady, setIsReady] = useState(false);
  const [currentLectureIndex, setCurrentLectureIndex] = useState(() => {
    const i = lectures.findIndex(l => l.id === initialLectureId);
    return i >= 0 ? i : 0;
  });
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [fileContent, setFileContent] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [compileResult, setCompileResult] = useState<CompileResult | undefined>(undefined);
  const [compileError, setCompileError] = useState<string | undefined>(undefined);
  const [isMobile, setIsMobile] = useState(false);
  const [activeMobileView, setActiveMobileView] = useState<MobileView>('editor');

  const currentLecture = lectures[currentLectureIndex];
  const filePaths = currentLecture ? getLectureFilePaths(currentLecture) : [];
  const vol = FS.volume;

  useEffect(() => {
    initFs();
    setIsReady(true);
  }, []);

  // On mount: sync lecture from URL (static build bakes initialLectureId for /playground only, so query is lost)
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('lecture');
    if (id) {
      const i = lectures.findIndex(l => l.id === id);
      if (i >= 0) setCurrentLectureIndex(i);
    }
  }, [lectures]);

  // Mobile layout: single view + tabs below MOBILE_BREAKPOINT
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    const handler = () => {
      setIsMobile(mql.matches);
    };
    handler();
    mql.addEventListener('change', handler);
    return () => {
      mql.removeEventListener('change', handler);
    };
  }, []);

  // When user uses browser back/forward, sync state from URL
  useEffect(() => {
    const onPopState = () => {
      const id = new URLSearchParams(window.location.search).get('lecture');
      if (id) {
        const i = lectures.findIndex(l => l.id === id);
        if (i >= 0) setCurrentLectureIndex(i);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => {
      window.removeEventListener('popstate', onPopState);
    };
  }, [lectures]);

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
    try {
      const res = await compile({
        input: ENTRY_FILE,
        cwd: '/',
        include: ['**/*.css.ts'],
        exclude: ['**/node_modules/**'],
      });
      setCompileResult(res);
      setCompileError(undefined);
    } catch (err) {
      console.error('Compile failed:', err);
      setCompileResult(undefined);
      setCompileError(err instanceof Error ? err.message : String(err));
    }
  }, []);

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

  const goToLecture = useCallback(
    (index: number) => {
      if (index < 0 || index >= lectures.length) return;
      setCurrentLectureIndex(index);
      const url = new URL(window.location.href);
      url.searchParams.set('lecture', lectures[index]?.id ?? '');
      window.history.replaceState(null, '', url.pathname + url.search);
    },
    [lectures],
  );

  if (!currentLecture) {
    return <div>No lecture found.</div>;
  }

  const lectureContent = (
    <LectureContent
      title={currentLecture.title}
      description={currentLecture.description}
      contentHtml={currentLecture.contentHtml}
      currentIndex={currentLectureIndex}
      totalLectures={lectures.length}
      onPrevious={
        currentLectureIndex > 0
          ? () => {
              goToLecture(currentLectureIndex - 1);
            }
          : undefined
      }
      onNext={
        currentLectureIndex < lectures.length - 1
          ? () => {
              goToLecture(currentLectureIndex + 1);
            }
          : undefined
      }
    />
  );

  const editorContent = (
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
  );

  const outputContent = (
    <div className="surimi-playground__output-section">
      <OutputViewer result={compileResult} error={compileError} />
      <HtmlCssView html={htmlContent} css={compileResult?.css ?? ''} />
    </div>
  );

  if (isMobile) {
    return (
      <div className="surimi-playground surimi-playground--mobile">
        <div className="surimi-playground__mobile-tabs" role="tablist" aria-label="View">
          <button
            type="button"
            role="tab"
            aria-selected={activeMobileView === 'lecture'}
            className={`surimi-playground__mobile-tab ${activeMobileView === 'lecture' ? 'surimi-playground__mobile-tab--active' : ''}`}
            onClick={() => {
              setActiveMobileView('lecture');
            }}
          >
            Lecture
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeMobileView === 'editor'}
            className={`surimi-playground__mobile-tab ${activeMobileView === 'editor' ? 'surimi-playground__mobile-tab--active' : ''}`}
            onClick={() => {
              setActiveMobileView('editor');
            }}
          >
            Code
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeMobileView === 'output'}
            className={`surimi-playground__mobile-tab ${activeMobileView === 'output' ? 'surimi-playground__mobile-tab--active' : ''}`}
            onClick={() => {
              setActiveMobileView('output');
            }}
          >
            Output
          </button>
        </div>
        <div className="surimi-playground__mobile-panel">
          {activeMobileView === 'lecture' && lectureContent}
          {activeMobileView === 'editor' && editorContent}
          {activeMobileView === 'output' && outputContent}
        </div>
      </div>
    );
  }

  return (
    <div className="surimi-playground">
      <div className="surimi-playground__container">
        <PanelGroup direction="horizontal">
          <Panel defaultSize={25} minSize={25} maxSize={40}>
            {lectureContent}
          </Panel>

          <PanelResizeHandle className="surimi-playground__resize-handle" />

          <Panel defaultSize={50} minSize={30} maxSize={60}>
            {editorContent}
          </Panel>

          <PanelResizeHandle className="surimi-playground__resize-handle" />

          <Panel defaultSize={25} minSize={20} maxSize={50}>
            {outputContent}
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
