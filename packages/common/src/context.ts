import { root, type CssRoot } from '@surimi/ast';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- static context root
export abstract class SurimiContext {
  public static root: CssRoot = root();

  public static clear() {
    SurimiContext.root = root();
  }

  public static build() {
    return SurimiContext.root.toString();
  }
}
