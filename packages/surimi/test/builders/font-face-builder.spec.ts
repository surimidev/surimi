import { beforeEach, describe, expect, it } from 'vitest';

import { fontFace, select, Surimi } from '../../src/index';

describe('FontFace Builder', () => {
  beforeEach(() => {
    Surimi.clear();
  });

  it('should create a simple @font-face rule', () => {
    fontFace({
      'font-family': 'MyFont',
      src: 'url(/fonts/myfont.woff2)',
      'font-weight': 'normal',
      'font-style': 'normal',
      'unicode-range': 'U+000-5FF',
    });

    expect(Surimi.build()).toBe(`\
@font-face {
    font-family: MyFont;
    src: url(/fonts/myfont.woff2);
    font-weight: normal;
    font-style: normal;
    unicode-range: U+000-5FF
}`);
  });

  it('should yield the font-family name when used', () => {
    const mainFont = fontFace({
      'font-family': 'MyFont',
      src: 'url(/fonts/myfont.woff2)',
    });

    select('body').style({
      fontFamily: mainFont,
    });

    expect(Surimi.build()).toBe(`\
@font-face {
    font-family: MyFont;
    src: url(/fonts/myfont.woff2)
}
body {
    font-family: MyFont
}`);
  });
});
