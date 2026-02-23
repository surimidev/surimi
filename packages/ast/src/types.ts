export interface CssDeclaration {
  type: 'decl';
  prop: string;
  value: string;
  important: boolean;
  parent?: CssContainer;
}

export interface CssRule {
  type: 'rule';
  selector: string;
  nodes: CssChild[];
  parent?: CssContainer;
  append(...nodes: CssChild[]): CssRule;
}

export interface CssAtRule {
  type: 'atrule';
  name: string;
  params?: string | undefined;
  nodes: CssChild[];
  parent?: CssContainer;
  append(...nodes: CssChild[]): CssAtRule;
}

export interface CssRoot {
  type: 'root';
  nodes: CssChild[];
  append(...nodes: CssChild[]): CssRoot;
  toString(): string;
}

export type CssContainer = CssRoot | CssRule | CssAtRule;
export type CssChild = CssRule | CssAtRule | CssDeclaration;
