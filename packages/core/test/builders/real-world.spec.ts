import { beforeEach, describe, expect, it } from 'vitest';

import { media, select, Surimi } from '../../src/index';

describe('Real-world Scenarios', () => {
  beforeEach(() => {
    Surimi.clear();
  });

  describe('Complex Component Systems', () => {
    it('should handle saving selectors to variables and reusing them', () => {
      // Save selectors to variables for reuse
      const button = select('.btn');
      const primaryButton = select('.btn-primary');
      const card = select('.card');

      // Base button styles
      button.style({
        padding: '0.75rem 1.5rem',
        border: 'none',
        borderRadius: '0.375rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
      });

      // Reuse button selector for hover state
      button.hover().style({
        transform: 'translateY(-1px)',
      });

      // Primary button variant
      primaryButton.style({
        backgroundColor: '#3b82f6',
        color: 'white',
      });

      // Card with nested elements
      card.style({
        backgroundColor: '#ffffff',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      });

      card.descendant('.btn').style({
        margin: '0.5rem',
      });

      expect(Surimi.build()).toBe(`\
.btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.2s ease-in-out
}
.btn:hover {
    transform: translateY(-1px)
}
.btn-primary {
    background-color: #3b82f6;
    color: white
}
.card {
    background-color: #ffffff;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1)
}
.card .btn {
    margin: 0.5rem
}`);
    });

    it('should handle global element styling (html, body)', () => {
      // Global reset and base styles
      select('html').style({
        boxSizing: 'border-box',
        fontSize: '16px',
        lineHeight: '1.6',
      });

      select('*').style({
        boxSizing: 'inherit',
      });

      select('body').style({
        margin: '0',
        padding: '0',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        backgroundColor: '#f8fafc',
        color: '#334155',
      });

      // Typography
      select('h1', 'h2', 'h3', 'h4', 'h5', 'h6').style({
        margin: '0 0 1rem 0',
        fontWeight: '600',
        lineHeight: '1.2',
      });

      select('h1').style({ fontSize: '2.5rem' });
      select('h2').style({ fontSize: '2rem' });
      select('h3').style({ fontSize: '1.5rem' });

      select('p').style({
        margin: '0 0 1rem 0',
      });

      select('a').style({
        color: '#3b82f6',
        textDecoration: 'none',
      });

      select('a').hover().style({
        textDecoration: 'underline',
      });

      expect(Surimi.build()).toBe(`\
html {
    box-sizing: border-box;
    font-size: 16px;
    line-height: 1.6
}
* {
    box-sizing: inherit
}
body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background-color: #f8fafc;
    color: #334155
}
h1, h2, h3, h4, h5, h6 {
    margin: 0 0 1rem 0;
    font-weight: 600;
    line-height: 1.2
}
h1 {
    font-size: 2.5rem
}
h2 {
    font-size: 2rem
}
h3 {
    font-size: 1.5rem
}
p {
    margin: 0 0 1rem 0
}
a {
    color: #3b82f6;
    text-decoration: none
}
a:hover {
    text-decoration: underline
}`);
    });

    it('should handle property overriding and cascading', () => {
      // Base button
      select('.btn').style({
        padding: '0.5rem 1rem',
        backgroundColor: '#e5e7eb',
        color: '#374151',
        border: 'none',
        borderRadius: '0.25rem',
      });

      // Override with primary variant
      select('.btn.primary').style({
        backgroundColor: '#3b82f6',
        color: 'white',
      });

      // Override with large size
      select('.btn.large').style({
        padding: '1rem 2rem',
        fontSize: '1.125rem',
      });

      // Combine variants - should override base styles
      select('.btn.primary.large').style({
        fontWeight: 'bold',
      });

      // State overrides
      select('.btn').hover().style({
        opacity: '0.9',
      });

      select('.btn.primary').hover().style({
        backgroundColor: '#2563eb',
      });

      expect(Surimi.build()).toBe(`\
.btn {
    padding: 0.5rem 1rem;
    background-color: #e5e7eb;
    color: #374151;
    border: none;
    border-radius: 0.25rem
}
.btn.primary {
    background-color: #3b82f6;
    color: white
}
.btn.large {
    padding: 1rem 2rem;
    font-size: 1.125rem
}
.btn.primary.large {
    font-weight: bold
}
.btn:hover {
    opacity: 0.9
}
.btn.primary:hover {
    background-color: #2563eb
}`);
    });
  });

  describe('Advanced Chaining and Media Queries', () => {
    it('should handle chaining multiple pseudo-classes', () => {
      // Chain focus and hover
      select('.input').focus().hover().style({
        borderColor: '#3b82f6',
        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
      });

      // Chain disabled and hover (should not apply hover on disabled)
      select('.input').disabled().style({
        opacity: '0.5',
        cursor: 'not-allowed',
      });

      // Active state
      select('.btn').active().style({
        transform: 'translateY(1px)',
      });

      // Focus state for better accessibility
      select('.btn').focus().style({
        outline: '2px solid #3b82f6',
        outlineOffset: '2px',
      });

      expect(Surimi.build()).toBe(`\
.input:focus:hover {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1)
}
.input:disabled {
    opacity: 0.5;
    cursor: not-allowed
}
.btn:active {
    transform: translateY(1px)
}
.btn:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px
}`);
    });

    it('should handle complex media query combinations', () => {
      // Base styles
      select('.container').style({
        width: '100%',
        padding: '1rem',
      });

      // Mobile first approach
      media().minWidth('640px').select('.container').style({
        maxWidth: '640px',
        margin: '0 auto',
      });

      media().minWidth('768px').select('.container').style({
        maxWidth: '768px',
        padding: '2rem',
      });

      media().minWidth('1024px').select('.container').style({
        maxWidth: '1024px',
      });

      // Responsive typography
      select('h1').style({
        fontSize: '2rem',
      });

      media().minWidth('').select('h1').style({
        fontSize: '3rem',
      });

      // Dark mode support
      media().prefersColorScheme('dark').select('body').style({
        backgroundColor: '#1f2937',
        color: '#f9fafb',
      });

      // Print styles
      media().print().select('.no-print').style({
        display: 'none',
      });

      expect(Surimi.build()).toBe(`\
.container {
    width: 100%;
    padding: 1rem
}
@media ( min-width : 640px ) {
    .container {
        max-width: 640px;
        margin: 0 auto
    }
}
@media ( min-width : 768px ) {
    .container {
        max-width: 768px;
        padding: 2rem
    }
}
@media ( min-width : 1024px ) {
    .container {
        max-width: 1024px
    }
}
h1 {
    font-size: 2rem
}
@media ( min-width : ) {
    h1 {
        font-size: 3rem
    }
}
@media ( prefers-color-scheme : dark ) {
    body {
        background-color: #1f2937;
        color: #f9fafb
    }
}
@media print {
    .no-print {
        display: none
    }
}`);
    });

    it('should handle pseudo-classes within media queries', () => {
      // Button hover in desktop
      media().minWidth('1024px').select('.btn').hover().style({
        transform: 'scale(1.05)',
        transition: 'transform 0.2s ease',
      });

      // Touch devices - remove hover effects
      media().hover('none').select('.btn').style({
        transform: 'none',
      });

      // Focus styles for keyboard navigation
      media().prefersReducedMotion('no-preference').select('.btn').focus().style({
        outline: '2px solid #3b82f6',
        outlineOffset: '2px',
        transition: 'outline 0.2s ease',
      });

      expect(Surimi.build()).toBe(`\
@media ( min-width : 1024px ) {
    .btn:hover {
        transform: scale(1.05);
        transition: transform 0.2s ease
    }
}
@media ( hover : none ) {
    .btn {
        transform: none
    }
}
@media ( prefers-reduced-motion : no-preference ) {
    .btn:focus {
        outline: 2px solid #3b82f6;
        outline-offset: 2px;
        transition: outline 0.2s ease
    }
}`);
    });

    it('should allow selecting with where clauses in media queries', () => {
      media()
        .maxWidth('600px')
        .and()
        .minHeight('200px')
        .select('html')
        .descendant('.button')
        .hover()
        .child('.icon')
        .where('.svg')
        .style({
          display: 'none',
        });

      expect(Surimi.build()).toBe(`\
@media ( max-width : 600px ) and ( min-height : 200px ) {
    html .button:hover > .icon:where(.svg) {
        display: none
    }
}`);
    });
  });

  describe('Framework-like Patterns', () => {
    it('should create utility classes similar to Tailwind CSS', () => {
      // Spacing utilities
      select('.p-4').style({ padding: '1rem' });
      select('.px-4').style({ paddingLeft: '1rem', paddingRight: '1rem' });
      select('.py-4').style({ paddingTop: '1rem', paddingBottom: '1rem' });
      select('.m-4').style({ margin: '1rem' });
      select('.mx-auto').style({ marginLeft: 'auto', marginRight: 'auto' });

      // Display utilities
      select('.flex').style({ display: 'flex' });
      select('.grid').style({ display: 'grid' });
      select('.hidden').style({ display: 'none' });
      select('.block').style({ display: 'block' });

      // Flexbox utilities
      select('.justify-center').style({ justifyContent: 'center' });
      select('.justify-between').style({ justifyContent: 'space-between' });
      select('.items-center').style({ alignItems: 'center' });
      select('.flex-col').style({ flexDirection: 'column' });

      // Text utilities
      select('.text-center').style({ textAlign: 'center' });
      select('.text-lg').style({ fontSize: '1.125rem' });
      select('.font-bold').style({ fontWeight: 'bold' });

      // Color utilities
      select('.text-blue-600').style({ color: '#2563eb' });
      select('.bg-gray-100').style({ backgroundColor: '#f3f4f6' });

      // Responsive utilities
      media().minWidth('768px').select('.md:flex').style({ display: 'flex' });
      media().minWidth('1024px').select('.lg:text-xl').style({ fontSize: '1.25rem' });

      expect(Surimi.build()).toBe(`\
.p-4 {
    padding: 1rem
}
.px-4 {
    padding-left: 1rem;
    padding-right: 1rem
}
.py-4 {
    padding-top: 1rem;
    padding-bottom: 1rem
}
.m-4 {
    margin: 1rem
}
.mx-auto {
    margin-left: auto;
    margin-right: auto
}
.flex {
    display: flex
}
.grid {
    display: grid
}
.hidden {
    display: none
}
.block {
    display: block
}
.justify-center {
    justify-content: center
}
.justify-between {
    justify-content: space-between
}
.items-center {
    align-items: center
}
.flex-col {
    flex-direction: column
}
.text-center {
    text-align: center
}
.text-lg {
    font-size: 1.125rem
}
.font-bold {
    font-weight: bold
}
.text-blue-600 {
    color: #2563eb
}
.bg-gray-100 {
    background-color: #f3f4f6
}
@media ( min-width : 768px ) {
    .md:flex {
        display: flex
    }
}
@media ( min-width : 1024px ) {
    .lg:text-xl {
        font-size: 1.25rem
    }
}`);
    });
  });
});
