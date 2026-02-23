import type { BasePseudoElements, KebabCaseToCamelCase, StripColons } from '@surimi/common';
import type { Tokenize } from '@surimi/parsers';

import { CoreBuilder, SelectorBuilder } from '#builders';

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
      this._container,
      this._cssRoot,
    );
  }
  public after = () => this.createPseudoElement('after');
  public backdrop = () => this.createPseudoElement('backdrop');
  public before = () => this.createPseudoElement('before');
  public checkmark = () => this.createPseudoElement('checkmark');
  public cue = () => this.createPseudoElement('cue');
  public cueRegion = () => this.createPseudoElement('cue-region');
  public detailsContent = () => this.createPseudoElement('details-content');
  public fileSelectorButton = () => this.createPseudoElement('file-selector-button');
  public firstLetter = () => this.createPseudoElement('first-letter');
  public firstLine = () => this.createPseudoElement('first-line');
  public grammarError = () => this.createPseudoElement('grammar-error');
  public highlight = () => this.createPseudoElement('highlight');
  public marker = () => this.createPseudoElement('marker');
  public part = () => this.createPseudoElement('part');
  public picker = () => this.createPseudoElement('picker');
  public pickerIcon = () => this.createPseudoElement('picker-icon');
  public placeholder = () => this.createPseudoElement('placeholder');
  public scrollMarker = () => this.createPseudoElement('scroll-marker');
  public scrollMarkerGroup = () => this.createPseudoElement('scroll-marker-group');
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
