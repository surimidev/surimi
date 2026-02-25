import type { CssAtRule, CssDeclaration, CssRoot, CssRule } from './types.js';

const DEFAULT_INDENT = '    ';

function stringifyDecl(decl: CssDeclaration, indent: string, semicolon: boolean): string {
  let out = decl.prop + ': ' + decl.value;
  if (decl.important) out += ' !important';
  if (semicolon) out += ';';
  return indent + out;
}

function stringifyRule(node: CssRule, indentLevel: number, baseIndent: string, semicolon: boolean): string {
  const indent = baseIndent.repeat(indentLevel);
  const innerIndent = baseIndent.repeat(indentLevel + 1);
  const parts: string[] = [];
  for (const child of node.nodes) {
    if (child.type === 'decl') {
      parts.push(stringifyDecl(child, innerIndent, semicolon));
    } else {
      parts.push(stringifyNode(child, indentLevel + 1, baseIndent, semicolon));
    }
  }
  const body = parts.length ? '\n' + parts.join('\n') + '\n' + indent : '\n';
  return indent + node.selector + ' {' + body + '}';
}

function stringifyAtRule(node: CssAtRule, indentLevel: number, baseIndent: string, semicolon: boolean): string {
  const indent = baseIndent.repeat(indentLevel);
  const innerIndent = baseIndent.repeat(indentLevel + 1);
  const head = '@' + node.name + (node.params !== undefined && node.params !== '' ? ' ' + node.params : '');
  const parts: string[] = [];
  for (const child of node.nodes) {
    if (child.type === 'decl') {
      parts.push(stringifyDecl(child, innerIndent, semicolon));
    } else {
      parts.push(stringifyNode(child, indentLevel + 1, baseIndent, semicolon));
    }
  }
  const body = parts.length ? '\n' + parts.join('\n') + '\n' + indent : '\n';
  return indent + head + ' {' + body + '}';
}

function stringifyNode(node: CssRule | CssAtRule, indentLevel: number, baseIndent: string, semicolon: boolean): string {
  if (node.type === 'rule') return stringifyRule(node, indentLevel, baseIndent, semicolon);
  return stringifyAtRule(node, indentLevel, baseIndent, semicolon);
}

export interface StringifyOptions {
  indent?: string;
  semicolon?: boolean;
}

export function stringify(rootNode: CssRoot, options: StringifyOptions = {}): string {
  const baseIndent = options.indent ?? DEFAULT_INDENT;
  const semicolon = options.semicolon ?? true;
  const parts: string[] = [];
  for (const node of rootNode.nodes) {
    if (node.type === 'decl') {
      parts.push(stringifyDecl(node, baseIndent, semicolon));
    } else {
      parts.push(stringifyNode(node, 0, baseIndent, semicolon));
    }
  }
  return parts.join('\n');
}
