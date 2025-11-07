import postcss, { decl } from 'postcss';

import { tokenizeAtRule, type TokenizeAtRule } from '@surimi/parsers';

import type { CssProperties } from '#types/css.types';
import { createDeclarationsFromProperties } from '#utils/postcss.utils';

import { CoreBuilder } from './core.builder';

export type KeyframeStep = 'from' | 'to' | `${number}%`;
export type KeyframeStepConfig = Partial<Record<KeyframeStep, CssProperties>>;

/**
 * Used for building @keyframes at-rules.
 */
export class KeyframesBuilder<T extends string> extends CoreBuilder<TokenizeAtRule<`@keyframes ${T}`>> {
  protected _steps: KeyframeStepConfig;
  protected _name: T;

  constructor(name: T, steps: KeyframeStepConfig, container: postcss.Container, root: postcss.Root) {
    const context = tokenizeAtRule(`@keyframes ${name}`);
    super(context, container, root);

    this._name = name;
    this._steps = steps;
  }

  public register(steps: KeyframeStepConfig) {
    const existingRule = this._postcssRoot.nodes.find(
      (node): node is postcss.AtRule =>
        node.type === 'atrule' && node.name === 'keyframes' && node.params === this._name,
    );

    const rule =
      existingRule ??
      postcss.atRule({
        name: 'keyframes',
        params: this._name,
      });

    const declarations = Object.entries(steps)
      .map(([step, styles]) => {
        if (!styles) {
          return null;
        }

        const stepRule = postcss.rule({ selector: step });
        const declarations = createDeclarationsFromProperties(styles);
        declarations.forEach(decl => stepRule.append(decl));
        return stepRule;
      })
      .filter((stepRule): stepRule is postcss.Rule => stepRule !== null);

    rule.nodes = declarations;

    if (!existingRule) {
      this._postcssRoot.append(rule);
    }

    return this;
  }

  public at(step: KeyframeStep, styles: CssProperties): KeyframesBuilder<T> {
    const newSteps = {
      ...this._steps,
      [step]: {
        ...(this._steps[step] ?? {}),
        ...styles,
      },
    };

    this.register(newSteps);

    return new KeyframesBuilder(this._name, newSteps, this._postcssContainer, this._postcssRoot);
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

  get [Symbol.toStringTag]() {
    return 'KeyframesBuilder';
  }

  public [Symbol.toPrimitive](hint: string) {
    if (hint === 'string' || hint === 'default') {
      return this.build();
    }
    return null;
  }
}
