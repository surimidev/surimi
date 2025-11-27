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
 * // Generates: :where(html):has(.button:hover) .container { color: red }
 *
 * @example
 * // Style body when .container is focused
 * when('.container').focused().select('body').style({ backgroundColor: 'blue' })
 * // Generates: :where(html):has(.container:focus) body { background-color: blue }
 *
 * @example
 * // Using with existing SelectorBuilder
 * const button = select('.button');
 * when(button).checked().select('.icon').style({ display: 'block' })
 * // Generates: :where(html):has(.button:checked) .icon { display: block }
 */
export function when<TSelector extends ValidSelector>(
  selector: TSelector | SelectorBuilder<TSelector>,
): ConditionalBuilder<TSelector> {
  if (typeof selector === 'string') {
    // Validate selector string
    if (!selector || selector.trim() === '') {
      throw new Error('Selector cannot be empty');
    }
    
    const context = tokenize(selector) as Tokenize<TSelector>;
    return new ConditionalBuilder<TSelector>(context, SurimiContext.root, SurimiContext.root);
  } else {
    // Access the protected _context property through build() and re-tokenize
    const selectorString = selector.build();
    
    if (!selectorString || selectorString.trim() === '') {
      throw new Error('SelectorBuilder must produce a valid selector string');
    }
    
    const context = tokenize(selectorString) as Tokenize<TSelector>;
    return new ConditionalBuilder<TSelector>(context, SurimiContext.root, SurimiContext.root);
  }
}
