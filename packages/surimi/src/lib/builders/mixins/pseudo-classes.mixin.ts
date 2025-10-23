import type { Tokenize } from '@surimi/parsers';

import type { BasePseudoClasses } from '#types/css.types';
import type { KebabCaseToCamelCase, StripColons } from '#types/util.types';

import { CoreBuilder } from '../core.builder';
import { SelectorBuilder } from '../selector.builder';

type WithPseudoClassMethods<_TContext extends string> = {
  // Should be typed as `a function taking none or some arguments and returning some SelectorBuilder`?
  [K in BasePseudoClasses as KebabCaseToCamelCase<StripColons<K>>]: unknown;
};

/**
 * Mixin that adds pseudo-class methods to a builder.
 * Each method corresponds to a CSS pseudo-class and returns a new SelectorBuilder, tagged with the appropriate pseudo-class.
 */
export class WithPseudoClasses<TContext extends string>
  extends CoreBuilder<Tokenize<TContext>>
  implements WithPseudoClassMethods<TContext>
{
  protected createPseudoClass<TPseudoClass extends string>(
    pseudoClass: TPseudoClass,
  ): SelectorBuilder<`${TContext}:${TPseudoClass}`> {
    const newToken = {
      type: 'pseudo-class',
      name: pseudoClass,
      content: `:${pseudoClass}`,
    };

    return new SelectorBuilder<`${TContext}:${TPseudoClass}`>(
      [...this.context, newToken] as never,
      this.postcssContainer,
      this.postcssRoot,
    );
  }

  public dir = (dir: 'rtl' | 'ltr') => this.createPseudoClass(`dir(${dir})`);
  public fullscreen = () => this.createPseudoClass('fullscreen');
  public has = (selector: string) => this.createPseudoClass(`has(${selector})`);
  public host = (selector: string) => this.createPseudoClass(`host(${selector})`);
  public is = (selector: string) => this.createPseudoClass(`is(${selector})`);
  public lang = (lang: string) => this.createPseudoClass(`lang(${lang})`);
  public matches = () => this.createPseudoClass('matches');
  public not = (selector: string) => this.createPseudoClass(`not(${selector})`);
  public where = (selector: string) => this.createPseudoClass(`where(${selector})`);
  public active = () => this.createPseudoClass('active');
  public blank = () => this.createPseudoClass('blank');
  public checked = () => this.createPseudoClass('checked');
  public current = () => this.createPseudoClass('current');
  public default = () => this.createPseudoClass('default');
  public defined = () => this.createPseudoClass('defined');
  public disabled = () => this.createPseudoClass('disabled');
  public empty = () => this.createPseudoClass('empty');
  public enabled = () => this.createPseudoClass('enabled');
  public first = () => this.createPseudoClass('first');
  public focus = () => this.createPseudoClass('focus');
  public future = () => this.createPseudoClass('future');
  public hover = () => this.createPseudoClass('hover');
  public indeterminate = () => this.createPseudoClass('indeterminate');
  public invalid = () => this.createPseudoClass('invalid');
  public left = () => this.createPseudoClass('left');
  public link = () => this.createPseudoClass('link');
  public optional = () => this.createPseudoClass('optional');
  public past = () => this.createPseudoClass('past');
  public paused = () => this.createPseudoClass('paused');
  public playing = () => this.createPseudoClass('playing');
  public required = () => this.createPseudoClass('required');
  public right = () => this.createPseudoClass('right');
  public root = () => this.createPseudoClass('root');
  public scope = () => this.createPseudoClass('scope');
  public target = () => this.createPseudoClass('target');
  public valid = () => this.createPseudoClass('valid');
  public visited = () => this.createPseudoClass('visited');
  public anyLink = () => this.createPseudoClass('any-link');
  public readOnly = () => this.createPseudoClass('read-only');
  public readWrite = () => this.createPseudoClass('read-write');
  public hostContext = () => this.createPseudoClass('host-context');
  public nthChild = (value: string | number) => this.createPseudoClass(`nth-child(${value})`);
  public lastChild = () => this.createPseudoClass('last-child');
  public nthLastChild = (value: string | number) => this.createPseudoClass(`nth-last-child(${value})`);
  public lastOfType = () => this.createPseudoClass('last-of-type');
  public nthLastOfType = (value: string | number) => this.createPseudoClass(`nth-last-of-type(${value})`);
  public nthOfType = (value: string | number) => this.createPseudoClass(`nth-of-type(${value})`);
  public firstChild = () => this.createPseudoClass('first-child');
  public firstOfType = () => this.createPseudoClass('first-of-type');
  public focusVisible = () => this.createPseudoClass('focus-visible');
  public focusWithin = () => this.createPseudoClass('focus-within');
  public inRange = () => this.createPseudoClass('in-range');
  public localLink = () => this.createPseudoClass('local-link');
  public nthCol = () => this.createPseudoClass('nth-col');
  public nthLastCol = () => this.createPseudoClass('nth-last-col');
  public onlyChild = () => this.createPseudoClass('only-child');
  public onlyOfType = () => this.createPseudoClass('only-of-type');
  public outOfRange = () => this.createPseudoClass('out-of-range');
  public pictureInPicture = () => this.createPseudoClass('picture-in-picture');
  public placeholderShown = () => this.createPseudoClass('placeholder-shown');
  public targetWithin = () => this.createPseudoClass('target-within');
  public userInvalid = () => this.createPseudoClass('user-invalid');
  public userValid = () => this.createPseudoClass('user-valid');
}
