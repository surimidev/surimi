import type { SyntaxValue } from '@surimi/common';
import type { CustomPropertyBuilder } from '@surimi/core';
import { beforeEach, describe, expect, expectTypeOf, it } from 'vitest';

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
    const quiet = property({ name: 'quiet', register: false });

    expect(quiet.build()).toBe('var(--quiet)');
    expect(Surimi.build()).toBe('');
  });

  it('should reject an initial value on an unregistered property', () => {
    // @ts-expect-error the initial value would be dropped
    expect(() => property({ name: 'quiet', initialValue: '#000', register: false })).toThrow(/not registered/);
  });

  it('should keep the name case', () => {
    expect(property('fontSize', '1rem').build()).toBe('var(--fontSize)');
  });

  it('should throw on names that are not valid CSS', () => {
    expect(() => property('foo bar', '0')).toThrow(/Invalid custom property name "--foo bar"/);
    expect(() => property('--', '0')).toThrow(/Invalid custom property name/);
  });

  it('should throw on unknown data types and invalid keywords', () => {
    expect(() => property('foo', '#000', '<colour>')).toThrow(/unknown data type <colour>/);
    // @ts-expect-error the keyword would be `<length`
    expect(() => property('foo', '0', '<length')).toThrow(/not a data type or keyword/);
  });

  it('should throw when the initial value does not match the syntax', () => {
    // @ts-expect-error not a length
    expect(() => property('a', '12', '<length>')).toThrow(/does not match syntax '<length>'/);
    // @ts-expect-error not a length
    expect(() => property('b', '12pz', '<length>')).toThrow(/does not match/);
    // @ts-expect-error not one of the keywords
    expect(() => property('c', 'huge', 'small | large')).toThrow(/does not match/);
    expect(() => property('d', 1.5, '<integer>')).toThrow(/does not match/);
  });

  it('should accept initial values that match the syntax', () => {
    property('a', '0', '<length>');
    property('b', '-1.5rem', '<length>');
    property('c', 'calc(1px + 2rem)', '<length>');
    property('d', '50%', '<length-percentage>');
    property('e', 2, '<number>');
    property('f', '90deg', '<angle>');
    property('g', '200ms', '<time>');
    property('h', '1px 2px', '<length>+');
    property('i', 'large', 'small | large');

    expect(Surimi.build().match(/@property/g)).toHaveLength(9);
  });

  it('should reject var() as typed initial value', () => {
    const base = property('base', '#000', '<color>');

    expect(() => property('derived', base as never, '<color>')).toThrow(/literal initial-value/);
    expect(() => property('other', 'var(--base)', '<color>')).toThrow(/literal initial-value/);
  });

  it('should type the value by syntax', () => {
    expectTypeOf(property('a', '1px', '<length>')).toEqualTypeOf<CustomPropertyBuilder<SyntaxValue<'<length>'>>>();
    expectTypeOf(property('b', 'small', 'small | large').initialValue).toEqualTypeOf<'small' | 'large' | undefined>();
    expectTypeOf(property('c', 0).initialValue).toEqualTypeOf<string | number | undefined>();
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
