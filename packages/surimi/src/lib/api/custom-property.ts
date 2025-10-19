import { Surimi } from '#surimi';

export class CustomProperty<TValue> {
  public readonly name: string;
  public readonly syntax: string;
  public readonly inherits: boolean;
  public readonly initialValue: TValue;

  constructor(name: string, syntax: string, inherits: boolean, initialValue: TValue) {
    const angleWrappedSyntax = syntax.startsWith('<') && syntax.endsWith('>') ? syntax : `<${syntax}>`;

    this.name = name.startsWith('--') ? name : `--${name}`;
    this.syntax = angleWrappedSyntax;
    this.inherits = inherits;
    this.initialValue = initialValue;

    Surimi.registerCustomProperty(this);
  }

  public toString(): string {
    return `var(${this.name})`;
  }
}

/**
 * Create and register a custom CSS property.
 * You can pass either individual parameters or an options object.
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
  syntax: string,
  inherits: boolean,
  initialValue: TValue,
): CustomProperty<TValue>;
export function property<TValue = string & {}>(options: {
  name: string;
  syntax: string;
  inherits: boolean;
  initialValue: TValue;
}): CustomProperty<TValue>;
export function property<TValue = string & {}>(
  nameOrOptions:
    | string
    | {
        name: string;
        syntax: string;
        inherits: boolean;
        initialValue: TValue;
      },
  syntax?: string,
  inherits?: boolean,
  initialValue?: TValue,
): CustomProperty<TValue> {
  if (typeof nameOrOptions === 'string') {
    return new CustomProperty(nameOrOptions, syntax!, inherits!, initialValue!);
  } else {
    const { name, syntax, inherits, initialValue } = nameOrOptions;
    return new CustomProperty(name, syntax, inherits, initialValue);
  }
}

property({
  name: 'example-color',
  syntax: '<color>',
  inherits: false,
  initialValue: 'black',
});
