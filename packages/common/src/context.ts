import { root, type CssRoot } from '@surimi/ast';

export abstract class SurimiContext {
  public static root: CssRoot = root();

  public static clear() {
    SurimiContext.root = root();
  }

  public static build() {
    return SurimiContext.root.toString();
  }
}
