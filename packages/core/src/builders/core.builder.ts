import { rule, type CssContainer, type CssRoot, type CssRule } from '@surimi/ast';
import { SurimiBase } from '@surimi/common';
import { stringify, type Token } from '@surimi/parsers';

export abstract class CoreBuilder<TContext extends Token[] = []> extends SurimiBase {
  protected _context: TContext;
  protected _container: CssContainer;

  public constructor(context: TContext, container: CssContainer, root: CssRoot) {
    super(root);

    this._context = context;
    this._container = container;
  }

  public build(): string {
    return stringify(this._context);
  }

  protected getRule(selector: string): CssRule | undefined {
    return this._container.nodes.find((node): node is CssRule => node.type === 'rule' && node.selector === selector);
  }

  protected getOrCreateRule(): CssRule {
    const selector = stringify(this._context);

    if (!selector) {
      throw new Error('Error while creating CSS selector from builder context');
    }

    let ruleNode = this.getRule(selector);
    if (!ruleNode) {
      ruleNode = rule({ selector });
      this._container.append(ruleNode);
    }

    return ruleNode;
  }
}
