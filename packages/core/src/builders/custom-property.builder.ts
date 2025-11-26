import postcss from 'postcss';

import { SurimiBase } from '@surimi/common';

export class CustomPropertyBuilder<TValue> extends SurimiBase {
  public readonly name: string;
  public readonly syntax: string;
  public readonly inherits: boolean;
  public readonly initialValue: TValue;

  constructor(root: postcss.Root, name: string, syntax: string, inherits: boolean, initialValue: TValue) {
    super(root);

    const angleWrappedSyntax = syntax.startsWith('<') && syntax.endsWith('>') ? syntax : `<${syntax}>`;

    this.name = name.startsWith('--') ? name : `--${name}`;
    this.syntax = angleWrappedSyntax;
    this.inherits = inherits;
    this.initialValue = initialValue;

    this.register();
  }

  protected register() {
    const rule = postcss.atRule({
      name: 'property',
      params: this.name,
    });

    const declarations = [
      postcss.decl({ prop: 'syntax', value: `'${this.syntax}'` }),
      postcss.decl({ prop: 'inherits', value: String(this.inherits) }),
      postcss.decl({ prop: 'initial-value', value: String(this.initialValue) }),
    ];

    rule.append(declarations);
    this._postcssRoot.append(rule);
  }

  public toString() {
    return `var(${this.name})`;
  }

  public build() {
    return this.toString();
  }
}
