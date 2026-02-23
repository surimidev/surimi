import type { CssContainer, CssRoot } from '@surimi/ast';
import type { CssProperties, ValidSelector } from '@surimi/common';
import { CoreBuilder, createDeclarationsFromProperties, StyleBuilder, type SelectorBuilder } from '@surimi/core';
import type { Tokenize } from '@surimi/parsers';
import { tokenize } from '@surimi/parsers';

/**
 * Represents a single condition in a conditional selector.
 * Extensible for future condition types.
 */
interface Condition {
  /** The type of condition */
  type: 'pseudo-class' | 'negated-pseudo-class';
  /** The pseudo-class name (e.g., 'hover', 'focus') */
  value: string;
  /** Optional parameters for parameterized pseudo-classes */
  params?: string | number;
}

/**
 * Represents a group of conditions combined with AND logic.
 * Multiple groups are combined with OR logic.
 */
interface ConditionGroup {
  conditions: Condition[];
}

/**
 * Builder for creating conditional selectors that target elements based on state of other elements.
 * Provides methods for selecting elements and applying styles based on conditional state.
 *
 * This is returned after calling a pseudo-class method on ConditionalBuilder.
 */
export class ConditionalSelectorBuilder<TCondition extends string> extends CoreBuilder<Tokenize<TCondition>> {
  /**
   * Select an element that should be styled when the condition is met.
   * Uses html as the container for :has() to ensure it works with any DOM structure.
   *
   * @example
   * when('.button').hovered().select('.container').style({ color: 'red' })
   * // generates: :where(html):has(.button:hover) .container { color: red }
   */
  public select<TSelector extends ValidSelector>(
    selector: TSelector | SelectorBuilder<TSelector>,
  ): ConditionalSelectorBuilder<`:where(html):has(${TCondition}) ${TSelector}`> {
    const selectorString = typeof selector === 'string' ? selector : selector.build();

    if (!selectorString || selectorString.trim() === '') {
      throw new Error('Target selector cannot be empty');
    }

    const conditionString = this.build();

    const newSelector = `:where(html):has(${conditionString}) ${selectorString}` as const;
    const newContext = tokenize(newSelector);

    return new ConditionalSelectorBuilder<typeof newSelector>(newContext, this._container, this._cssRoot);
  }

  /**
   * Apply CSS properties to the conditional selector.
   * Creates the necessary PostCSS rule and declarations.
   */
  public style(styles: CssProperties | StyleBuilder): this {
    if (styles instanceof StyleBuilder) {
      return this.style(styles.build());
    }

    const rule = this.getOrCreateRule();
    const declarations = createDeclarationsFromProperties(styles);
    declarations.forEach(decl => rule.append(decl));

    return this;
  }
}

/**
 * Builder for creating conditional selectors.
 * Tracks a base selector and provides pseudo-class methods to add conditions.
 *
 * Use this to define "when X happens to element Y" conditions.
 */
export class ConditionalBuilder<TSelector extends string> extends CoreBuilder<Tokenize<TSelector>> {
  /** Groups of conditions combined with OR logic */
  protected conditionGroups: ConditionGroup[] = [{ conditions: [] }];
  /** Index of the current condition group */
  protected currentGroupIndex = 0;

  /**
   * Clone the condition state for creating independent branches.
   * @internal
   */
  protected cloneConditionState(): { groups: ConditionGroup[]; index: number } {
    return {
      groups: this.conditionGroups.map(group => ({
        conditions: [...group.conditions],
      })),
      index: this.currentGroupIndex,
    };
  }

  /**
   * Create a new builder with cloned state.
   * @internal
   */
  protected cloneWithState(groups: ConditionGroup[], index: number): ConditionalBuilder<TSelector> {
    const newBuilder = new ConditionalBuilder<TSelector>(this._context, this._container, this._cssRoot);
    newBuilder.conditionGroups = groups;
    newBuilder.currentGroupIndex = index;
    return newBuilder;
  }

  /**
   * Get the internal context (for ChainableConditionalBuilder).
   * @internal
   */
  public getContext(): Tokenize<TSelector> {
    return this._context;
  }

  /**
   * Get the internal CSS container (for ChainableConditionalBuilder).
   * @internal
   */
  public getContainer(): CssContainer {
    return this._container;
  }

  /**
   * Get the internal CSS root (for ChainableConditionalBuilder).
   * @internal
   */
  public getRoot(): CssRoot {
    return this._cssRoot;
  }

  /**
   * Get the condition groups (for NegatedConditionalBuilder).
   * @internal
   */
  public getConditionGroups(): ConditionGroup[] {
    return this.conditionGroups;
  }

  /**
   * Get the current group index (for NegatedConditionalBuilder).
   * @internal
   */
  public getCurrentGroupIndex(): number {
    return this.currentGroupIndex;
  }

