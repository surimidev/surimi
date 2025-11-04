import postcss from 'postcss';

import { SurimiBase, SurimiContext } from '#surimi';

export class CustomProperty<TValue> extends SurimiBase {
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
    this._postcssRoot.prepend(rule);
  }

  public toString() {
    return `var(${this.name})`;
  }

  public build() {
    return this.toString();
  }
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
): CustomProperty<TValue>;
export function property<TValue = string & {}>(options: {
  name: string;
  initialValue: TValue;
  syntax?: string;
  inherits?: boolean;
}): CustomProperty<TValue>;
export function property<TValue = string & {}>(
  nameOrOptions:
    | string
    | {
        name: string;
        initialValue: TValue;
        syntax?: string;
        inherits?: boolean;
      },
  initialValue?: TValue,
  syntax = '*',
  inherits = true,
): CustomProperty<TValue> {
  if (typeof nameOrOptions === 'string') {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- runtime check
    if (initialValue == null || syntax == null || inherits == null) {
      throw new Error('Missing parameter(s)');
    }

    return new CustomProperty(SurimiContext.root, nameOrOptions, syntax, inherits, initialValue);
  } else {
    const { name, syntax = '*', inherits = true, initialValue } = nameOrOptions;
    return new CustomProperty(SurimiContext.root, name, syntax, inherits, initialValue);
  }
}

/**
 * Pre-defined CSS property syntaxes with their descriptions
 */
const CSS_SYNTAXES = {
  angle: '<angle>',
  color: '<color>',
  image: '<image>',
  integer: '<integer>',
  length: '<length>',
  number: '<number>',
  percentage: '<percentage>',
  resolution: '<resolution>',
  string: '<string>',
  time: '<time>',
  url: '<url>',
} as const;

/**
 * Factory function to create typed property helper functions
 */
function createPropertyHelper(syntaxKey: keyof typeof CSS_SYNTAXES) {
  const syntax = CSS_SYNTAXES[syntaxKey];

  function helper<TValue = string & {}>(name: string, initialValue: TValue, inherits?: boolean): CustomProperty<TValue>;
  function helper<TValue = string & {}>(options: {
    name: string;
    initialValue: TValue;
    inherits?: boolean;
  }): CustomProperty<TValue>;
  function helper<TValue = string & {}>(
    nameOrOptions:
      | string
      | {
          name: string;
          initialValue: TValue;
          inherits?: boolean;
        },
    initialValue?: TValue,
    inherits = true,
  ): CustomProperty<TValue> {
    if (typeof nameOrOptions === 'string') {
      if (initialValue == null) {
        throw new Error('Initial value must be provided');
      }
      return property(nameOrOptions, initialValue, syntax, inherits);
    } else {
      const { name, initialValue, inherits = true } = nameOrOptions;
      return property(name, initialValue, syntax, inherits);
    }
  }

  // Add JSDoc to the function
  Object.defineProperty(helper, 'name', { value: syntaxKey });

  return helper;
}

/**
 * Helper to create a custom CSS angle property.
 * This is a shorthand for `property()` with the syntax set to `<angle>`.
 *
 * For more info, see the main `property()` function: {@link property}.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/angle
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@property
 */
export const angle = createPropertyHelper('angle');

/**
 * Helper to create a custom CSS color property.
 * This is a shorthand for `property()` with the syntax set to `<color>`.
 *
 * For more info, see the main `property()` function: {@link property}.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/color_value
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@property
 */
export const color = createPropertyHelper('color');

/**
 * Helper to create a custom CSS image property.
 * This is a shorthand for `property()` with the syntax set to `<image>`.
 *
 * For more info, see the main `property()` function: {@link property}.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/image
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@property
 */
export const image = createPropertyHelper('image');

/**
 * Helper to create a custom CSS integer property.
 * This is a shorthand for `property()` with the syntax set to `<integer>`.
 *
 * For more info, see the main `property()` function: {@link property}.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/integer
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@property
 */
export const integer = createPropertyHelper('integer');

/**
 * Helper to create a custom CSS length property.
 * This is a shorthand for `property()` with the syntax set to `<length>`.
 *
 * For more info, see the main `property()` function: {@link property}.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/length
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@property
 */
export const length = createPropertyHelper('length');

/**
 * Helper to create a custom CSS number property.
 * This is a shorthand for `property()` with the syntax set to `<number>`.
 *
 * For more info, see the main `property()` function: {@link property}.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/number
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@property
 */
export const number = createPropertyHelper('number');

/**
 * Helper to create a custom CSS percentage property.
 * This is a shorthand for `property()` with the syntax set to `<percentage>`.
 *
 * For more info, see the main `property()` function: {@link property}.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/percentage
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@property
 */
export const percentage = createPropertyHelper('percentage');

/**
 * Helper to create a custom CSS resolution property.
 * This is a shorthand for `property()` with the syntax set to `<resolution>`.
 *
 * For more info, see the main `property()` function: {@link property}.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/resolution
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@property
 */
export const resolution = createPropertyHelper('resolution');

/**
 * Helper to create a custom CSS string property.
 * This is a shorthand for `property()` with the syntax set to `<string>`.
 *
 * For more info, see the main `property()` function: {@link property}.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/string
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@property
 */
export const string = createPropertyHelper('string');

/**
 * Helper to create a custom CSS time property.
 * This is a shorthand for `property()` with the syntax set to `<time>`.
 *
 * For more info, see the main `property()` function: {@link property}.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/time
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@property
 */
export const time = createPropertyHelper('time');

/**
 * Helper to create a custom CSS url property.
 * This is a shorthand for `property()` with the syntax set to `<url>`.
 *
 * For more info, see the main `property()` function: {@link property}.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/url_value
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@property
 */
export const url = createPropertyHelper('url');
