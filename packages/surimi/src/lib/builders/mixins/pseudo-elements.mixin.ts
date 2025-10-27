import type { Tokenize } from '@surimi/parsers';

import type { BasePseudoElements } from '#types/css.types';
import type { KebabCaseToCamelCase, StripColons } from '#types/util.types';

import { CoreBuilder } from '../core.builder';
import { SelectorBuilder } from '../selector.builder';

type WithPseudoElementMethods<_TContext extends string> = {
  [K in BasePseudoElements as KebabCaseToCamelCase<StripColons<K>>]: unknown;
};

/**
 * Mixin that adds pseudo-element methods to a builder.
 * Each method corresponds to a CSS pseudo-element and returns a new SelectorBuilder, tagged with the appropriate pseudo-element.
 */
export abstract class WithPseudoElements<TContext extends string>
  extends CoreBuilder<Tokenize<TContext>>
  implements WithPseudoElementMethods<TContext>
{
  protected createPseudoElement<TPseudoElement extends string>(
    pseudoElement: TPseudoElement,
  ): SelectorBuilder<`${TContext}:${TPseudoElement}`> {
    const newToken = {
      type: 'pseudo-element',
      name: pseudoElement,
      content: `::${pseudoElement}`,
    };

    return new SelectorBuilder<`${TContext}:${TPseudoElement}`>(
      [...this._context, newToken] as never,
      this._postcssContainer,
      this._postcssRoot,
    );
  }
  public after = () => this.createPseudoElement('after');
  public backdrop = () => this.createPseudoElement('backdrop');
  public before = () => this.createPseudoElement('before');
  public cue = () => this.createPseudoElement('cue');
  public cueRegion = () => this.createPseudoElement('cue-region');
  public firstLetter = () => this.createPseudoElement('first-letter');
  public firstLine = () => this.createPseudoElement('first-line');
  public grammarError = () => this.createPseudoElement('grammar-error');
  public marker = () => this.createPseudoElement('marker');
  public part = () => this.createPseudoElement('part');
  public placeholder = () => this.createPseudoElement('placeholder');
  public selection = () => this.createPseudoElement('selection');
  public slotted = () => this.createPseudoElement('slotted');
  public spellingError = () => this.createPseudoElement('spelling-error');
  public targetText = () => this.createPseudoElement('target-text');
  public viewTransition = () => this.createPseudoElement('view-transition');
  public viewTransitionGroup = () => this.createPseudoElement('view-transition-group');
  public viewTransitionImagePair = () => this.createPseudoElement('view-transition-image-pair');
  public viewTransitionNew = () => this.createPseudoElement('view-transition-new');
  public viewTransitionOld = () => this.createPseudoElement('view-transition-old');
}