  /**
   * Add a condition to the current group.
   * Creates a new builder with cloned state to ensure independence.
   */
  protected addCondition(condition: Condition): ChainableConditionalBuilder<TSelector> {
    // Clone the current state
    const { groups, index } = this.cloneConditionState();

    // Add the new condition to the cloned state
    const currentGroup = groups[index];
    if (!currentGroup) {
      throw new Error('Invalid condition group state');
    }
    currentGroup.conditions.push(condition);

    // Create a new builder with the updated state
    const newBuilder = this.cloneWithState(groups, index);
    return new ChainableConditionalBuilder(newBuilder);
  }

  /**
   * Start a new OR group.
   * Creates a new builder with cloned state to ensure independence.
   * @internal Called by ChainableConditionalBuilder.or
   */
  public startOrGroup(): ConditionalBuilder<TSelector> {
    // Clone the current state
    const { groups, index } = this.cloneConditionState();

    // Start new OR group
    const newIndex = index + 1;
    groups[newIndex] = { conditions: [] };

    // Create a new builder with the updated state
    return this.cloneWithState(groups, newIndex);
  }

  /**
   * Build the condition string from accumulated conditions.
   * Multiple condition groups are combined with commas (OR logic).
   * Conditions within a group are concatenated (AND logic).
   * @internal Called by ChainableConditionalBuilder.select()
   */
  public buildConditionString(): string {
    const baseSelector = this.build();

    return this.conditionGroups
      .map(group => {
        const conditionStr = group.conditions
          .map(c => {
            if (c.type === 'negated-pseudo-class') {
              return `:not(:${c.value}${c.params !== undefined ? `(${c.params})` : ''})`;
            } else {
              return `:${c.value}${c.params !== undefined ? `(${c.params})` : ''}`;
            }
          })
          .join('');
        return `${baseSelector}${conditionStr}`;
      })
      .join(', ');
  }

  // Common pseudo-class methods - named to read like conditions
  public hovered = () => this.addCondition({ type: 'pseudo-class', value: 'hover' });
  public focused = () => this.addCondition({ type: 'pseudo-class', value: 'focus' });
  public active = () => this.addCondition({ type: 'pseudo-class', value: 'active' });
  public visited = () => this.addCondition({ type: 'pseudo-class', value: 'visited' });
  public checked = () => this.addCondition({ type: 'pseudo-class', value: 'checked' });
  public disabled = () => this.addCondition({ type: 'pseudo-class', value: 'disabled' });
  public enabled = () => this.addCondition({ type: 'pseudo-class', value: 'enabled' });
  public focusedWithin = () => this.addCondition({ type: 'pseudo-class', value: 'focus-within' });
  public focusedVisible = () => this.addCondition({ type: 'pseudo-class', value: 'focus-visible' });
  public valid = () => this.addCondition({ type: 'pseudo-class', value: 'valid' });
  public invalid = () => this.addCondition({ type: 'pseudo-class', value: 'invalid' });
  public required = () => this.addCondition({ type: 'pseudo-class', value: 'required' });
  public optional = () => this.addCondition({ type: 'pseudo-class', value: 'optional' });
  public readOnly = () => this.addCondition({ type: 'pseudo-class', value: 'read-only' });
  public readWrite = () => this.addCondition({ type: 'pseudo-class', value: 'read-write' });
  public placeholderShown = () => this.addCondition({ type: 'pseudo-class', value: 'placeholder-shown' });
  public defaulted = () => this.addCondition({ type: 'pseudo-class', value: 'default' });
  public indeterminate = () => this.addCondition({ type: 'pseudo-class', value: 'indeterminate' });
  public blank = () => this.addCondition({ type: 'pseudo-class', value: 'blank' });
  public empty = () => this.addCondition({ type: 'pseudo-class', value: 'empty' });
  public targeted = () => this.addCondition({ type: 'pseudo-class', value: 'target' });
  public firstChild = () => this.addCondition({ type: 'pseudo-class', value: 'first-child' });
  public lastChild = () => this.addCondition({ type: 'pseudo-class', value: 'last-child' });
  public onlyChild = () => this.addCondition({ type: 'pseudo-class', value: 'only-child' });
  public firstOfType = () => this.addCondition({ type: 'pseudo-class', value: 'first-of-type' });
  public lastOfType = () => this.addCondition({ type: 'pseudo-class', value: 'last-of-type' });
  public onlyOfType = () => this.addCondition({ type: 'pseudo-class', value: 'only-of-type' });

  // Pseudo-classes with parameters
  public nthChild = (value: string | number) =>
    this.addCondition({ type: 'pseudo-class', value: 'nth-child', params: value });
  public nthLastChild = (value: string | number) =>
    this.addCondition({ type: 'pseudo-class', value: 'nth-last-child', params: value });
  public nthOfType = (value: string | number) =>
    this.addCondition({ type: 'pseudo-class', value: 'nth-of-type', params: value });
  public nthLastOfType = (value: string | number) =>
    this.addCondition({ type: 'pseudo-class', value: 'nth-last-of-type', params: value });
  public excluding = (selector: string) => this.addCondition({ type: 'pseudo-class', value: 'not', params: selector });
  public matches = (selector: string) => this.addCondition({ type: 'pseudo-class', value: 'is', params: selector });
  public where = (selector: string) => this.addCondition({ type: 'pseudo-class', value: 'where', params: selector });
  public contains = (selector: string) => this.addCondition({ type: 'pseudo-class', value: 'has', params: selector });
  public inLanguage = (lang: string) => this.addCondition({ type: 'pseudo-class', value: 'lang', params: lang });
  public inDirection = (dir: 'rtl' | 'ltr') => this.addCondition({ type: 'pseudo-class', value: 'dir', params: dir });

