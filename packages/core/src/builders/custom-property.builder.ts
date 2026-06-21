import { atRule, type CssAtRule, type CssRoot, decl } from '@surimi/ast';
import { SurimiBase } from '@surimi/common';

export interface CustomPropertyOptions<TValue = string> {
  syntax?: string;
  inherits?: boolean;
  initialValue?: TValue;
  register?: boolean | undefined;
}

interface PropertyDefinition {
  syntax: string;
  inherits: boolean;
  initialValue?: string | undefined;
}

export class CustomPropertyBuilder<TValue = string> extends SurimiBase {
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

    if (options.register !== false) {
      this.registerProperty();
    }
  }

  protected registerProperty() {
    const existing = this.findExistingPropertyRule();

    if (existing) {
      const existingDefinition = this.parsePropertyRule(existing);
      const nextDefinition = this.getPropertyDefinition();

      if (!this.propertyDefinitionsEqual(existingDefinition, nextDefinition)) {
        throw new Error(
          `Conflicting @property definition for ${this.name}: existing ${JSON.stringify(existingDefinition)} vs new ${JSON.stringify(nextDefinition)}`,
        );
      }

      return;
    }

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

  private findExistingPropertyRule(): CssAtRule | undefined {
    return this._cssRoot.nodes.find(
      (node): node is CssAtRule => node.type === 'atrule' && node.name === 'property' && node.params === this.name,
    );
  }

  private parsePropertyRule(rule: CssAtRule): PropertyDefinition {
    let syntax = '*';
    let inherits = true;
    let initialValue: string | undefined;

    for (const node of rule.nodes) {
      if (node.type !== 'decl') {
        continue;
      }

      if (node.prop === 'syntax') {
        syntax = node.value.replace(/^'|'$/g, '');
      } else if (node.prop === 'inherits') {
        inherits = node.value === 'true';
      } else if (node.prop === 'initial-value') {
        initialValue = node.value;
      }
    }

    return { syntax, inherits, initialValue };
  }

  private getPropertyDefinition(): PropertyDefinition {
    const definition: PropertyDefinition = {
      syntax: this.syntax,
      inherits: this.inherits,
    };

    if (this.initialValue !== undefined) {
      definition.initialValue = String(this.initialValue);
    }

    return definition;
  }

  private propertyDefinitionsEqual(a: PropertyDefinition, b: PropertyDefinition): boolean {
    return a.syntax === b.syntax && a.inherits === b.inherits && a.initialValue === b.initialValue;
  }

  public toString() {
    return `var(${this.name})`;
  }

  public build() {
    return this.toString();
  }
}
