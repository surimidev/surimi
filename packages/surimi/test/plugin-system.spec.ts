/**
 * Plugin System Tests
 * 
 * Note: TypeScript will show errors for plugin methods in this file because
 * the type system cannot infer plugin methods at compile time. However, the
 * tests pass at runtime because the plugin methods are correctly mixed in.
 * This is an expected limitation of the current plugin system implementation.
 */

import { beforeEach, describe, expect, it } from 'vitest';

import { createSurimi, Surimi } from '../src/index';
import { WithAnimations } from '../src/lib/examples/animation-plugin.example';
import { WithSpacing } from '../src/lib/examples/spacing-plugin.example';
import { WithTypography } from '../src/lib/examples/typography-plugin.example';

describe('Plugin System', () => {
  beforeEach(() => {
    Surimi.clear();
  });

  describe('Basic Plugin Usage', () => {
    it('should work without any plugins', () => {
      const { select } = createSurimi();

      select('.button').style({
        backgroundColor: 'blue',
      });

      expect(Surimi.build()).toBe(`\
.button {
    background-color: blue
}`);
    });

    it('should extend builder with single plugin', () => {
      const { select } = createSurimi({ plugins: [WithAnimations] });

      // @ts-expect-error - Plugin methods available at runtime
      select('.modal').fadeIn('0.5s');

      expect(Surimi.build()).toBe(`\
.modal {
    animation: fadeIn 0.5s;
    opacity: 1
}`);
    });

    it('should extend builder with multiple plugins', () => {
      const { select } = createSurimi({
        plugins: [WithAnimations, WithSpacing],
      });

      // @ts-expect-error - Plugin methods available at runtime
      select('.card').fadeIn('0.3s').padding('1rem');

      expect(Surimi.build()).toBe(`\
.card {
    animation: fadeIn 0.3s;
    opacity: 1;
    padding: 1rem
}`);
    });
  });

  describe('Animation Plugin', () => {
    it('should support fadeIn method', () => {
      const { select } = createSurimi({ plugins: [WithAnimations] });

      // @ts-expect-error - Plugin methods available at runtime
      select('.element').fadeIn();

      expect(Surimi.build()).toBe(`\
.element {
    animation: fadeIn 0.3s;
    opacity: 1
}`);
    });

    it('should support fadeOut method', () => {
      const { select } = createSurimi({ plugins: [WithAnimations] });

      // @ts-expect-error - Plugin methods available at runtime
      select('.element').fadeOut('0.5s');

      expect(Surimi.build()).toBe(`\
.element {
    animation: fadeOut 0.5s;
    opacity: 0
}`);
    });

    it('should support slideIn method', () => {
      const { select } = createSurimi({ plugins: [WithAnimations] });

      // @ts-expect-error - Plugin methods available at runtime
      select('.element').slideIn('left', '0.4s');

      expect(Surimi.build()).toBe(`\
.element {
    animation: slideIn-left 0.4s ease-out
}`);
    });

    it('should support pulse method', () => {
      const { select } = createSurimi({ plugins: [WithAnimations] });

      // @ts-expect-error - Plugin methods available at runtime
      select('.element').pulse('2s');

      expect(Surimi.build()).toBe(`\
.element {
    animation: pulse 2s infinite
}`);
    });

    it('should support bounce method', () => {
      const { select } = createSurimi({ plugins: [WithAnimations] });

      // @ts-expect-error - Plugin methods available at runtime
      select('.element').bounce();

      expect(Surimi.build()).toBe(`\
.element {
    animation: bounce 1s
}`);
    });

    it('should support animate method with custom parameters', () => {
      const { select } = createSurimi({ plugins: [WithAnimations] });

      // @ts-expect-error - Plugin methods available at runtime
      select('.element').animate('customAnimation', '1.5s', 'ease-in-out');

      expect(Surimi.build()).toBe(`\
.element {
    animation: customAnimation 1.5s ease-in-out
}`);
    });
  });

  describe('Spacing Plugin', () => {
    it('should support gap method', () => {
      const { select } = createSurimi({ plugins: [WithSpacing] });

      // @ts-expect-error - Plugin methods available at runtime
      select('.grid').gap('1rem');

      expect(Surimi.build()).toBe(`\
.grid {
    gap: 1rem
}`);
    });

    it('should support padding method', () => {
      const { select } = createSurimi({ plugins: [WithSpacing] });

      // @ts-expect-error - Plugin methods available at runtime
      select('.box').padding('2rem');

      expect(Surimi.build()).toBe(`\
.box {
    padding: 2rem
}`);
    });

    it('should support paddingX method', () => {
      const { select } = createSurimi({ plugins: [WithSpacing] });

      // @ts-expect-error - Plugin methods available at runtime
      select('.box').paddingX('1.5rem');

      expect(Surimi.build()).toBe(`\
.box {
    padding-left: 1.5rem;
    padding-right: 1.5rem
}`);
    });

    it('should support paddingY method', () => {
      const { select } = createSurimi({ plugins: [WithSpacing] });

      // @ts-expect-error - Plugin methods available at runtime
      select('.box').paddingY('1rem');

      expect(Surimi.build()).toBe(`\
.box {
    padding-top: 1rem;
    padding-bottom: 1rem
}`);
    });

    it('should support margin method', () => {
      const { select } = createSurimi({ plugins: [WithSpacing] });

      // @ts-expect-error - Plugin methods available at runtime
      select('.box').margin('1rem');

      expect(Surimi.build()).toBe(`\
.box {
    margin: 1rem
}`);
    });

    it('should support centerX method', () => {
      const { select } = createSurimi({ plugins: [WithSpacing] });

      // @ts-expect-error - Plugin methods available at runtime
      select('.container').centerX();

      expect(Surimi.build()).toBe(`\
.container {
    margin-left: auto;
    margin-right: auto
}`);
    });

    it('should support rowGap and columnGap methods', () => {
      const { select } = createSurimi({ plugins: [WithSpacing] });

      // @ts-expect-error - Plugin methods available at runtime
      select('.grid').rowGap('1rem').columnGap('2rem');

      expect(Surimi.build()).toBe(`\
.grid {
    row-gap: 1rem;
    column-gap: 2rem
}`);
    });
  });

  describe('Typography Plugin', () => {
    it('should support fontSize with preset values', () => {
      const { select } = createSurimi({ plugins: [WithTypography] });

      // @ts-expect-error - Plugin methods available at runtime
      select('.text').fontSize('lg');

      expect(Surimi.build()).toBe(`\
.text {
    font-size: 1.125rem
}`);
    });

    it('should support fontSize with custom values', () => {
      const { select } = createSurimi({ plugins: [WithTypography] });

      // @ts-expect-error - Plugin methods available at runtime
      select('.text').fontSize('24px');

      expect(Surimi.build()).toBe(`\
.text {
    font-size: 24px
}`);
    });

    it('should support fontWeight with preset values', () => {
      const { select } = createSurimi({ plugins: [WithTypography] });

      // @ts-expect-error - Plugin methods available at runtime
      select('.text').fontWeight('bold');

      expect(Surimi.build()).toBe(`\
.text {
    font-weight: 700
}`);
    });

    it('should support textAlign method', () => {
      const { select } = createSurimi({ plugins: [WithTypography] });

      // @ts-expect-error - Plugin methods available at runtime
      select('.text').textAlign('center');

      expect(Surimi.build()).toBe(`\
.text {
    text-align: center
}`);
    });

    it('should support uppercase method', () => {
      const { select } = createSurimi({ plugins: [WithTypography] });

      // @ts-expect-error - Plugin methods available at runtime
      select('.text').uppercase();

      expect(Surimi.build()).toBe(`\
.text {
    text-transform: uppercase
}`);
    });

    it('should support truncate method', () => {
      const { select } = createSurimi({ plugins: [WithTypography] });

      // @ts-expect-error - Plugin methods available at runtime
      select('.text').truncate();

      expect(Surimi.build()).toBe(`\
.text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap
}`);
    });

    it('should support lineClamp method', () => {
      const { select } = createSurimi({ plugins: [WithTypography] });

      // @ts-expect-error - Plugin methods available at runtime
      select('.text').lineClamp(3);

      expect(Surimi.build()).toBe(`\
.text {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden
}`);
    });
  });

  describe('Plugin Composition', () => {
    it('should work with all three plugins together', () => {
      const { select } = createSurimi({
        plugins: [WithAnimations, WithSpacing, WithTypography],
      });

      select('.card')
        .fadeIn('0.5s')
        .padding('1rem')
        .fontSize('base')
        .style({ backgroundColor: 'white' });

      expect(Surimi.build()).toBe(`\
.card {
    animation: fadeIn 0.5s;
    opacity: 1;
    padding: 1rem;
    font-size: 1rem;
    background-color: white
}`);
    });

    it('should allow mixing plugin methods with built-in methods', () => {
      const { select } = createSurimi({
        plugins: [WithAnimations, WithSpacing],
      });

      // Apply padding first, then use standard methods
      // @ts-expect-error - Plugin methods available at runtime
      select('.button').padding('0.5rem 1rem');

      // Apply animation on hover (plugin methods work on initial select)
      select('.button')
        .hover()
        .style({
          animation: 'fadeIn 0.2s',
          opacity: '1',
          backgroundColor: 'blue',
        });

      expect(Surimi.build()).toBe(`\
.button {
    padding: 0.5rem 1rem
}
.button:hover {
    animation: fadeIn 0.2s;
    opacity: 1;
    background-color: blue
}`);
    });

    it('should work with navigation methods', () => {
      const { select } = createSurimi({
        plugins: [WithSpacing, WithTypography],
      });

      // @ts-expect-error - Plugin methods available at runtime
      select('.menu').padding('1rem');

      select('.menu')
        .child('li')
        .style({
          marginTop: '0.5rem',
          marginBottom: '0.5rem',
          fontSize: '0.875rem',
        });

      expect(Surimi.build()).toBe(`\
.menu {
    padding: 1rem
}
.menu > li {
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
    font-size: 0.875rem
}`);
    });

    it('should work with pseudo-elements', () => {
      const { select } = createSurimi({
        plugins: [WithTypography],
      });

      select('.quote')
        .before()
        .style({
          content: '"❝"',
          fontSize: '1.5rem',
          color: 'gray',
        });

      expect(Surimi.build()).toBe(`\
.quote::before {
    content: "❝";
    font-size: 1.5rem;
    color: gray
}`);
    });
  });

  describe('Plugin Chaining', () => {
    it('should support method chaining with plugin methods', () => {
      const { select } = createSurimi({
        plugins: [WithAnimations, WithSpacing, WithTypography],
      });

      select('.element')
        .fadeIn()
        .padding('1rem')
        .fontSize('lg')
        .fontWeight('bold')
        .textAlign('center');

      expect(Surimi.build()).toBe(`\
.element {
    animation: fadeIn 0.3s;
    opacity: 1;
    padding: 1rem;
    font-size: 1.125rem;
    font-weight: 700;
    text-align: center
}`);
    });

    it('should allow multiple style() calls with plugin methods', () => {
      const { select } = createSurimi({ plugins: [WithSpacing] });

      select('.box')
        .padding('1rem')
        .style({ backgroundColor: 'red' })
        .margin('0.5rem')
        .style({ color: 'white' });

      expect(Surimi.build()).toBe(`\
.box {
    padding: 1rem;
    background-color: red;
    margin: 0.5rem;
    color: white
}`);
    });
  });
});