  /**
   * Chainable property for more natural conditional syntax.
   * Provides access to all pseudo-class methods with 'is' prefix.
   *
   * @example
   * when('.button').is.hovered().select('.container').style({ color: 'red' })
   * when('.item').is.firstChild().select('.list').style({ fontWeight: 'bold' })
   */
  public get is() {
    return this;
  }

  /**
   * Negates the next pseudo-class method call.
   * Wraps the pseudo-class in :not().
   *
   * @example
   * when('.button').not.active().select('.container').style({ opacity: '1' })
   * // Generates: :where(html):has(.button:not(:active)) .container
   *
   * @example
   * when('.item').is.not.firstChild().select('.list').style({ marginTop: '1rem' })
   * // Generates: :where(html):has(.item:not(:first-child)) .list
   */
  public get not(): NegatedConditionalBuilder<TSelector> {
    return new NegatedConditionalBuilder<TSelector>(this._context, this._container, this._cssRoot, this);
  }
}

/**
 * Chainable builder returned after adding a condition.
 * Provides .and, .or, .not properties and .select() method.
 */
export class ChainableConditionalBuilder<TSelector extends string> {
  constructor(private builder: ConditionalBuilder<TSelector>) {}

  /**
   * Continue adding conditions with AND logic (default behavior).
   * Conditions are concatenated: .button:hover:focus
   *
   * @example
   * when('.button').hovered().and.focused().select('.container')
   * // Generates: :where(html):has(.button:hover:focus) .container
   */
  public get and(): ConditionalBuilder<TSelector> {
    return this.builder;
  }

  /**
   * Start a new condition group with OR logic.
   * Creates comma-separated selectors: .button:hover, .button:focus
   *
   * @example
   * when('.button').hovered().or.focused().select('.container')
   * // Generates: :where(html):has(.button:hover, .button:focus) .container
   */
  public get or(): ConditionalBuilder<TSelector> {
    return this.builder.startOrGroup();
  }

  /**
   * Negate the next condition.
   *
   * @example
   * when('.button').hovered().and.not.disabled().select('.container')
   * // Generates: :where(html):has(.button:hover:not(:disabled)) .container
   */
  public get not(): NegatedConditionalBuilder<TSelector> {
    return new NegatedConditionalBuilder<TSelector>(
      this.builder.getContext(),
      this.builder.getContainer(),
      this.builder.getRoot(),
      this.builder,
    );
  }

  /**
   * Finalize the conditions and select the target element to style.
   * Uses html as the container for :has() to ensure it works with any DOM structure.
   *
   * @example
   * when('.button').hovered().select('.container').style({ color: 'red' })
   * // Generates: :where(html):has(.button:hover) .container { color: red }
   */
  public select<TTargetSelector extends ValidSelector>(
    selector: TTargetSelector | SelectorBuilder<TTargetSelector>,
  ): ConditionalSelectorBuilder<`:where(html):has(${string}) ${TTargetSelector}`> {
    const selectorString = typeof selector === 'string' ? selector : selector.build();

    if (!selectorString || selectorString.trim() === '') {
      throw new Error('Target selector cannot be empty');
    }

    const conditionString = this.builder.buildConditionString();

    // Use html as the container and target selector as a descendant
    const newSelector =
      `:where(html):has(${conditionString}) ${selectorString}` as `:where(html):has(${string}) ${TTargetSelector}`;
    const newContext = tokenize(newSelector);

    return new ConditionalSelectorBuilder(
      newContext,
      this.builder.getContainer(),
      this.builder.getRoot(),
    );
  }
}

/**
 * Negated variant of ConditionalBuilder that wraps pseudo-classes in :not().
 * Created when accessing the `.not` property.
 */
class NegatedConditionalBuilder<TSelector extends string> extends ConditionalBuilder<TSelector> {
  constructor(
    context: Tokenize<TSelector>,
    container: CssContainer,
    root: CssRoot,
    private parentBuilder: ConditionalBuilder<TSelector>,
  ) {
    super(context, container, root);
    // Share the same condition tracking state with parent
    this.conditionGroups = parentBuilder.getConditionGroups();
    this.currentGroupIndex = parentBuilder.getCurrentGroupIndex();
  }

  /**
   * Override to add negated conditions
   */
  protected override addCondition(condition: Condition): ChainableConditionalBuilder<TSelector> {
    // Convert to negated type
    const negatedCondition: Condition = {
      ...condition,
      type: 'negated-pseudo-class',
    };
    this.conditionGroups[this.currentGroupIndex]?.conditions.push(negatedCondition);
    return new ChainableConditionalBuilder(this.parentBuilder);
  }
}
