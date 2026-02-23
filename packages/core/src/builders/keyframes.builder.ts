import { atRule, rule, type CssAtRule, type CssContainer, type CssRoot } from '@surimi/ast';
import type { CssProperties } from '@surimi/common';
import { tokenizeAtRule, type TokenizeAtRule } from '@surimi/parsers';

import { createDeclarationsFromProperties } from '#utils/postcss.utils';

import { CoreBuilder } from './core.builder';

export type KeyframeStep = 'from' | 'to' | `${number}%`;
export type KeyframeStepConfig = Partial<Record<KeyframeStep, CssProperties>>;

export class KeyframesBuilder<T extends string> extends CoreBuilder<TokenizeAtRule<`@keyframes ${T}`>> {
  protected _steps: KeyframeStepConfig;
  protected _name: T;

  constructor(name: T, steps: KeyframeStepConfig, container: CssContainer, root: CssRoot) {
    const context = tokenizeAtRule(`@keyframes ${name}`);
    super(context, container, root);

    this._name = name;
    this._steps = steps;

    this.register();
  }

  public register() {
    const existingRule = this._cssRoot.nodes.find(
      (node): node is CssAtRule =>
        node.type === 'atrule' && node.name === 'keyframes' && node.params === this._name,
    );

    const atRuleNode =
      existingRule ??
      atRule({
        name: 'keyframes',
        params: this._name,
      });

    const stepRules = Object.entries(this._steps)
      .map(([step, styles]) => {
        if (!styles) return null;
        const stepRule = rule({ selector: step });
        const declarations = createDeclarationsFromProperties(styles);
        declarations.forEach(d => stepRule.append(d));
        return stepRule;
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);

    atRuleNode.nodes.length = 0;
    stepRules.forEach(r => atRuleNode.append(r));

    if (!existingRule) {
      this._cssRoot.append(atRuleNode);
    }
  }

  public at(step: KeyframeStep, styles: CssProperties): KeyframesBuilder<T> {
    const newSteps = {
      ...this._steps,
      [step]: {
        ...(this._steps[step] ?? {}),
        ...styles,
      },
    };
    return new KeyframesBuilder(this._name, newSteps, this._container, this._cssRoot);
  }

  public step(step: KeyframeStep, styles: CssProperties): KeyframesBuilder<T> {
    return this.at(step, styles);
  }

  public from(styles: CssProperties): KeyframesBuilder<T> {
    return this.at('from', styles);
  }

  public to(styles: CssProperties): KeyframesBuilder<T> {
    return this.at('to', styles);
  }

  public build(): string {
    return this._name;
  }
}
