/**
 * Example usage of the Surimi plugin system
 * 
 * This file demonstrates various ways to use plugins with Surimi.
 * 
 * Note: TypeScript will show errors for plugin methods because the type system
 * cannot infer plugin methods at compile time. However, the code works correctly
 * at runtime. This is an expected limitation of the current plugin system.
 */

import { createSurimi, Surimi } from '../../index';
import { WithAnimations } from './animation-plugin.example';
import { WithSpacing } from './spacing-plugin.example';
import { WithTypography } from './typography-plugin.example';

// Example 1: Using a single plugin
export function singlePluginExample() {
  Surimi.clear();

  const { select } = createSurimi({ plugins: [WithAnimations] });

  select('.modal')
    .fadeIn('0.5s')
    .style({ backgroundColor: 'white' });

  return Surimi.build();
}

// Example 2: Using multiple plugins
export function multiplePluginsExample() {
  Surimi.clear();

  const { select } = createSurimi({
    plugins: [WithAnimations, WithSpacing, WithTypography],
  });

  select('.card')
    .fadeIn('0.3s') // from WithAnimations
    .padding('1rem') // from WithSpacing
    .fontSize('lg') // from WithTypography
    .hover()
    .style({ boxShadow: '0 4px 8px rgba(0,0,0,0.1)' });

  return Surimi.build();
}

// Example 3: Complex usage with chaining
export function complexChainingExample() {
  Surimi.clear();

  const { select } = createSurimi({
    plugins: [WithAnimations, WithSpacing, WithTypography],
  });

  // Button with animations and spacing
  select('.btn')
    .padding('0.5rem 1rem')
    .fontSize('base')
    .fontWeight('semibold')
    .style({
      backgroundColor: 'blue',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
    });

  select('.btn')
    .hover()
    .fadeIn('0.2s')
    .style({
      backgroundColor: 'darkblue',
    });

  // Card with full typography control
  select('.article')
    .marginY('2rem')
    .paddingX('1.5rem')
    .lineHeight('1.6');

  select('.article')
    .child('h1')
    .fontSize('3xl')
    .fontWeight('bold')
    .marginY('1rem');

  select('.article')
    .child('p')
    .fontSize('base')
    .lineHeight('1.8')
    .textColor('#333');

  return Surimi.build();
}

// Example 4: Animation showcase
export function animationShowcaseExample() {
  Surimi.clear();

  const { select } = createSurimi({ plugins: [WithAnimations] });

  select('.fade-in-box').fadeIn();
  select('.fade-out-box').fadeOut();
  select('.slide-left').slideIn('left');
  select('.slide-right').slideIn('right');
  select('.pulse-box').pulse();
  select('.bounce-box').bounce('0.5s');

  return Surimi.build();
}

// Example 5: Typography utilities
export function typographyExample() {
  Surimi.clear();

  const { select } = createSurimi({ plugins: [WithTypography] });

  select('.heading')
    .fontSize('2xl')
    .fontWeight('bold')
    .textAlign('center')
    .uppercase();

  select('.truncated').truncate();

  select('.clamped').lineClamp(3);

  select('.paragraph')
    .fontSize('base')
    .lineHeight('1.6')
    .letterSpacing('0.02em');

  return Surimi.build();
}

// Example 6: Layout utilities
export function layoutExample() {
  Surimi.clear();

  const { select } = createSurimi({ plugins: [WithSpacing] });

  select('.container')
    .paddingX('2rem')
    .paddingY('3rem')
    .centerX();

  select('.grid')
    .gap('1rem')
    .style({
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
    });

  select('.flex')
    .gap('0.5rem')
    .style({
      display: 'flex',
      alignItems: 'center',
    });

  return Surimi.build();
}

// Example 7: No plugins (standard Surimi)
export function standardSurimiExample() {
  Surimi.clear();

  const { select } = createSurimi(); // No plugins

  select('.button')
    .hover()
    .style({
      backgroundColor: 'blue',
      color: 'white',
    });

  return Surimi.build();
}

// Example 8: Combining with existing Surimi features
export function combinedFeaturesExample() {
  Surimi.clear();

  const { select } = createSurimi({
    plugins: [WithAnimations, WithSpacing, WithTypography],
  });

  // Use plugin methods with pseudo-classes
  select('.link')
    .fontSize('base')
    .textColor('blue')
    .hover()
    .textColor('darkblue')
    .fadeIn('0.1s');

  // Use plugin methods with navigation
  select('.menu')
    .padding('1rem')
    .child('li')
    .marginY('0.5rem')
    .fontSize('sm');

  // Use plugin methods with pseudo-elements
  select('.quote')
    .before()
    .style({ content: '"❝"' })
    .fontSize('2xl')
    .textColor('gray');

  return Surimi.build();
}
