import type { DataType } from 'csstype';

type LengthUnit =
  | 'px'
  | 'cm'
  | 'mm'
  | 'Q'
  | 'in'
  | 'pc'
  | 'pt'
  | 'em'
  | 'rem'
  | 'ex'
  | 'rex'
  | 'cap'
  | 'rcap'
  | 'ch'
  | 'rch'
  | 'ic'
  | 'ric'
  | 'lh'
  | 'rlh'
  | 'vw'
  | 'vh'
  | 'vi'
  | 'vb'
  | 'vmin'
  | 'vmax'
  | 'svw'
  | 'svh'
  | 'lvw'
  | 'lvh'
  | 'dvw'
  | 'dvh'
  | 'cqw'
  | 'cqh'
  | 'cqi'
  | 'cqb'
  | 'cqmin'
  | 'cqmax';

type MathFunction = `${'calc' | 'min' | 'max' | 'clamp'}(${string})`;
type NumberValue = number | `${number}` | MathFunction;
type Length = 0 | '0' | `${number}${LengthUnit}` | MathFunction;
type Percentage = `${number}%` | MathFunction;

/** Value types for the data types allowed in an `@property` syntax. */
export interface SyntaxDataTypes {
  '<length>': Length;
  '<number>': NumberValue;
  '<integer>': NumberValue;
  '<percentage>': Percentage;
  '<length-percentage>': Length | Percentage;
  '<angle>': `${number}${'deg' | 'rad' | 'grad' | 'turn'}` | MathFunction;
  '<time>': `${number}${'s' | 'ms'}` | MathFunction;
  '<resolution>': `${number}${'dpi' | 'dpcm' | 'dppx' | 'x'}` | MathFunction;
  '<color>': DataType.Color;
  '<url>': `url(${string})`;
  '<image>': string;
  '<string>': string;
  '<custom-ident>': string;
  '<transform-function>': string;
  '<transform-list>': string;
}

type Trim<S extends string> = S extends ` ${infer R}` ? Trim<R> : S extends `${infer R} ` ? Trim<R> : S;

type SyntaxComponentValue<S extends string> = S extends keyof SyntaxDataTypes
  ? SyntaxDataTypes[S]
  : S extends `${string}+` | `${string}#` | `<${string}>`
    ? string
    : S;

/**
 * The value type for an `@property` syntax.
 * `'<length>'` only accepts lengths, `'small | large'` only accepts these keywords.
 */
export type SyntaxValue<S extends string> = string extends S
  ? string | number
  : Trim<S> extends '*'
    ? string | number
    : S extends `${infer A}|${infer B}`
      ? SyntaxComponentValue<Trim<A>> | SyntaxValue<B>
      : SyntaxComponentValue<Trim<S>>;
