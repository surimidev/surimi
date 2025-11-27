# @surimi/conditional

A powerful conditional selector builder for Surimi CSS, enabling you to style elements based on the state of other elements using the modern `:has()` selector.

## Installation

```bash
pnpm add @surimi/conditional
```

## Basic Usage

```typescript
import { when } from '@surimi/conditional';

// Style a container when a button is hovered
when('.button').hovered().select('.container').style({
  backgroundColor: 'blue',
});

// Generates: :where(html):has(.button:hover) .container { background-color: blue; }
```

## How It Works

Easy:

```typescript
when('.button').hovered().select('.container')
// ↓ Generates:
:where(html):has(.button:hover) .container
```

Then, you can make it more complex with methods like `.and()`, `.or()`, sub-selects, nesting...

## Features

### Basic Pseudo-Classes

All common pseudo-classes are available as readable methods:

```typescript
when('.input').focused(); // :focus
when('.checkbox').checked(); // :checked
when('.button').disabled(); // :disabled
when('.element').active(); // :active
when('.link').visited(); // :visited
when('.form').valid(); // :valid
when('.field').invalid(); // :invalid
when('.element').hovered(); // :hover
// ... and many more!
```

### Syntactic Sugar with `.is`

For more natural reading, use the `.is` property:

```typescript
when('.button').is.hovered();
when('.input').is.focused();
when('.checkbox').is.checked();
```

### Negation with `.not`

Negate conditions using the `.not` property:

```typescript
when('.button').not.disabled().select('.form').style({ opacity: '1' });
// :where(html):has(.button:not(:disabled)) .form

when('.input').is.not.focused().select('.label').style({ color: 'gray' });
// :where(html):has(.input:not(:focus)) .label
```

### Combining Conditions with `.and`

Chain multiple conditions together with AND logic (all conditions must be met):

```typescript
when('.button').hovered().and.focused().select('.container').style({
  borderColor: 'blue',
});
// :where(html):has(.button:hover:focus) .container

when('.input').focused().and.valid().and.not.disabled().select('.form').style({
  borderColor: 'green',
});
// :where(html):has(.input:focus:valid:not(:disabled)) .form
```

The `.and` property allows chaining. All conditions are concatenated in the final selector.

### Alternative Conditions with `.or`

Create alternatives using OR logic (any condition can be met):

```typescript
when('.button').hovered().or.focused().select('.container').style({
  backgroundColor: 'lightblue',
});
// :where(html):has(.button:hover, .button:focus) .container

when('.element').active().or.focused().or.hovered().select('.parent').style({
  opacity: '1',
});
// :where(html):has(.element:active, .element:focus, .element:hover) .parent
```

The `.or` property starts a new condition group. Groups are separated by commas (CSS OR logic).

### Complex Combinations

Mix `.and` and `.or` to create sophisticated conditional logic:

```typescript
// Style form when input is (focused AND valid) OR (hovered AND enabled)
when('.input').focused().and.valid().or.hovered().and.not.disabled().select('.form').style({ borderColor: 'green' });

// Generates: :where(html):has(.input:focus:valid, .input:hover:not(:disabled)) .form
```

## Real-World Examples

### Form Validation Indicator

```typescript
// Green border when input is focused and valid
when('.input').focused().and.valid().select('.form-group').style({
  borderColor: 'green',
});

// Red border when input is focused and invalid
when('.input').focused().and.invalid().select('.form-group').style({
  borderColor: 'red',
});
```

### Interactive Card

```typescript
// Highlight card when button inside is hovered or focused
when('.card-button').hovered().or.focused().select('.card').style({
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  transform: 'translateY(-2px)',
});
```

### Accessible Toggle State

```typescript
// Style label when checkbox is checked and enabled
when('.toggle-checkbox').checked().and.not.disabled().select('.toggle-label').style({
  backgroundColor: 'green',
  color: 'white',
});

// Style label when checkbox is unchecked and enabled
when('.toggle-checkbox').not.checked().and.not.disabled().select('.toggle-label').style({
  backgroundColor: 'gray',
  color: 'black',
});
```

### Cross-Component Styling

```typescript
// Dim main content when sidebar menu is open
when('.sidebar-toggle').checked().select('.main-content').style({
  opacity: '0.5',
  pointerEvents: 'none',
});

// This works even though .sidebar-toggle and .main-content
// might be in completely different parts of your DOM tree!
```

## API Reference

### Core Methods

- `when(selector: string | SelectorBuilder)` - Start a conditional selector chain
- `.select(selector: string | SelectorBuilder)` - Choose the element to style when condition is met
- `.style(properties: CssProperties | StyleBuilder)` - Apply CSS styles

### Pseudo-Class Methods

All methods return a chainable builder:

**Interaction States:**

- `hovered()`, `focused()`, `active()`, `visited()`
- `focusedWithin()`, `focusedVisible()`

**Form States:**

- `checked()`, `disabled()`, `enabled()`
- `valid()`, `invalid()`
- `required()`, `optional()`
- `readOnly()`, `readWrite()`
- `placeholderShown()`
- `defaulted()`, `indeterminate()`
- `blank()`, `empty()`

**Structural:**

- `firstChild()`, `lastChild()`, `onlyChild()`
- `firstOfType()`, `lastOfType()`, `onlyOfType()`
- `nthChild(n)`, `nthLastChild(n)`
- `nthOfType(n)`, `nthLastOfType(n)`

**Other:**

- `targeted()`

**Selector Functions:**

- `excluding(selector)` - Equivalent to `:not(selector)`
- `matches(selector)` - Equivalent to `:is(selector)`
- `where(selector)` - Equivalent to `:where(selector)`
- `contains(selector)` - Equivalent to `:has(selector)`
- `inLanguage(lang)` - Equivalent to `:lang(lang)`
- `inDirection(dir)` - Equivalent to `:dir(ltr|rtl)`

### Chainable Properties

- `.is` - Syntactic sugar (returns same builder)
- `.not` - Negates the next condition
- `.and` - Continues adding conditions to current group (AND logic)
- `.or` - Starts a new condition group (OR logic)

## Architecture Details

### Why `:where()`?

The `:where()` pseudo-class has **zero specificity**, preventing specificity conflicts:

```css
/* Traditional approach - high specificity */
.container:has(.button:hover) {
} /* specificity: (0, 2, 0) */

/* Our approach - zero specificity */
:where(html):has(.button:hover) .container {
} /* specificity: (0, 1, 0) */
```

This makes conditional styles easier to override when needed.

## Browser Support

This package relies on the `:has()` selector, which is supported in:

- Chrome/Edge 105+ (August 2022)
- Safari 15.4+ (March 2022)
- Firefox 121+ (December 2023)

**Coverage:** ~90% of global users (as of 2024)

## License

MIT
