import { describe, expect, it } from 'vitest';

import { atRule, decl, root, rule } from '#index';

describe('factories', () => {
  describe('root', () => {
    it('returns object with type root and empty nodes array', () => {
      const r = root();
      expect(r.type).toBe('root');
      expect(r.nodes).toEqual([]);
      expect(Array.isArray(r.nodes)).toBe(true);
    });

    it('returns new instance each call', () => {
      expect(root()).not.toBe(root());
    });
  });

  describe('rule', () => {
    it('returns object with type rule, selector and empty nodes', () => {
      const r = rule({ selector: '.foo' });
      expect(r.type).toBe('rule');
      expect(r.selector).toBe('.foo');
      expect(r.nodes).toEqual([]);
    });

    it('preserves selector string as given', () => {
      expect(rule({ selector: 'div > span' }).selector).toBe('div > span');
      expect(rule({ selector: ':where(html):has(.x) .y' }).selector).toBe(
        ':where(html):has(.x) .y',
      );
    });
  });

  describe('atRule', () => {
    it('returns object with type atrule, name and empty nodes', () => {
      const a = atRule({ name: 'media' });
      expect(a.type).toBe('atrule');
      expect(a.name).toBe('media');
      expect(a.nodes).toEqual([]);
    });

    it('accepts optional params', () => {
      const a = atRule({ name: 'keyframes', params: 'fade' });
      expect(a.name).toBe('keyframes');
      expect(a.params).toBe('fade');
    });

    it('allows params to be undefined for at-rules without params', () => {
      const a = atRule({ name: 'font-face' });
      expect(a.params).toBeUndefined();
    });
  });

  describe('decl', () => {
    it('returns object with type decl, prop and value', () => {
      const d = decl({ prop: 'color', value: 'red' });
      expect(d.type).toBe('decl');
      expect(d.prop).toBe('color');
      expect(d.value).toBe('red');
    });

    it('preserves prop and value as given', () => {
      const d = decl({ prop: 'background-color', value: 'rgba(0,0,0,.5)' });
      expect(d.prop).toBe('background-color');
      expect(d.value).toBe('rgba(0,0,0,.5)');
    });

    it('accepts important option', () => {
      const d = decl({ prop: 'color', value: 'red', important: true });
      expect(d.important).toBe(true);
    });

    it('defaults important to false when omitted', () => {
      const d = decl({ prop: 'color', value: 'red' });
      expect(d.important).toBe(false);
    });
  });
});
