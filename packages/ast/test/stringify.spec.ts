import { describe, expect, it } from 'vitest';

import { atRule, decl, root, rule, stringify } from '#index';

describe('stringify', () => {
  it('empty root produces empty string', () => {
    expect(stringify(root())).toBe('');
  });

  it('single rule with one declaration', () => {
    const r = root();
    const ruleNode = rule({ selector: '.foo' });
    ruleNode.append(decl({ prop: 'color', value: 'red' }));
    r.append(ruleNode);
    expect(stringify(r)).toBe(`.foo {
    color: red;
}`);
  });

  it('rule with multiple declarations', () => {
    const r = root();
    const ruleNode = rule({ selector: '.bar' });
    ruleNode.append(decl({ prop: 'color', value: 'blue' }), decl({ prop: 'margin', value: '0' }));
    r.append(ruleNode);
    expect(stringify(r)).toBe(`.bar {
    color: blue;
    margin: 0;
}`);
  });

  it('multiple top-level rules', () => {
    const r = root();
    const r1 = rule({ selector: '.a' });
    r1.append(decl({ prop: 'color', value: 'red' }));
    const r2 = rule({ selector: '.b' });
    r2.append(decl({ prop: 'color', value: 'blue' }));
    r.append(r1, r2);
    expect(stringify(r)).toBe(`.a {
    color: red;
}
.b {
    color: blue;
}`);
  });

  it('at-rule with params and nested rule', () => {
    const r = root();
    const at = atRule({ name: 'media', params: '( max-width : 768px )' });
    const inner = rule({ selector: '.box' });
    inner.append(decl({ prop: 'flex-direction', value: 'column' }));
    at.append(inner);
    r.append(at);
    expect(stringify(r)).toBe(`@media ( max-width : 768px ) {
    .box {
        flex-direction: column;
    }
}`);
  });

  it('at-rule without params', () => {
    const r = root();
    const at = atRule({ name: 'font-face' });
    at.append(decl({ prop: 'font-family', value: 'MyFont' }), decl({ prop: 'src', value: 'url(font.woff2)' }));
    r.append(at);
    expect(stringify(r)).toBe(`@font-face {
    font-family: MyFont;
    src: url(font.woff2);
}`);
  });

  it('nested rule inside rule', () => {
    const r = root();
    const outer = rule({ selector: '.parent' });
    outer.append(decl({ prop: 'display', value: 'flex' }));
    const inner = rule({ selector: '.child' });
    inner.append(decl({ prop: 'flex', value: '1' }));
    outer.append(inner);
    r.append(outer);
    expect(stringify(r)).toBe(`.parent {
    display: flex;
    .child {
        flex: 1;
    }
}`);
  });

  it('empty rule block', () => {
    const r = root();
    r.append(rule({ selector: '.empty' }));
    expect(stringify(r)).toBe(`.empty {
}`);
  });

  it('empty at-rule block', () => {
    const r = root();
    r.append(atRule({ name: 'layer', params: 'base' }));
    expect(stringify(r)).toBe(`@layer base {
}`);
  });

  it('custom indent option', () => {
    const r = root();
    const ruleNode = rule({ selector: '.x' });
    ruleNode.append(decl({ prop: 'color', value: 'red' }));
    r.append(ruleNode);
    expect(stringify(r, { indent: '  ' })).toBe(`.x {
  color: red;
}`);
  });

  it('semicolon false omits semicolons', () => {
    const r = root();
    const ruleNode = rule({ selector: '.x' });
    ruleNode.append(decl({ prop: 'color', value: 'red' }), decl({ prop: 'margin', value: '0' }));
    r.append(ruleNode);
    expect(stringify(r, { semicolon: false })).toBe(`.x {
    color: red
    margin: 0
}`);
  });

  it('declaration with important', () => {
    const r = root();
    const ruleNode = rule({ selector: '.x' });
    ruleNode.append(decl({ prop: 'color', value: 'red', important: true }));
    r.append(ruleNode);
    expect(stringify(r)).toBe(`.x {
    color: red !important;
}`);
  });

  it('keyframes with multiple steps', () => {
    const r = root();
    const at = atRule({ name: 'keyframes', params: 'fade' });
    const fromRule = rule({ selector: 'from' });
    fromRule.append(decl({ prop: 'opacity', value: '0' }));
    const toRule = rule({ selector: 'to' });
    toRule.append(decl({ prop: 'opacity', value: '1' }));
    at.append(fromRule, toRule);
    r.append(at);
    expect(stringify(r)).toBe(`@keyframes fade {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}`);
  });
});
