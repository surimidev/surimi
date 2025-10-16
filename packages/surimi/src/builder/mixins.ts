import type postcss from 'postcss';

import type {
  BuilderContext,
  CSSProperties,
  ExtractSelector,
  WithContextualSelector,
  WithPseudoClass,
  WithPseudoElement,
} from '../types';
import { createDeclarations } from './utils';

/**
 * Utility functions for pseudo-class operations
 */
export function addPseudoClassToContext(context: BuilderContext, pseudoClass: string): BuilderContext {
  return {
    ...context,
    pseudoClasses: [...context.pseudoClasses, pseudoClass],
  };
}

export function addPseudoElementToContext(context: BuilderContext, pseudoElement: string): BuilderContext {
  return {
    ...context,
    pseudoElements: [...context.pseudoElements, pseudoElement],
  };
}

/**
 * Base mixin for pseudo-class functionality
 */
export abstract class PseudoClassMixin<TContext extends string = string> {
  protected abstract context: BuilderContext;
  protected abstract postcssRoot: postcss.Root;
  protected abstract createNewInstance<TNewContext extends string>(
    newContext: BuilderContext,
  ): PseudoClassMixin<TNewContext>;

  /**
   * Add :hover pseudo-class to the selector
   */
  hover(): PseudoClassMixin<WithContextualSelector<TContext, WithPseudoClass<ExtractSelector<TContext>, 'hover'>>> {
    return this.addPseudoClass('hover');
  }

  /**
   * Add :focus pseudo-class to the selector
   */
  focus(): PseudoClassMixin<WithContextualSelector<TContext, WithPseudoClass<ExtractSelector<TContext>, 'focus'>>> {
    return this.addPseudoClass('focus');
  }

  /**
   * Add :active pseudo-class to the selector
   */
  active(): PseudoClassMixin<WithContextualSelector<TContext, WithPseudoClass<ExtractSelector<TContext>, 'active'>>> {
    return this.addPseudoClass('active');
  }

  /**
   * Add :disabled pseudo-class to the selector
   */
  disabled(): PseudoClassMixin<
    WithContextualSelector<TContext, WithPseudoClass<ExtractSelector<TContext>, 'disabled'>>
  > {
    return this.addPseudoClass('disabled');
  }

  /**
   * Add :is() pseudo-class
   */
  is<TSelector extends string>(
    selector: TSelector,
  ): PseudoClassMixin<
    WithContextualSelector<TContext, WithPseudoClass<ExtractSelector<TContext>, `is(${TSelector})`>>
  > {
    return this.addPseudoClass(`is(${selector})`);
  }

  /**
   * Add :has() pseudo-class
   */
  has<TSelector extends string>(
    selector: TSelector,
  ): PseudoClassMixin<
    WithContextualSelector<TContext, WithPseudoClass<ExtractSelector<TContext>, `has(${TSelector})`>>
  > {
    return this.addPseudoClass(`has(${selector})`);
  }

  /**
   * Add :where() pseudo-class
   */
  where<TSelector extends string>(
    selector: TSelector,
  ): PseudoClassMixin<
    WithContextualSelector<TContext, WithPseudoClass<ExtractSelector<TContext>, `where(${TSelector})`>>
  > {
    return this.addPseudoClass(`where(${selector})`);
  }

  /**
   * Add :not() pseudo-class
   */
  not<TSelector extends string>(
    selector: TSelector,
  ): PseudoClassMixin<
    WithContextualSelector<TContext, WithPseudoClass<ExtractSelector<TContext>, `not(${TSelector})`>>
  > {
    return this.addPseudoClass(`not(${selector})`);
  }

  /**
   * Add :nth-child() pseudo-class
   */
  nthChild<TValue extends number | string>(
    value: TValue,
  ): PseudoClassMixin<
    WithContextualSelector<TContext, WithPseudoClass<ExtractSelector<TContext>, `nth-child(${TValue})`>>
  > {
    return this.addPseudoClass(`nth-child(${String(value)})`);
  }

  /**
   * Add :first-child pseudo-class
   */
  firstChild(): PseudoClassMixin<
    WithContextualSelector<TContext, WithPseudoClass<ExtractSelector<TContext>, 'first-child'>>
  > {
    return this.addPseudoClass('first-child');
  }

  /**
   * Add :last-child pseudo-class
   */
  lastChild(): PseudoClassMixin<
    WithContextualSelector<TContext, WithPseudoClass<ExtractSelector<TContext>, 'last-child'>>
  > {
    return this.addPseudoClass('last-child');
  }

  /**
   * Add :nth-of-type() pseudo-class
   */
  nthOfType<TValue extends number | string>(
    value: TValue,
  ): PseudoClassMixin<
    WithContextualSelector<TContext, WithPseudoClass<ExtractSelector<TContext>, `nth-of-type(${TValue})`>>
  > {
    return this.addPseudoClass(`nth-of-type(${String(value)})`);
  }

  protected addPseudoClass(pseudoClass: string) {
    const newContext = {
      ...this.context,
      pseudoClasses: [...this.context.pseudoClasses, pseudoClass],
    };
    return this.createNewInstance(newContext);
  }
}

/**
 * Base mixin for pseudo-element functionality
 */
export abstract class PseudoElementMixin<TContext extends string = string> {
  protected abstract context: BuilderContext;
  protected abstract postcssRoot: postcss.Root;
  protected abstract createNewInstance<TNewContext extends string>(
    newContext: BuilderContext,
  ): PseudoElementMixin<TNewContext>;

  /**
   * Add ::before pseudo-element to the selector
   */
  before(): PseudoElementMixin<
    WithContextualSelector<TContext, WithPseudoElement<ExtractSelector<TContext>, 'before'>>
  > {
    return this.addPseudoElement('before');
  }

  /**
   * Add ::after pseudo-element to the selector
   */
  after(): PseudoElementMixin<WithContextualSelector<TContext, WithPseudoElement<ExtractSelector<TContext>, 'after'>>> {
    return this.addPseudoElement('after');
  }

  protected addPseudoElement(pseudoElement: string) {
    const newContext = {
      ...this.context,
      pseudoElements: [...this.context.pseudoElements, pseudoElement],
    };
    return this.createNewInstance(newContext);
  }
}

/**
 * Base mixin for styling functionality
 */
export abstract class StyleMixin<TContext extends string = string, TResetType = unknown> {
  protected abstract context: BuilderContext;
  protected abstract postcssRoot: postcss.Root;
  // The TContext type parameter is used to track the selector context in subclasses
  // Allow subclasses to return their own type with reset context
  protected abstract createResetInstance(): TResetType;
  protected abstract getOrCreateRule(): postcss.Rule;

  /**
   * Apply CSS properties to the current selector
   * Returns the base selector context by resetting pseudo-classes/elements
   */
  style(properties: CSSProperties): TResetType {
    const rule = this.getOrCreateRule();
    const declarations = createDeclarations(properties);
    declarations.forEach(decl => rule.append(decl));

    // Return new instance with reset context (clearing pseudo-classes/elements)
    // This preserves the base selector but resets the pseudo-state
    return this.createResetInstance();
  }
}
