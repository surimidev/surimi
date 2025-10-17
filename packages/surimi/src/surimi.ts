import postcss from 'postcss';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class Surimi {
  private static root: postcss.Root = postcss.root();
  private static selectors = new Map<string, SelectorBuilder>();
}
