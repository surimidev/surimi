import postcss from 'postcss';

import type { CustomProperty } from '#lib/api/custom-property';
import { _select } from '#lib/api/index';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class Surimi {
  public static root: postcss.Root = postcss.root();

  public static registerCustomProperty<TValue>(customProperty: CustomProperty<TValue>): void {
    const rule = postcss.atRule({
      name: 'property',
      params: customProperty.name,
    });

    const declarations = [
      postcss.decl({ prop: 'syntax', value: `'${customProperty.syntax}'` }),
      postcss.decl({ prop: 'inherits', value: String(customProperty.inherits) }),
      postcss.decl({ prop: 'initial-value', value: String(customProperty.initialValue) }),
    ];

    rule.append(declarations);
    Surimi.root.append(rule);
  }

  public static clear() {
    Surimi.root = postcss.root();
  }

  public static build() {
    return Surimi.root.toString();
  }
}
