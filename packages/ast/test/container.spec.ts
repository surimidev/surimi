import { describe, expect, it } from 'vitest';

import { atRule, decl, root, rule } from '#index';

describe('container', () => {
  describe('append', () => {
    it('appends node to root and sets parent on node', () => {
      const r = root();
      const ruleNode = rule({ selector: '.a' });
      r.append(ruleNode);
      expect(r.nodes).toHaveLength(1);
      expect(r.nodes[0]).toBe(ruleNode);
      expect(ruleNode.parent).toBe(r);
    });

    it('appends multiple nodes in one call', () => {
      const r = root();
      const r1 = rule({ selector: '.a' });
      const r2 = rule({ selector: '.b' });
      r.append(r1, r2);
      expect(r.nodes).toHaveLength(2);
      expect(r.nodes[0]).toBe(r1);
      expect(r.nodes[1]).toBe(r2);
      expect(r1.parent).toBe(r);
      expect(r2.parent).toBe(r);
    });

    it('appends declarations to rule', () => {
      const ruleNode = rule({ selector: '.x' });
      const d1 = decl({ prop: 'color', value: 'red' });
      const d2 = decl({ prop: 'margin', value: '0' });
      ruleNode.append(d1, d2);
      expect(ruleNode.nodes).toHaveLength(2);
      expect(d1.parent).toBe(ruleNode);
      expect(d2.parent).toBe(ruleNode);
    });

    it('appends rule to at-rule for nesting', () => {
      const at = atRule({ name: 'media', params: '(min-width: 600px)' });
      const inner = rule({ selector: '.box' });
      inner.append(decl({ prop: 'display', value: 'block' }));
      at.append(inner);
      expect(at.nodes).toHaveLength(1);
      expect(inner.parent).toBe(at);
    });

    it('returns container for chaining', () => {
      const r = root();
      const ruleNode = rule({ selector: '.a' });
      const result = r.append(ruleNode);
      expect(result).toBe(r);
    });
  });

  describe('nodes order', () => {
    it('reflects order of append calls', () => {
      const r = root();
      r.append(rule({ selector: '.first' }));
      r.append(rule({ selector: '.second' }));
      r.append(atRule({ name: 'media', params: 'screen' }));
      expect(r.nodes.map(n => (n.type === 'rule' ? n.selector : n.type))).toEqual([
        '.first',
        '.second',
        'atrule',
      ]);
    });
  });

  describe('get or create rule pattern', () => {
    it('finds existing rule by selector', () => {
      const container = root();
      const ruleNode = rule({ selector: '.unique' });
      container.append(ruleNode);
      const found = container.nodes.find(
        (n): n is ReturnType<typeof rule> => n.type === 'rule' && n.selector === '.unique',
      );
      expect(found).toBe(ruleNode);
    });

    it('returns undefined when no matching rule', () => {
      const container = root();
      container.append(rule({ selector: '.other' }));
      const found = container.nodes.find(
        (n): n is ReturnType<typeof rule> => n.type === 'rule' && n.selector === '.missing',
      );
      expect(found).toBeUndefined();
    });
  });
});
