import { type Tokenize } from '@surimi/parsers';
import { mix } from 'ts-mixer';

import { CoreBuilder } from './core.builder';
import { WithNavigation } from '../mixins/navigation.mixin';
import { WithStyling } from '../mixins/styling.mixin';
import { WithPseudoClasses } from '../mixins/pseudo-classes.mixin';
import { WithPseudoElements } from '../mixins/pseudo-elements.mixin';
import { WithSelecting } from '../mixins/selecting.mixin';
import { WithSelectorOperations } from '../mixins/selector-operations.mixin';
import { WithUsables } from '../mixins/usables.mixin';

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
export class SelectorBuilder<T extends string> extends CoreBuilder<Tokenize<T>> {}
