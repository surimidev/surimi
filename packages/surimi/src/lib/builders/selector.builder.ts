import { type Tokenize } from '@surimi/parsers';
import { mix } from 'ts-mixer';

import {
  WithNavigation,
  WithPseudoClasses,
  WithPseudoElements,
  WithSelecting,
  WithStyling,
  WithSelectorOperations,
  WithUsables,
} from './mixins';
import { CoreBuilder } from './core.builder';

class SelectorBuilderImpl<T extends string> extends CoreBuilder<Tokenize<T>> {}

export interface SelectorBuilder<T extends string>
  extends WithNavigation<T>,
    WithStyling<T>,
    WithPseudoClasses<T>,
    WithPseudoElements<T>,
    WithSelecting<T>,
    WithSelectorOperations<T>,
    WithUsables<T> {}

/**
 * The primary way to select things in Surimi.
 * Provides ways to select elements, navigate the DOM, target pseudo-elements, pseudo classes and apply styles.
 *
 * You usually don't instantiate this class directly, but rather start from a helper function like `select()`.
 */
@mix(
  WithNavigation,
  WithStyling,
  WithPseudoClasses,
  WithPseudoElements,
  WithSelecting,
  WithSelectorOperations,
  WithUsables,
)
export class SelectorBuilder<T extends string> extends SelectorBuilderImpl<T> {}
