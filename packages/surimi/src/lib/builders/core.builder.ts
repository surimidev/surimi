import postcss from 'postcss';

import { stringify, type Token } from '@surimi/parsers';

import { SurimiBase } from '#surimi';

/**
 * Core builder class that provides access to the PostCSS root and builder context.
 */
export abstract class CoreBuilder<TContext extends Token[] = []> extends SurimiBase {
  protected _context: TContext;
  protected _postcssContainer: postcss.Container;

  public constructor(context: TContext, container: postcss.Container, root: postcss.Root) {
    super(root);

    this._context = context;
    this._postcssContainer = container;
  }

  public build(): string {
    return stringify(this._context);
  }

  /**
   * Get the PostCSS rule for the given selector from the appropriate container if it exists.
   */
  protected getRule(selector: string): postcss.Rule | undefined {
    return this._postcssContainer.nodes?.find(
      (node): node is postcss.Rule => node.type === 'rule' && node.selector === selector,
    );
  }

  /**
   * Get or create the PostCSS rule container for the current selector context.
   * Used, for example, by the `style()` method to apply CSS properties to the parent container (or the postcss root).
   *
   * If no existing rule is found for the current selector context, a new one is created and appended to the appropriate container.
   *
   * @returns The PostCSS rule for the current selector context.
   */
  protected getOrCreateRule(): postcss.Rule {
    const selector = stringify(this._context);

    if (!selector) {
      throw new Error('Error while creating CSS selector from builder context');
    }

    let rule = this.getRule(selector);
    if (!rule) {
      rule = postcss.rule({ selector });
      this._postcssContainer.append(rule);
    }

    return rule;
  }
}
