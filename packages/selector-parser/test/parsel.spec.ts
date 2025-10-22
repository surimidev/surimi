/**
 * Testing our tokenizer against the parsel-js tokenizer
 */

import { tokenize } from 'parsel-js';
import { describe, expect, it } from 'vitest';

describe('Compare tokenizer to parsel tokenized', () => {
  it('matches class tokenization', () => {
    const input = 'div.class.another';

    const parselTokens = tokenize(input);
    const ourTokens = tokenize(input);

    expect(ourTokens).toEqual(parselTokens);
  });

  it('matches id tokenization', () => {
    const input = 'span#uniqueId';

    const parselTokens = tokenize(input);
    const ourTokens = tokenize(input);

    expect(ourTokens).toEqual(parselTokens);
  });

  it('matches attribute tokenization', () => {
    const input = 'a[href="https://example.com"][target="_blank"]';

    const parselTokens = tokenize(input);
    const ourTokens = tokenize(input);

    expect(ourTokens).toEqual(parselTokens);
  });

  it('matches pseudo-class tokenization', () => {
    const input = 'button:disabled:hover';

    const parselTokens = tokenize(input);
    const ourTokens = tokenize(input);

    expect(ourTokens).toEqual(parselTokens);
  });

  it('matches pseudo-element tokenization', () => {
    const input = 'p::first-line';

    const parselTokens = tokenize(input);
    const ourTokens = tokenize(input);

    expect(ourTokens).toEqual(parselTokens);
  });

  it('matches complex selector tokenization', () => {
    const input = 'div#container > ul.items li.item:first-child::before';

    const parselTokens = tokenize(input);
    const ourTokens = tokenize(input);

    expect(ourTokens).toEqual(parselTokens);
  });
});
