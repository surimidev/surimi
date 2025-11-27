import { beforeEach, describe, expect, it } from 'vitest';

import { SurimiContext } from '@surimi/common';
import { createSelectorBuilderFromString } from '@surimi/core';

import { when } from '../src';

describe('ConditionalBuilder', () => {
  beforeEach(() => {
    SurimiContext.clear();
  });

  describe('Basic Conditional Selectors', () => {
    it('should create conditional selector with hover state', () => {
      when('.button').hovered().select('.container').style({ color: 'red' });

      expect(SurimiContext.build()).toBe(`:where(html):has(.button:hover) .container {
    color: red
}`);
    });

    it('should create conditional selector with focus state', () => {
      when('.input').focused().select('html').style({ backgroundColor: 'blue' });

      expect(SurimiContext.build()).toBe(`:where(html):has(.input:focus) html {
    background-color: blue
}`);
    });

    it('should handle checked state', () => {
      when('.checkbox').checked().select('.icon').style({ display: 'block' });

      expect(SurimiContext.build()).toBe(`:where(html):has(.checkbox:checked) .icon {
    display: block
}`);
    });

    it('should handle disabled state', () => {
      when('.button').disabled().select('.form').style({ opacity: '0.5' });

      expect(SurimiContext.build()).toBe(`:where(html):has(.button:disabled) .form {
    opacity: 0.5
}`);
    });
  });

  describe('Complex Selectors', () => {
    it('should handle element selectors', () => {
      when('button').hovered().select('html > .container').style({ color: 'red' });

      expect(SurimiContext.build()).toBe(`:where(html):has(button:hover) html > .container {
    color: red
}`);
    });

    it('should handle ID selectors', () => {
      when('#submit-button').active().select('.modal').style({ zIndex: '1000' });

      expect(SurimiContext.build()).toBe(`:where(html):has(#submit-button:active) .modal {
    z-index: 1000
}`);
    });

    it('should handle attribute selectors', () => {
      when('[data-state="active"]').hovered().select('.tooltip').style({ visibility: 'visible' });

      expect(SurimiContext.build()).toBe(`:where(html):has([data-state="active"]:hover) .tooltip {
    visibility: visible
}`);
    });
  });

  describe('Multiple Conditional Styles', () => {
    it('should support multiple independent conditions', () => {
      when('.button').hovered().select('.container').style({ color: 'red' });
      when('.button').focused().select('.container').style({ borderColor: 'blue' });

      expect(SurimiContext.build()).toBe(`:where(html):has(.button:hover) .container {
    color: red
}
:where(html):has(.button:focus) .container {
    border-color: blue
}`);
    });

    it('should support different selectors with same condition', () => {
      when('.button').hovered().select('.container').style({ color: 'red' });
      when('.link').hovered().select('.sidebar').style({ backgroundColor: 'gray' });

      expect(SurimiContext.build()).toBe(`:where(html):has(.button:hover) .container {
    color: red
}
:where(html):has(.link:hover) .sidebar {
    background-color: gray
}`);
    });

    it('should support chained styles on same conditional selector', () => {
      const hoverButton = when('.button').hovered().select('.container');
      hoverButton.style({ color: 'red' });
      hoverButton.style({ backgroundColor: 'yellow' });

      expect(SurimiContext.build()).toBe(`:where(html):has(.button:hover) .container {
    color: red;
    background-color: yellow
}`);
    });
  });

  describe('Various Pseudo-classes', () => {
    it('should support focus-within', () => {
      when('.form').focusedWithin().select('body').style({ backgroundColor: '#f0f0f0' });

      expect(SurimiContext.build()).toBe(`:where(html):has(.form:focus-within) body {
    background-color: #f0f0f0
}`);
    });

    it('should support focus-visible', () => {
      when('.button').focusedVisible().select('.overlay').style({ display: 'block' });

      expect(SurimiContext.build()).toBe(`:where(html):has(.button:focus-visible) .overlay {
    display: block
}`);
    });

    it('should support valid and invalid states', () => {
      when('.input').valid().select('.success-icon').style({ display: 'inline' });
      when('.input').invalid().select('.error-icon').style({ display: 'inline' });

      expect(SurimiContext.build()).toBe(`:where(html):has(.input:valid) .success-icon {
    display: inline
}
:where(html):has(.input:invalid) .error-icon {
    display: inline
}`);
    });

    it('should support nth-child', () => {
      when('.item').nthChild(2).select('.list').style({ backgroundColor: 'lightgray' });

      expect(SurimiContext.build()).toBe(`:where(html):has(.item:nth-child(2)) .list {
    background-color: lightgray
}`);
    });

    it('should support :not pseudo-class with excluding()', () => {
      when('.button').excluding('.disabled').select('.form').style({ opacity: '1' });

      expect(SurimiContext.build()).toBe(`:where(html):has(.button:not(.disabled)) .form {
    opacity: 1
}`);
    });
  });

  describe('Real-world Use Cases', () => {
    it('should create form validation indicator', () => {
      // Show validation message when input is invalid and focused
      when('.email-input').invalid().select('.error-message').style({
        display: 'block',
        color: 'red',
      });

      // Show success indicator when input is valid
      when('.email-input').valid().select('.success-icon').style({
        display: 'inline',
        color: 'green',
      });

      expect(SurimiContext.build()).toBe(`:where(html):has(.email-input:invalid) .error-message {
    display: block;
    color: red
}
:where(html):has(.email-input:valid) .success-icon {
    display: inline;
    color: green
}`);
    });

    it('should create interactive card hover effect', () => {
      // When card is hovered, show overlay
      when('.card').hovered().select('.card-overlay').style({
        opacity: '1',
        visibility: 'visible',
      });

      // When card button is focused, highlight the whole card
      when('.card-button').focused().select('.card').style({
        boxShadow: '0 0 0 3px rgba(0, 0, 255, 0.3)',
      });

      expect(SurimiContext.build()).toBe(`:where(html):has(.card:hover) .card-overlay {
    opacity: 1;
    visibility: visible
}
:where(html):has(.card-button:focus) .card {
    box-shadow: 0 0 0 3px rgba(0, 0, 255, 0.3)
}`);
    });

    it('should create checkbox toggle UI', () => {
      // Show content when checkbox is checked
      when('#show-details').checked().select('.details-panel').style({
        maxHeight: '500px',
        opacity: '1',
        transition: 'all 0.3s ease',
      });

      // Hide content when checkbox is not checked (using excluding())
      when('#show-details').excluding(':checked').select('.details-panel').style({
        maxHeight: '0',
        opacity: '0',
        overflow: 'hidden',
      });

      expect(SurimiContext.build()).toBe(`:where(html):has(#show-details:checked) .details-panel {
    max-height: 500px;
    opacity: 1;
    transition: all 0.3s ease
}
:where(html):has(#show-details:not(:checked)) .details-panel {
    max-height: 0;
    opacity: 0;
    overflow: hidden
}`);
    });
  });

  describe('Using "is" chain syntax', () => {
    it('should support is.hovered() syntax', () => {
      when('.button').is.hovered().select('.container').style({ color: 'blue' });

      expect(SurimiContext.build()).toBe(`:where(html):has(.button:hover) .container {
    color: blue
}`);
    });

    it('should support is.firstChild() syntax', () => {
      when('.item').is.firstChild().select('.list').style({ fontWeight: 'bold' });

      expect(SurimiContext.build()).toBe(`:where(html):has(.item:first-child) .list {
    font-weight: bold
}`);
    });

    it('should support is.nthChild() syntax', () => {
      when('.row').is.nthChild('2n').select('.table').style({ backgroundColor: '#f0f0f0' });

      expect(SurimiContext.build()).toBe(`:where(html):has(.row:nth-child(2n)) .table {
    background-color: #f0f0f0
}`);
    });

    it('should support is.checked() syntax', () => {
      when('.toggle').is.checked().select('.panel').style({ display: 'block' });

      expect(SurimiContext.build()).toBe(`:where(html):has(.toggle:checked) .panel {
    display: block
}`);
    });

    it('should support is.not() syntax for excluding', () => {
      when('.element').is.excluding('.hidden').select('.parent').style({ opacity: '1' });

      expect(SurimiContext.build()).toBe(`:where(html):has(.element:not(.hidden)) .parent {
    opacity: 1
}`);
    });
  });

  describe('Using "not" negation property', () => {
    it('should support .not.active() syntax', () => {
      when('.button').not.active().select('.container').style({ opacity: '0.5' });

      expect(SurimiContext.build()).toBe(`:where(html):has(.button:not(:active)) .container {
    opacity: 0.5
}`);
    });

    it('should support .is.not.hovered() syntax', () => {
      when('.link').is.not.hovered().select('.menu').style({ backgroundColor: 'white' });

      expect(SurimiContext.build()).toBe(`:where(html):has(.link:not(:hover)) .menu {
    background-color: white
}`);
    });

    it('should support .not.checked() syntax', () => {
      when('.checkbox').not.checked().select('.label').style({ color: 'gray' });

      expect(SurimiContext.build()).toBe(`:where(html):has(.checkbox:not(:checked)) .label {
    color: gray
}`);
    });

    it('should support .not.firstChild() syntax', () => {
      when('.item').not.firstChild().select('.list').style({ marginTop: '1rem' });

      expect(SurimiContext.build()).toBe(`:where(html):has(.item:not(:first-child)) .list {
    margin-top: 1rem
}`);
    });

    it('should support .not.disabled() syntax', () => {
      when('.input').not.disabled().select('.form').style({ opacity: '1' });

      expect(SurimiContext.build()).toBe(`:where(html):has(.input:not(:disabled)) .form {
    opacity: 1
}`);
    });
  });

  describe('Using "and" for multiple conditions', () => {
    it('should support .and for chaining conditions with AND logic', () => {
      when('.button').hovered().and.focused().select('.container').style({ color: 'red' });

      expect(SurimiContext.build()).toBe(`:where(html):has(.button:hover:focus) .container {
    color: red
}`);
    });

    it('should support multiple .and chains', () => {
      when('.input').focused().and.valid().and.required().select('.form').style({ borderColor: 'green' });

      expect(SurimiContext.build()).toBe(`:where(html):has(.input:focus:valid:required) .form {
    border-color: green
}`);
    });

    it('should support .and with negation', () => {
      when('.button').hovered().and.not.disabled().select('.container').style({ cursor: 'pointer' });

      expect(SurimiContext.build()).toBe(`:where(html):has(.button:hover:not(:disabled)) .container {
    cursor: pointer
}`);
    });

    it('should support .is chain with .and', () => {
      when('.input').is.focused().and.valid().select('.form').style({ borderColor: 'blue' });

      expect(SurimiContext.build()).toBe(`:where(html):has(.input:focus:valid) .form {
    border-color: blue
}`);
    });
  });

  describe('Using "or" for alternative conditions', () => {
    it('should support .or for alternative conditions with OR logic', () => {
      when('.button').hovered().or.focused().select('.container').style({ backgroundColor: 'blue' });

      expect(SurimiContext.build()).toBe(`:where(html):has(.button:hover, .button:focus) .container {
    background-color: blue
}`);
    });

    it('should support multiple .or chains', () => {
      when('.element').active().or.focused().or.hovered().select('.parent').style({ opacity: '1' });

      expect(SurimiContext.build()).toBe(`:where(html):has(.element:active, .element:focus, .element:hover) .parent {
    opacity: 1
}`);
    });

    it('should support .or with negation', () => {
      when('.checkbox').checked().or.not.disabled().select('.form').style({ opacity: '1' });

      expect(SurimiContext.build()).toBe(`:where(html):has(.checkbox:checked, .checkbox:not(:disabled)) .form {
    opacity: 1
}`);
    });

    it('should support .is chain with .or', () => {
      when('.button').is.hovered().or.focused().select('.container').style({ color: 'red' });

      expect(SurimiContext.build()).toBe(`:where(html):has(.button:hover, .button:focus) .container {
    color: red
}`);
    });
  });

  describe('Complex combinations of and/or', () => {
    it('should support mixing .and and .or', () => {
      when('.button').hovered().and.focused().or.active().select('.container').style({ color: 'red' });

      expect(SurimiContext.build()).toBe(`:where(html):has(.button:hover:focus, .button:active) .container {
    color: red
}`);
    });

    it('should support complex chains with negation', () => {
      when('.input')
        .focused()
        .and.not.disabled()
        .or.hovered()
        .and.valid()
        .select('.form')
        .style({ borderColor: 'blue' });

      expect(SurimiContext.build()).toBe(`:where(html):has(.input:focus:not(:disabled), .input:hover:valid) .form {
    border-color: blue
}`);
    });

    it('should support real-world validation scenario', () => {
      // Style form when input is (focused and valid) or (not empty and not invalid)
      when('.input').focused().and.valid().or.not.blank().and.not.invalid().select('.form').style({
        backgroundColor: 'lightgreen',
      });

      expect(SurimiContext.build()).toBe(`:where(html):has(.input:focus:valid, .input:not(:blank):not(:invalid)) .form {
    background-color: lightgreen
}`);
    });
  });

  describe('Builder reusability', () => {
    it('should allow reusing a when() builder with different conditions', () => {
      const buttonCondition = when('.button');

      // Apply different conditions to the same base builder
      buttonCondition.hovered().select('.container-1').style({ backgroundColor: 'blue' });
      buttonCondition.focused().select('.container-2').style({ backgroundColor: 'green' });
      buttonCondition.active().select('.container-3').style({ backgroundColor: 'red' });

      expect(SurimiContext.build()).toBe(`:where(html):has(.button:hover) .container-1 {
    background-color: blue
}
:where(html):has(.button:focus) .container-2 {
    background-color: green
}
:where(html):has(.button:active) .container-3 {
    background-color: red
}`);
    });

    it('should allow reusing chained conditions', () => {
      const enabledButton = when('.button').not.disabled();

      // Reuse the "enabled button" condition with different additional states
      enabledButton.and.hovered().select('.tooltip-1').style({ display: 'block' });
      enabledButton.and.focused().select('.tooltip-2').style({ display: 'block' });

      expect(SurimiContext.build()).toBe(`:where(html):has(.button:not(:disabled):hover) .tooltip-1 {
    display: block
}
:where(html):has(.button:not(:disabled):focus) .tooltip-2 {
    display: block
}`);
    });

    it('should allow programmatic condition building with loops', () => {
      const states = ['hovered', 'focused', 'active'] as const;
      const button = when('.interactive-btn');

      states.forEach((state, index) => {
        button[state]().select(`.state-indicator-${index}`).style({
          opacity: '1',
        });
      });

      expect(SurimiContext.build()).toBe(`:where(html):has(.interactive-btn:hover) .state-indicator-0 {
    opacity: 1
}
:where(html):has(.interactive-btn:focus) .state-indicator-1 {
    opacity: 1
}
:where(html):has(.interactive-btn:active) .state-indicator-2 {
    opacity: 1
}`);
    });

    it('should allow creating multiple OR branches from a base condition', () => {
      const input = when('.input');

      // Create different OR scenarios from the same base
      const validInput = input.valid();
      validInput.or.focused().select('.form-1').style({ borderColor: 'green' });

      const invalidInput = input.invalid();
      invalidInput.or.focused().select('.form-2').style({ borderColor: 'red' });

      expect(SurimiContext.build()).toBe(`:where(html):has(.input:valid, .input:focus) .form-1 {
    border-color: green
}
:where(html):has(.input:invalid, .input:focus) .form-2 {
    border-color: red
}`);
    });
  });

  describe('Nested and complex selectors', () => {
    it('should handle nested child selectors in when()', () => {
      when('.container > .button').hovered().select('.header').style({ color: 'blue' });

      expect(SurimiContext.build()).toBe(`:where(html):has(.container > .button:hover) .header {
    color: blue
}`);
    });

    it('should handle nested child selectors in select()', () => {
      when('.button').focused().select('.header > .title').style({ fontWeight: 'bold' });

      expect(SurimiContext.build()).toBe(`:where(html):has(.button:focus) .header > .title {
    font-weight: bold
}`);
    });

    it('should handle both when() and select() with nested selectors', () => {
      when('.sidebar > .nav-item').active().select('.main-content > .section').style({
        borderLeft: '3px solid blue',
      });

      expect(SurimiContext.build()).toBe(`:where(html):has(.sidebar > .nav-item:active) .main-content > .section {
    border-left: 3px solid blue
}`);
    });

    it('should handle descendant selectors', () => {
      when('.card .button').hovered().select('.card .header').style({
        backgroundColor: 'lightgray',
      });

      expect(SurimiContext.build()).toBe(`:where(html):has(.card .button:hover) .card .header {
    background-color: lightgray
}`);
    });

    it('should handle sibling selectors', () => {
      when('.checkbox + .label').hovered().select('.form-group').style({
        backgroundColor: 'lightyellow',
      });

      expect(SurimiContext.build()).toBe(`:where(html):has(.checkbox + .label:hover) .form-group {
    background-color: lightyellow
}`);
    });

    it('should handle general sibling selectors', () => {
      when('.heading ~ .paragraph').hovered().select('.article').style({
        outline: '1px solid gray',
      });

      expect(SurimiContext.build()).toBe(`:where(html):has(.heading ~ .paragraph:hover) .article {
    outline: 1px solid gray
}`);
    });

    it('should handle attribute selectors', () => {
      when('button[type="submit"]').hovered().select('form').style({
        borderColor: 'green',
      });

      expect(SurimiContext.build()).toBe(`:where(html):has(button[type="submit"]:hover) form {
    border-color: green
}`);
    });

    it('should handle complex multi-part selectors', () => {
      when('.sidebar > nav > ul > li > a').active().select('body > main').style({
        marginLeft: '250px',
      });

      expect(SurimiContext.build()).toBe(`:where(html):has(.sidebar > nav > ul > li > a:active) body > main {
    margin-left: 250px
}`);
    });

    it('should handle pseudo-classes in base selector with additional conditions', () => {
      when('.item:first-child').hovered().select('.list').style({
        paddingTop: '1rem',
      });

      expect(SurimiContext.build()).toBe(`:where(html):has(.item:first-child:hover) .list {
    padding-top: 1rem
}`);
    });

    it('should handle combining nested selectors with .and operations', () => {
      when('.form > .input').focused().and.valid().select('.form > .submit-button').style({
        opacity: '1',
      });

      expect(SurimiContext.build()).toBe(`:where(html):has(.form > .input:focus:valid) .form > .submit-button {
    opacity: 1
}`);
    });

    it('should handle combining nested selectors with .or operations', () => {
      when('.modal .close-button').hovered().or.focused().select('.modal .overlay').style({
        opacity: '0.9',
      });

      expect(SurimiContext.build())
        .toBe(`:where(html):has(.modal .close-button:hover, .modal .close-button:focus) .modal .overlay {
    opacity: 0.9
}`);
    });
  });

  describe('Using SelectorBuilder instances', () => {
    it('should accept SelectorBuilder in when()', () => {
      const buttonSelector = createSelectorBuilderFromString(['.button'], SurimiContext.root, SurimiContext.root);

      when(buttonSelector).hovered().select('.container').style({ backgroundColor: 'blue' });

      expect(SurimiContext.build()).toBe(`:where(html):has(.button:hover) .container {
    background-color: blue
}`);
    });

    it('should accept SelectorBuilder in select()', () => {
      const containerSelector = createSelectorBuilderFromString(['.container'], SurimiContext.root, SurimiContext.root);

      when('.button').focused().select(containerSelector).style({ borderColor: 'green' });

      expect(SurimiContext.build()).toBe(`:where(html):has(.button:focus) .container {
    border-color: green
}`);
    });

    it('should accept SelectorBuilder in both when() and select()', () => {
      const inputSelector = createSelectorBuilderFromString(['.input'], SurimiContext.root, SurimiContext.root);
      const formSelector = createSelectorBuilderFromString(['.form'], SurimiContext.root, SurimiContext.root);

      when(inputSelector).valid().select(formSelector).style({ opacity: '1' });

      expect(SurimiContext.build()).toBe(`:where(html):has(.input:valid) .form {
    opacity: 1
}`);
    });

    it('should work with complex SelectorBuilder instances', () => {
      const nestedSelector = createSelectorBuilderFromString(
        ['.sidebar > .nav > .item'],
        SurimiContext.root,
        SurimiContext.root,
      );
      const targetSelector = createSelectorBuilderFromString(['.main-content'], SurimiContext.root, SurimiContext.root);

      when(nestedSelector).active().select(targetSelector).style({ marginLeft: '250px' });

      expect(SurimiContext.build()).toBe(`:where(html):has(.sidebar > .nav > .item:active) .main-content {
    margin-left: 250px
}`);
    });

    it('should work with SelectorBuilder and .and operations', () => {
      const buttonSelector = createSelectorBuilderFromString(['.submit-btn'], SurimiContext.root, SurimiContext.root);

      when(buttonSelector).hovered().and.not.disabled().select('.form').style({ cursor: 'pointer' });

      expect(SurimiContext.build()).toBe(`:where(html):has(.submit-btn:hover:not(:disabled)) .form {
    cursor: pointer
}`);
    });

    it('should work with SelectorBuilder and .or operations', () => {
      const linkSelector = createSelectorBuilderFromString(['.link'], SurimiContext.root, SurimiContext.root);
      const navSelector = createSelectorBuilderFromString(['.nav'], SurimiContext.root, SurimiContext.root);

      when(linkSelector).hovered().or.focused().select(navSelector).style({ backgroundColor: 'lightgray' });

      expect(SurimiContext.build()).toBe(`:where(html):has(.link:hover, .link:focus) .nav {
    background-color: lightgray
}`);
    });
  });
});
