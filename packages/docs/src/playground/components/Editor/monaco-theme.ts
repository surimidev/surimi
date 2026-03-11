import type mnco from 'monaco-editor';

import { colors } from '#styles';

interface Palette {
  slate: Record<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12, string>;
  blue: Record<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12, string>;
}

function monacoColorsFromPalette(p: Palette): mnco.editor.IStandaloneThemeData['colors'] {
  return {
    'editor.background': p.slate[1],
    'editor.foreground': p.slate[12],
    'editorLineNumber.foreground': p.slate[9],
    'editorLineNumber.activeForeground': p.slate[11],
    'editor.selectionBackground': `${p.blue[4]}80`,
    'editor.inactiveSelectionBackground': `${p.slate[4]}60`,
    'editor.lineHighlightBackground': p.slate[2],
    'editorCursor.foreground': p.blue[9],
    'editorIndentGuide.background': p.slate[6],
    'editorIndentGuide.activeBackground': p.slate[7],
  };
}

export function registerMonacoThemes(monaco: typeof mnco) {
  const light = monacoColorsFromPalette(colors.light as Palette);
  const dark = monacoColorsFromPalette(colors.dark as Palette);

  monaco.editor.defineTheme('surimi-light', {
    base: 'vs',
    inherit: true,
    rules: [],
    colors: light,
  });

  monaco.editor.defineTheme('surimi-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: dark,
  });
}

export function getMonacoThemeName(): 'surimi-light' | 'surimi-dark' {
  if (typeof document === 'undefined') return 'surimi-light';
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'surimi-dark' : 'surimi-light';
}
