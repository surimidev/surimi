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

/** `@property` definitions by name, per root. */
const registries = new WeakMap<CssRoot, Map<string, string>>();

function getRegistry(root: CssRoot): Map<string, string> {
  let registry = registries.get(root);

  if (!registry) {
    registry = new Map();
    registries.set(root, registry);
  }

  return registry;
}

function normalizeName(name: string): string {
  const normalized = name.startsWith('--') ? name : `--${name}`;

  if (!NAME_PATTERN.test(normalized)) {
    throw new Error(
      `Invalid custom property name "${normalized}". Names may only contain letters, digits, hyphens and underscores`,
    );
  }

  return normalized;
}

/** Validates the property and returns its `@property` definition, or `undefined` if it is not registered. */
function resolveDefinition(root: CssRoot, name: string, options: CustomPropertyOptions<unknown>): string | undefined {
  const { syntax = '*', inherits = true, initialValue: value } = options;
  const initialValue = value === undefined ? undefined : String(value);

  if (options.register === false) {
    if (initialValue !== undefined) {
      throw new Error(`${name} is not registered, so it can't have an initial value`);
    }

    return undefined;
  }

  if (syntax.trim() !== '*') {
    if (initialValue === undefined) {
      throw new Error(
        `@property ${name} requires an initial-value when syntax is '${syntax}'. Provide initialValue or use syntax: '*'.`,
      );
    }

    if (value instanceof SurimiBase) {
      throw new Error(`@property ${name} needs a literal initial-value, not ${initialValue}`);
    }
  }

  const definition = JSON.stringify({ syntax, inherits, initialValue });
  const existing = getRegistry(root).get(name);

  if (existing !== undefined && existing !== definition) {
    throw new Error(`Conflicting @property definition for ${name}: existing ${existing} vs new ${definition}`);
  }

  return definition;
}

export class CustomPropertyBuilder<TValue = string | number> extends SurimiBase {
  public readonly name: string;
  public readonly syntax: string;
  public readonly inherits: boolean;
  public readonly initialValue: TValue | undefined;

  /** Throws for the same reasons the constructor would, without emitting anything. */
  public static validate(root: CssRoot, name: string, options: CustomPropertyOptions<unknown> = {}): void {
    resolveDefinition(root, normalizeName(name), options);
  }

  constructor(root: CssRoot, name: string, options: CustomPropertyOptions<TValue> = {}) {
    super(root);

    this.name = normalizeName(name);
    this.syntax = options.syntax ?? '*';
    this.inherits = options.inherits ?? true;
    this.initialValue = options.initialValue;

    const definition = resolveDefinition(root, this.name, options);
    const registry = getRegistry(root);

    if (definition === undefined || registry.has(this.name)) {
      return;
    }

    registry.set(this.name, definition);

    const atRuleNode = atRule({ name: 'property', params: this.name });
    atRuleNode.append(
      decl({ prop: 'syntax', value: `'${this.syntax}'` }),
      decl({ prop: 'inherits', value: String(this.inherits) }),
    );

    if (this.initialValue !== undefined) {
      atRuleNode.append(decl({ prop: 'initial-value', value: String(this.initialValue) }));
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
