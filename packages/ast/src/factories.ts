import { stringify } from './stringify.js';
import type { CssAtRule, CssChild, CssDeclaration, CssRoot, CssRule } from './types.js';

function setParent(child: CssChild, parent: CssRoot | CssRule | CssAtRule): void {
  (child as CssChild & { parent?: CssRoot | CssRule | CssAtRule }).parent = parent;
}

export function root(): CssRoot {
  const nodes: CssChild[] = [];
  const self: CssRoot = {
    type: 'root',
    nodes,
    append(...children: CssChild[]) {
      for (const c of children) {
        nodes.push(c);
        setParent(c, this);
      }
      return this;
    },
    toString() {
      return stringify(self);
    },
  };
  return self;
}

export function rule(options: { selector: string }): CssRule {
  const nodes: CssChild[] = [];
  return {
    type: 'rule',
    selector: options.selector,
    nodes,
    append(...children: CssChild[]) {
      for (const c of children) {
        nodes.push(c);
        setParent(c, this);
      }
      return this;
    },
  };
}

export function atRule(options: { name: string; params?: string | undefined }): CssAtRule {
  const nodes: CssChild[] = [];
  return {
    type: 'atrule',
    name: options.name,
    params: options.params,
    nodes,
    append(...children: CssChild[]) {
      for (const c of children) {
        nodes.push(c);
        setParent(c, this);
      }
      return this;
    },
  };
}

export function decl(options: { prop: string; value: string; important?: boolean }): CssDeclaration {
  return {
    type: 'decl',
    prop: options.prop,
    value: options.value,
    important: options.important ?? false,
  };
}
