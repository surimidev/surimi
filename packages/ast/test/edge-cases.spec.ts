import { describe, expect, it } from 'vitest';

import { atRule, decl, root, rule, stringify } from '#index';

describe('edge cases', () => {
  it('root with only at-rules', () => {
    const r = root();
    const at = atRule({ name: 'charset', params: '"UTF-8"' });
    r.append(at);
    expect(r.nodes).toHaveLength(1);
    expect(r.nodes[0]?.type).toBe('atrule');
  });

  it('at-rule with declaration children (e.g. @font-face)', () => {
    const r = root();
    const at = atRule({ name: 'font-face' });
    at.append(
      decl({ prop: 'font-family', value: '"Custom"' }),
      decl({ prop: 'src', value: 'url(a.woff2) format("woff2")' }),
    );
    r.append(at);
    expect(stringify(r)).toContain('font-family');
    expect(stringify(r)).toContain('src: url(a.woff2)');
  });

  it('at-rule with params empty string', () => {
    const at = atRule({ name: 'layer', params: '' });
    expect(at.params).toBe('');
  });

  it('selector with special characters', () => {
    const r = root();
    const ruleNode = rule({ selector: '[data-state="open"]' });
    ruleNode.append(decl({ prop: 'display', value: 'block' }));
    r.append(ruleNode);
    expect(stringify(r)).toBe(`[data-state="open"] {
    display: block;
}`);
  });

  it('declaration value with quotes and commas', () => {
    const r = root();
    const ruleNode = rule({ selector: '.x' });
    ruleNode.append(decl({ prop: 'font-family', value: '"Helvetica Neue", Arial' }));
    r.append(ruleNode);
    expect(stringify(r)).toContain('"Helvetica Neue", Arial');
  });

  it('deep nesting', () => {
    const r = root();
    const l1 = rule({ selector: '.a' });
    const l2 = rule({ selector: '.b' });
    const l3 = rule({ selector: '.c' });
    l3.append(decl({ prop: 'color', value: 'red' }));
    l2.append(l3);
    l1.append(l2);
    r.append(l1);
    expect(stringify(r)).toBe(`.a {
    .b {
        .c {
            color: red;
        }
    }
}`);
  });

  it('media then rule order preserved', () => {
    const r = root();
    r.append(rule({ selector: '.first' }));
    const at = atRule({ name: 'media', params: 'screen' });
    at.append(rule({ selector: '.in-media' }));
    r.append(at);
    r.append(rule({ selector: '.last' }));
    const out = stringify(r);
    expect(out.startsWith('.first')).toBe(true);
    expect(out).toContain('@media screen');
    expect(out).toContain('.in-media');
    expect(out.endsWith('.last {\n}')).toBe(true);
  });
});
