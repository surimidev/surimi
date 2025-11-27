import { SurimiContext, type ValidSelector } from '@surimi/common';
import type { SelectorBuilder } from '@surimi/core';
import type { Tokenize } from '@surimi/parsers';
import { tokenize } from '@surimi/parsers';

import { ConditionalBuilder } from '#api';

/**
 * Create a conditional selector that can be used to style elements based on the state of another element.
 *
 * @param selector - The selector to watch for state changes (e.g., '.button')
 * @returns A ConditionalBuilder that provides pseudo-class methods
 *
 * @example
 * // Style .container when .button is hovered
 * when('.button').hovered().select('.container').style({ color: 'red' })
 * // Generates: :where(.container):has(.button:hover) { color: red }
 *
 * @example
 * // Style html when .container is focused
 * when('.container').focused().select('html').style({ backgroundColor: 'blue' })
 * // Generates: :where(html):has(.container:focus) { background-color: blue }
 *
 * @example
 * // Using with existing SelectorBuilder
 * const button = select('.button');
 * when(button).checked().select('.icon').style({ display: 'block' })
 * // Generates: :where(.icon):has(.button:checked) { display: block }
 */
export function when<TSelector extends ValidSelector>(
  selector: TSelector | SelectorBuilder<TSelector>,
): ConditionalBuilder<TSelector> {
  if (typeof selector === 'string') {
    const context = tokenize(selector) as Tokenize<TSelector>;
    return new ConditionalBuilder<TSelector>(context, SurimiContext.root, SurimiContext.root);
  } else {
    // Access the protected _context property through build() and re-tokenize
    const selectorString = selector.build();
    const context = tokenize(selectorString) as Tokenize<TSelector>;
    return new ConditionalBuilder<TSelector>(context, SurimiContext.root, SurimiContext.root);
  }
}
