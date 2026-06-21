import type {
  ArrayWithAtLeastOneItem,
  CssProperties,
  FontFaceProperties,
  ValidSelector,
  ViewTransitionNavigation,
} from '@surimi/common';
import { SurimiContext } from '@surimi/common';
import type { KeyframeStepConfig } from '@surimi/core';
import {
  ContainerQueryBuilder,
  CustomPropertyBuilder,
  createSelectorBuilderFromString,
  FontFaceBuilder,
  joinSelectors,
  KeyframesBuilder,
  MediaQueryBuilder,
  MixinBuilder,
  StyleBuilder,
  ViewTransitionAtRuleBuilder,
  ViewTransitionBuilder,
  ViewTransitionClassBuilder,
  ViewTransitionTargetBuilder,
} from '@surimi/core';
import { tokenize } from '@surimi/parsers';

/**
 * The main way to select things in Surimi.
 *
 * Pass this anything you would like to select, like class names, IDs, element names, attributes, etc.
 * Will return a tagged SelectorBuilder that allows you to
 * - navigate the DOM
 * - target pseudo-classes and pseudo-elements
 * - apply styles
 * - and more.
 *
 * **IMPORTANT:**
 * Make sure to select each item in a new argument, so that surimi can properly figure out lists of selectors.
 * For example, use `select('.class1', '.class2')` instead of `select('.class1, .class2')`.
 * When typing in selectors, you will get autocompletion for valid CSS selectors in most editors.
 *
 * @example
 * ```ts
 * const button = select('.button');
 *
 * button.style({
 *   backgroundColor: 'blue',
 *   color: 'white',
 * });
 * ```
 */
export function select<TSelectors extends ArrayWithAtLeastOneItem<ValidSelector>>(...selectors: TSelectors) {
  return createSelectorBuilderFromString(selectors, SurimiContext.root, SurimiContext.root);
}

/**
 * Define a set of re-usable styles.
 *
 * This is useful for defining styles that can be applied to multiple selectors.
 *
 * @example
 * ```ts
 * const buttonStyles = style({
 *   backgroundColor: 'blue',
 *   color: 'white',
 *   padding: '10px 20px',
 *   borderRadius: '5px',
 * });
 *
 * select('.buttonPrimary').use(buttonStyles);
 * select('.buttonSecondary').use(buttonStyles);
 */
export function style(styles: CssProperties): StyleBuilder {
  return new StyleBuilder(SurimiContext.root, styles);
}

/**
 * Create re-usable mixin selections. Select anything you would like to mix in,
 * like class names, IDs, element names, attributes, etc. just like with the main `select` function.
 *
 * Then, define styles on it using `style()`. Instead of being applied directly,
 * these styles can be applied to other selectors using the `use()` method
 * from builders that support styling.
 *
 * @example
 * ```ts
 * const underlineOnHover = mixin(':hover').style({
 *  textDecoration: 'underline',
 * });
 *
 * select('.link').use(underlineOnHover);
 * ```
 */
export function mixin<TSelectors extends ArrayWithAtLeastOneItem<ValidSelector>>(...selectors: TSelectors) {
  if (selectors.length === 0) {
    throw new Error('At least one selector must be provided');
  }
  if (typeof selectors[0] !== 'string') {
    throw new Error('Selector must be a string');
  }

  const joinedSelectors = joinSelectors(selectors);
  const selectorTokens = tokenize(joinedSelectors);

  return new MixinBuilder(selectorTokens, SurimiContext.root, SurimiContext.root);
}

/**
 * Create a media query builder to apply selections and styles within a media query.
 *
 * Use the returned MediaQueryBuilder to define the media query parameters using the provided methods,
 * and then select elements within the media query using the `select()` method.
 *
 * @example
 * ```ts
 * const mobileContainer = media()
 *   .minWidth('768px')
 *   .maxWidth('1024px')
 *   .select('.container');
 *
 * // The resulting builder will be `SelectorBuilder<"@media (min-width: 768px) (max-width: 1024px) ⤷ .container">`
 *
 * mobileContainer.style({
 *    padding: '20px',
 * });
 *
 * ```
 */
export function media() {
  return new MediaQueryBuilder<'@media'>(
    [{ type: 'at-rule-name', name: 'media', content: '@media' }],
    SurimiContext.root,
    SurimiContext.root,
  );
}

/**
 * Create a keyframes builder to define CSS keyframe animations.
 *
 * Use the returned KeyframesBuilder to define keyframe steps and their associated styles.
 *
 * @example
 * ```ts
 * const fadeIn = keyframes('fade-in')
 *   .at('0%', { opacity: 0 })
 *   .at('50%', { opacity: 0.25 })
 *   .at('100%', { opacity: 1 });
 *
 * // The resulting builder will be `KeyframesBuilder<"fade-in">`
 *
 * ```
 *
 * There are built-in short hand functions for `from` and `to` steps:
 *
 * ```ts
 * const slideIn = keyframes('slide-in')
 *   .from({ transform: 'translateX(-100%)' })
 *   .to({ transform: 'translateX(0)' });
 * ```
 */
export function keyframes(name: string, steps: KeyframeStepConfig = {}) {
  return new KeyframesBuilder(name, steps, SurimiContext.root, SurimiContext.root);
}

