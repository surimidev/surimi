import { describe, expect, it } from 'vitest';

import { stringify, tokenize } from '#index';

describe('back and forth between tokenize and stringify', () => {
  const testCases = [
    '',
    'html',
    '.class-name',
    '.A-COOl-class',
    'div.class#id[attr="value"]:hover::before > span, a.link[href^="https"]',
    '*[data-test]:active + p::after',
    'ul > li.item:nth-child(2n) ~ li:last-child',
    'a#nav-link.external[href$=".com"]:visited',
    'section.content > div.wrapper[class~="active"]',
    'input[type="checkbox"]:checked + label::before',
    'nav > ul.menu > li.item:hover > a::after',
    'div#main.content[data-role="page"]:first-child',
    'html:has(body > .modal) > body',
    "a:is(.external, [data-external='true'])",
    'p:not(.intro):first-letter',
    'div[class^="header-"][data-visible="true"] > span.highlighted',
  ] as const;

  testCases.forEach(selector => {
    it(`should tokenize and stringify back to the original for selector: "${selector}"`, () => {
      const tokens = tokenize(selector);
      const result = stringify(tokens);
      expect(result).toEqual(selector);
    });
  });
});
