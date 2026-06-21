import { beforeEach, describe, expect, it } from 'vitest';

import { property, Surimi } from '../../src/index';

const syntaxOf = (css: string) => css.match(/syntax:\s*'([^']*)'/)?.[1];

describe('Custom Property Builder', () => {
  beforeEach(() => {
    Surimi.clear();
  });

  it('should emit the universal syntax as a bare star, not <*>', () => {
    property('foo', '0');

    expect(syntaxOf(Surimi.build())).toBe('*');
  });

  it('should emit the universal syntax as a bare star via the options form', () => {
    property({ name: 'foo', initialValue: '0' });

    expect(syntaxOf(Surimi.build())).toBe('*');
  });

  it('should pass an angle-wrapped data type through verbatim', () => {
    property('foo', '#000', '<color>');

    expect(syntaxOf(Surimi.build())).toBe('<color>');
  });

  it('should pass a combinator syntax through verbatim', () => {
    property('foo', 'none', '<color> | none');

    expect(syntaxOf(Surimi.build())).toBe('<color> | none');
  });

  it('should pass a custom-ident syntax through verbatim', () => {
    property('foo', 'small', 'small | medium | large');

    expect(syntaxOf(Surimi.build())).toBe('small | medium | large');
  });

  it('should emit a complete @property rule with default syntax and inherits', () => {
    property('accent', '#3498db');

    expect(Surimi.build()).toBe(`\
@property --accent {
    syntax: '*';
    inherits: true;
    initial-value: #3498db;
}`);
  });

  it('should not emit @property when register is false', () => {
    property({ name: 'quiet', initialValue: '#000', register: false });

    expect(Surimi.build()).toBe('');
  });

  it('should dedupe identical @property registrations', () => {
    property('accent', '#3498db');
    property('accent', '#3498db');

    expect(Surimi.build()).toBe(`\
@property --accent {
    syntax: '*';
    inherits: true;
    initial-value: #3498db;
}`);
  });

  it('should throw on conflicting @property registrations', () => {
    property('accent', '#3498db', '<color>');

    expect(() => property('accent', '#000', '*')).toThrow(/Conflicting @property definition/);
  });
});