/**
 * Define a named CSS view transition.
 *
 * Ties together the element side (`view-transition-name`) and the four snapshot pseudo-elements
 * the browser generates on the document overlay (`::view-transition-old/new/group/image-pair`).
 * Those snapshots live on `:root`, not on your element - this builder hides that and keeps the
 * name in sync. The returned builder is also a value token that stringifies to the name.
 *
 * Note: surimi only emits CSS. Same-document (SPA) transitions still require a JS
 * `document.startViewTransition()` trigger; cross-document (MPA) transitions need
 * `viewTransition.navigation('auto')` and nothing else.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API
 *
 * @example
 * ```ts
 * const cardTransition = viewTransition('cardTransition');
 *
 * select('.card').use(cardTransition); // .card { view-transition-name: cardTransition }
 *
 * cardTransition
 *   .old({ animation: `${fadeOut} .3s ease both` })
 *   .new({ animation: `${fadeIn} .3s ease both` })
 *   .group({ animationDuration: '.5s' });
 * ```
 */
export function viewTransition<T extends string>(name: T) {
  return new ViewTransitionBuilder(name, SurimiContext.root, SurimiContext.root);
}

/**
 * Opt the current and destination documents into cross-document (MPA) view transitions
 * by emitting `@view-transition { navigation: auto }`.
 */
viewTransition.navigation = (navigation: ViewTransitionNavigation) =>
  new ViewTransitionAtRuleBuilder({ navigation }, SurimiContext.root, SurimiContext.root);

/**
 * Target every view-transition snapshot on the page via the universal `*` selector,
 * e.g. `::view-transition-group(*)`. Useful for global tweaks like disabling the default cross-fade.
 *
 * @example
 * ```ts
 * viewTransition.all().old({ animation: 'none' }).new({ animation: 'none' });
 * ```
 */
viewTransition.all = () => new ViewTransitionTargetBuilder('*', SurimiContext.root, SurimiContext.root);

/**
 * Target all snapshots that share a `view-transition-class`, e.g. `::view-transition-group(*.card)`.
 * Set the matching class on elements via `style({ viewTransitionClass: 'card' })`.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/view-transition-class
 *
 * @example
 * ```ts
 * select('.a', '.b').style({ viewTransitionClass: 'card' });
 * viewTransitionClass('card').group({ animationDuration: '.4s' });
 * ```
 */
export function viewTransitionClass(className: string) {
  return new ViewTransitionClassBuilder(className, SurimiContext.root, SurimiContext.root);
}

/**
 * Declare a \@font-face rule with the given properties.
 *
 * The returned FontFaceBuilder can be used as a CSS value representing the font-family name.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face
 *
 * @example
 * ```ts
 * import { fontFace } from 'surimi';
 *
 * const mainFont = fontFace({
 *   "font-family": "MyFont",
 *   "src": "url(/fonts/myfont.woff2)",
 *   "font-weight": "normal",
 *   "font-style": "normal",
 *   "unicode-range": "U+000-5FF",
 * });
 *
 * select('body').style({
 *  fontFamily: mainFont,
 * });
 *
 * ```
 */
export function fontFace(properties: FontFaceProperties) {
  return new FontFaceBuilder(properties, SurimiContext.root, SurimiContext.root);
}

/**
 * Create and register a custom CSS property.
 * You can pass either individual parameters or an options object.
 *
 * If not specified, `syntax` will default to `*` and `inherits` to `true`.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@property
 *
 * @param name The name to use for the custom property (a [dashed-indent](https://developer.mozilla.org/en-US/docs/Web/CSS/dashed-ident))
 * @param syntax Any supported syntax value, see ([syntax](https://developer.mozilla.org/en-US/docs/Web/CSS/@property/syntax))
 * @param inherits Whether the property inherits its value from its parent, see ([inherits](https://developer.mozilla.org/en-US/docs/Web/CSS/@property/inherits))
 * @param initialValue The initial value of the property, see ([initial-value](https://developer.mozilla.org/en-US/docs/Web/CSS/@property/initial-value))
 */
export function property<TValue = string & {}>(
  name: string,
  initialValue: TValue,
  syntax?: string,
  inherits?: boolean,
): CustomPropertyBuilder<TValue>;
export function property<TValue = string & {}>(options: {
  name: string;
  initialValue: TValue;
  syntax?: string;
  inherits?: boolean;
  register?: boolean;
}): CustomPropertyBuilder<TValue>;
export function property<TValue = string & {}>(
  nameOrOptions:
    | string
    | {
        name: string;
        initialValue: TValue;
        syntax?: string;
        inherits?: boolean;
        register?: boolean;
      },
  initialValue?: TValue,
  syntax = '*',
  inherits = true,
): CustomPropertyBuilder<TValue> {
  if (typeof nameOrOptions === 'string') {
    if (initialValue == null || syntax == null || inherits == null) {
      throw new Error('Missing parameter(s)');
    }

    return new CustomPropertyBuilder(SurimiContext.root, nameOrOptions, {
      syntax,
      inherits,
      initialValue,
    });
  } else {
    const { name, syntax = '*', inherits = true, initialValue, register } = nameOrOptions;
    const options: {
      syntax: string;
      inherits: boolean;
      initialValue: TValue;
      register?: boolean;
    } = { syntax, inherits, initialValue };

    if (register !== undefined) {
      options.register = register;
    }

    return new CustomPropertyBuilder(SurimiContext.root, name, options);
  }
}

/**
 * Create a container query builder to apply selections and styles within a container query.
 *
 * Use the returned ContainerQueryBuilder to define the container query parameters using the provided methods,
 * and then select elements within the container query using the `select()` method.
 *
 * @example
 * ```ts
 * const mobileContainer = container().name('my-container').minWidth('768px').maxWidth('1024px').select('.container');
 *
 * // The resulting builder will be `SelectorBuilder<"@container my-container (min-width: 768px) (max-width: 1024px) ⤷ .container">`
 *
 * mobileContainer.style({
 *    padding: '20px',
 * });
 * ```
 */
export function container() {
  return new ContainerQueryBuilder<'@container'>(
    [{ type: 'at-rule-name', name: 'container', content: '@container' }],
    SurimiContext.root,
    SurimiContext.root,
  );
}
