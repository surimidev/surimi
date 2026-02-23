import { atRule, decl, type CssRoot } from '@surimi/ast';
import { SurimiBase } from '@surimi/common';

export class CustomPropertyBuilder<TValue> extends SurimiBase {
  public readonly name: string;
  public readonly syntax: string;
  public readonly inherits: boolean;
  public readonly initialValue: TValue;

  constructor(root: CssRoot, name: string, syntax: string, inherits: boolean, initialValue: TValue) {
    super(root);

    const angleWrappedSyntax = syntax.startsWith('<') && syntax.endsWith('>') ? syntax : `<${syntax}>`;

    this.name = name.startsWith('--') ? name : `--${name}`;
    this.syntax = angleWrappedSyntax;
    this.inherits = inherits;
    this.initialValue = initialValue;

    this.register();
  }

  protected register() {
    const atRuleNode = atRule({ name: 'property', params: this.name });
    atRuleNode.append(
      decl({ prop: 'syntax', value: `'${this.syntax}'` }),
      decl({ prop: 'inherits', value: String(this.inherits) }),
      decl({ prop: 'initial-value', value: String(this.initialValue) }),
    );
    this._cssRoot.append(atRuleNode);
  }

  public toString() {
    return `var(${this.name})`;
  }

  public build() {
    return this.toString();
  }
}
