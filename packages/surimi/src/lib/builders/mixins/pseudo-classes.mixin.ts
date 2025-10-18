import type { ExtractBuildContextFromString } from '#types/builder.types';
import { BasePseudoClasses, BasePseudoElements } from '#types/css.types';
import { KebabCaseToCamelCase, StripColons } from '#types/util.types';

import { CoreBuilder } from '../core.builder';
import { SelectorBuilder } from '../selector.builder';

type WithPseudoClassMethods<TContext extends string> = {
  [K in BasePseudoClasses as KebabCaseToCamelCase<StripColons<K>>]: () => SelectorBuilder<`${TContext}${K}`>;
};

/**
 * Mixin that adds pseudo-class methods to a builder.
 * Each method corresponds to a CSS pseudo-class and returns a new SelectorBuilder, tagged with the appropriate pseudo-class.
 */
export class WithPseudoClasses<TContext extends string>
  extends CoreBuilder<ExtractBuildContextFromString<TContext>>
  implements WithPseudoClassMethods<TContext>
{
  protected createPseudoClass<TPseudoClass extends string>(
    pseudoClass: TPseudoClass,
  ): SelectorBuilder<`${TContext}${TPseudoClass}`> {
    return new SelectorBuilder<`${TContext}${TPseudoClass}`>(
      [...this.context, { selector: pseudoClass, relation: 'pseudo-class' }] as any,
      this.postcssRoot,
    );
  }

  public dir = () => this.createPseudoClass(':dir');
  public fullscreen = () => this.createPseudoClass(':fullscreen');
  public has = () => this.createPseudoClass(':has');
  public host = () => this.createPseudoClass(':host');
  public is = () => this.createPseudoClass(':is');
  public lang = () => this.createPseudoClass(':lang');
  public matches = () => this.createPseudoClass(':matches');
  public not = () => this.createPseudoClass(':not');
  public where = () => this.createPseudoClass(':where');
  public active = () => this.createPseudoClass(':active');
  public blank = () => this.createPseudoClass(':blank');
  public checked = () => this.createPseudoClass(':checked');
  public current = () => this.createPseudoClass(':current');
  public default = () => this.createPseudoClass(':default');
  public defined = () => this.createPseudoClass(':defined');
  public disabled = () => this.createPseudoClass(':disabled');
  public empty = () => this.createPseudoClass(':empty');
  public enabled = () => this.createPseudoClass(':enabled');
  public first = () => this.createPseudoClass(':first');
  public focus = () => this.createPseudoClass(':focus');
  public future = () => this.createPseudoClass(':future');
  public hover = () => this.createPseudoClass(':hover');
  public indeterminate = () => this.createPseudoClass(':indeterminate');
  public invalid = () => this.createPseudoClass(':invalid');
  public left = () => this.createPseudoClass(':left');
  public link = () => this.createPseudoClass(':link');
  public optional = () => this.createPseudoClass(':optional');
  public past = () => this.createPseudoClass(':past');
  public paused = () => this.createPseudoClass(':paused');
  public playing = () => this.createPseudoClass(':playing');
  public required = () => this.createPseudoClass(':required');
  public right = () => this.createPseudoClass(':right');
  public root = () => this.createPseudoClass(':root');
  public scope = () => this.createPseudoClass(':scope');
  public target = () => this.createPseudoClass(':target');
  public valid = () => this.createPseudoClass(':valid');
  public visited = () => this.createPseudoClass(':visited');
  public anyLink = () => this.createPseudoClass(':any-link');
  public readOnly = () => this.createPseudoClass(':read-only');
  public readWrite = () => this.createPseudoClass(':read-write');
  public hostContext = () => this.createPseudoClass(':host-context');
  public nthChild = () => this.createPseudoClass(':nth-child');
  public lastChild = () => this.createPseudoClass(':last-child');
  public nthLastChild = () => this.createPseudoClass(':nth-last-child');
  public lastOfType = () => this.createPseudoClass(':last-of-type');
  public nthLastOfType = () => this.createPseudoClass(':nth-last-of-type');
  public nthOfType = () => this.createPseudoClass(':nth-of-type');
  public firstChild = () => this.createPseudoClass(':first-child');
  public firstOfType = () => this.createPseudoClass(':first-of-type');
  public focusVisible = () => this.createPseudoClass(':focus-visible');
  public focusWithin = () => this.createPseudoClass(':focus-within');
  public inRange = () => this.createPseudoClass(':in-range');
  public localLink = () => this.createPseudoClass(':local-link');
  public nthCol = () => this.createPseudoClass(':nth-col');
  public nthLastCol = () => this.createPseudoClass(':nth-last-col');
  public onlyChild = () => this.createPseudoClass(':only-child');
  public onlyOfType = () => this.createPseudoClass(':only-of-type');
  public outOfRange = () => this.createPseudoClass(':out-of-range');
  public pictureInPicture = () => this.createPseudoClass(':picture-in-picture');
  public placeholderShown = () => this.createPseudoClass(':placeholder-shown');
  public targetWithin = () => this.createPseudoClass(':target-within');
  public userInvalid = () => this.createPseudoClass(':user-invalid');
  public userValid = () => this.createPseudoClass(':user-valid');
}
