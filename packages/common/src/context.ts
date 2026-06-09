import { type CssRoot, root } from '@surimi/ast';

// biome-ignore lint/complexity/noStaticOnlyClass: static singleton holding the global CSS context root
export abstract class SurimiContext {
  public static root: CssRoot = root();

  public static clear() {
    SurimiContext.root = root();
  }

  public static build() {
    return SurimiContext.root.toString();
  }
}
