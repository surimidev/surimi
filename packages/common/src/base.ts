import type { CssRoot } from '@surimi/ast';

export abstract class SurimiBase<TBuild extends string | Record<string, unknown> = string> {
  protected _cssRoot: CssRoot;

  public constructor(root: CssRoot) {
    this._cssRoot = root;
  }

  public abstract build(): TBuild;

  public readonly [Symbol.toStringTag] = 'SurimiBase';

  public [Symbol.toPrimitive](hint: string) {
    if (hint === 'string' || hint === 'default') {
      return this.build();
    }
    return null;
  }
}
