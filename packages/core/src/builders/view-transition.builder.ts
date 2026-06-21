import { atRule, type CssContainer, type CssRoot, type CssRule, rule } from '@surimi/ast';
import type { CssProperties, PtNameSelector, ViewTransitionProperties } from '@surimi/common';
import { type TokenizeAtRule, tokenizeAtRule } from '@surimi/parsers';

import { createDeclarationsFromProperties } from '#utils/css.utils';

import { CoreBuilder } from './core.builder';

/**
 * Shared base for everything that styles the generated view-transition snapshot pseudo-elements.
 *
 * The four snapshot pseudo-elements (`::view-transition-old/new/group/image-pair`) live on the
 * document overlay rooted at `:root`, NOT on the element you named. This builder therefore emits
 * top-level rules into `this._container` (defaults to the document root) and deliberately ignores
 * any selector context. Writing to `_container` (instead of the root directly) keeps the door open
 * for scoping snapshot rules under `@media`/`@supports` later (e.g. `prefers-reduced-motion`).
 */
export class ViewTransitionTargetBuilder extends CoreBuilder {
  protected _arg: PtNameSelector;

  constructor(arg: PtNameSelector, container: CssContainer, root: CssRoot) {
    super([], container, root);
    this._arg = arg;
  }

  protected emit(pseudoElement: string, styles: CssProperties): this {
    const selector = `::${pseudoElement}(${this._arg})`;

    let ruleNode = this._container.nodes.find(
      (node): node is CssRule => node.type === 'rule' && node.selector === selector,
    );
    if (!ruleNode) {
      ruleNode = rule({ selector });
      this._container.append(ruleNode);
    }

    const declarations = createDeclarationsFromProperties(styles);
    declarations.forEach(declaration => {
      ruleNode.append(declaration);
    });

    return this;
  }

  /** Style the outgoing snapshot: `::view-transition-old(<target>)`. */
  public old(styles: CssProperties): this {
    return this.emit('view-transition-old', styles);
  }

  /** Style the incoming snapshot: `::view-transition-new(<target>)`. */
  public new(styles: CssProperties): this {
    return this.emit('view-transition-new', styles);
  }

  /** Style the group (geometry/size morph): `::view-transition-group(<target>)`. */
  public group(styles: CssProperties): this {
    return this.emit('view-transition-group', styles);
  }

  /** Style the old/new container: `::view-transition-image-pair(<target>)`. */
  public imagePair(styles: CssProperties): this {
    return this.emit('view-transition-image-pair', styles);
  }
}

/**
 * Builder for a single, named view transition.
 *
 * Doubles as a value token: stringifies to the name so it can be dropped into
 * `view-transition-name`, `select(...).use(...)`, or any CSS value.
 *
 * @example
 * ```ts
 * const card = viewTransition('card');
 * select('.card').use(card); // .card { view-transition-name: card }
 * card.old({ animation: `${fadeOut} .3s` }).new({ animation: `${fadeIn} .3s` });
 * ```
 */
export class ViewTransitionBuilder<T extends string> extends ViewTransitionTargetBuilder {
  protected _name: T;

  constructor(name: T, container: CssContainer, root: CssRoot) {
    super(name, container, root);
    this._name = name;
  }

  public override build(): T {
    return this._name;
  }

  public toString(): T {
    return this._name;
  }
}

/**
 * Builder targeting every snapshot sharing a `view-transition-class`: `::view-transition-*(*.<class>)`.
 * Target-only: it carries no name token, so it cannot be passed to `view-transition-name`/`use()`.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/view-transition-class
 */
export class ViewTransitionClassBuilder extends ViewTransitionTargetBuilder {
  constructor(className: string, container: CssContainer, root: CssRoot) {
    super(`*.${className}`, container, root);
  }
}

/**
 * Builder for the document-level `@view-transition` at-rule, used to opt cross-document (MPA)
 * navigations into view transitions (`navigation: auto`).
 *
 * Mirrors {@link FontFaceBuilder}: it just appends the descriptor at-rule. Duplicate rules are left
 * as-is (no dedupe) - the cascade handles repeated descriptors and users may legitimately want them.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@view-transition
 */
export class ViewTransitionAtRuleBuilder extends CoreBuilder<TokenizeAtRule<'@view-transition'>> {
  protected _descriptors: ViewTransitionProperties;

  constructor(descriptors: ViewTransitionProperties, container: CssContainer, root: CssRoot) {
    super(tokenizeAtRule('@view-transition'), container, root);

    this._descriptors = descriptors;

    this.register();
  }

  public register() {
    const atRuleNode = atRule({ name: 'view-transition' });
    const declarations = createDeclarationsFromProperties(this._descriptors as CssProperties);
    declarations.forEach(declaration => {
      atRuleNode.append(declaration);
    });
    this._cssRoot.append(atRuleNode);
  }
}
