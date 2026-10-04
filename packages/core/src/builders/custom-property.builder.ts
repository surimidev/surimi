import { atRule, type CssRoot, decl } from '@surimi/ast';
import { SurimiBase } from '@surimi/common';

export interface CustomPropertyOptions<TValue = string | number> {
  syntax?: string | undefined;
  inherits?: boolean | undefined;
  initialValue?: TValue | undefined;
  /** `false` only references the property, without emitting `@property`. */
  register?: boolean | undefined;
}

const NAME_PATTERN = /^--[-_a-zA-Z0-9\u00A0-\uFFFF]+$/;
const IDENT_PATTERN = /^-?[_a-zA-Z\u00A0-\uFFFF][-_a-zA-Z0-9\u00A0-\uFFFF]*$/;

const NUMBER = String.raw`[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?`;
const LENGTH_UNITS = 'px|cm|mm|Q|in|pc|pt|r?em|r?ex|r?cap|r?ch|r?ic|r?lh|[sld]?v[whib]|vmin|vmax|cq[whib]|cqmin|cqmax';
const MATH_FUNCTION = /^(?:calc|min|max|clamp)\(.*\)$/;

const number = (units = '') => new RegExp(`^${NUMBER}${units}$`, 'i');

/** Patterns for data types we can check. `undefined` means any value is accepted. */
const DATA_TYPES: Record<string, RegExp | undefined> = {
  length: new RegExp(`^(?:0|${NUMBER}(?:${LENGTH_UNITS}))$`, 'i'),
  number: number(),
  integer: /^[+-]?\d+$/,
  percentage: number('%'),
  'length-percentage': new RegExp(`^(?:0|${NUMBER}(?:${LENGTH_UNITS}|%))$`, 'i'),
  angle: number('(?:deg|rad|grad|turn)'),
  time: number('(?:s|ms)'),
  resolution: number('(?:dpi|dpcm|dppx|x)'),
  color: undefined,
  url: /^url\(.*\)$/,
  image: undefined,
  string: undefined,
  'custom-ident': undefined,
  'transform-function': undefined,
  'transform-list': undefined,
};

interface SyntaxComponent {
  /** The data type name or keyword, without `<>` and multiplier. */
  name: string;
  dataType: boolean;
  list: boolean;
}

function parseSyntax(name: string, syntax: string): SyntaxComponent[] {
  return syntax.split('|').map(part => {
    const raw = part.trim();
    const list = raw.endsWith('+') || raw.endsWith('#');
    const component = list ? raw.slice(0, -1) : raw;
    const dataType = /^<([a-z-]+)>$/.exec(component)?.[1];

    if (dataType !== undefined) {
      if (!(dataType in DATA_TYPES)) {
        throw new Error(`Invalid syntax '${syntax}' for ${name}: unknown data type <${dataType}>`);
      }

      return { name: dataType, dataType: true, list };
    }

    if (!IDENT_PATTERN.test(component)) {
      throw new Error(`Invalid syntax '${syntax}' for ${name}: '${component}' is not a data type or keyword`);
    }

    return { name: component, dataType: false, list };
  });
}

function matches(component: SyntaxComponent, value: string): boolean {
  if (component.list) return true;
  if (!component.dataType) return component.name === value;

  const pattern = DATA_TYPES[component.name];
  return pattern === undefined || pattern.test(value) || MATH_FUNCTION.test(value);
}

type Registry = Map<string, string>;

const registries = new WeakMap<CssRoot, Registry>();

function getRegistry(root: CssRoot): Registry {
  let registry = registries.get(root);

  if (!registry) {
    registry = new Map();
    registries.set(root, registry);
  }

  return registry;
}

export class CustomPropertyBuilder<TValue = string | number> extends SurimiBase {
  public readonly name: string;
  public readonly syntax: string;
  public readonly inherits: boolean;
  public readonly initialValue: TValue | undefined;

  constructor(root: CssRoot, name: string, options: CustomPropertyOptions<TValue> = {}) {
    super(root);

    this.name = name.startsWith('--') ? name : `--${name}`;
    this.syntax = options.syntax ?? '*';
    this.inherits = options.inherits ?? true;
    this.initialValue = options.initialValue;

    if (!NAME_PATTERN.test(this.name)) {
      throw new Error(
        `Invalid custom property name "${this.name}". Names may only contain letters, digits, hyphens and underscores`,
      );
    }

    if (options.register === false) {
      if (this.initialValue !== undefined) {
        throw new Error(`${this.name} is not registered, so it can't have an initial value`);
      }
    } else {
      this.registerProperty();
    }
  }

  protected registerProperty() {
    const initialValue = this.initialValue === undefined ? undefined : String(this.initialValue);

    if (this.syntax.trim() !== '*') {
      const components = parseSyntax(this.name, this.syntax);

      if (initialValue === undefined) {
        throw new Error(
          `@property ${this.name} requires an initial-value when syntax is '${this.syntax}'. Provide initialValue or use syntax: '*'.`,
        );
      }

      if (this.initialValue instanceof SurimiBase || initialValue.includes('var(')) {
        throw new Error(`@property ${this.name} needs a literal initial-value, not ${initialValue}`);
      }

      if (!components.some(component => matches(component, initialValue))) {
        throw new Error(`Initial value ${initialValue} of ${this.name} does not match syntax '${this.syntax}'`);
      }
    }

    const definition = JSON.stringify({ syntax: this.syntax, inherits: this.inherits, initialValue });
    const registry = getRegistry(this._cssRoot);
    const existing = registry.get(this.name);

    if (existing !== undefined) {
      if (existing !== definition) {
        throw new Error(`Conflicting @property definition for ${this.name}: existing ${existing} vs new ${definition}`);
      }

      return;
    }

    registry.set(this.name, definition);

    const atRuleNode = atRule({ name: 'property', params: this.name });
    atRuleNode.append(
      decl({ prop: 'syntax', value: `'${this.syntax}'` }),
      decl({ prop: 'inherits', value: String(this.inherits) }),
    );

    if (initialValue !== undefined) {
      atRuleNode.append(decl({ prop: 'initial-value', value: initialValue }));
    }

    this._cssRoot.append(atRuleNode);
  }

  public toString() {
    return `var(${this.name})`;
  }

  public build() {
    return this.toString();
  }
}
