# @surimi/conditional

A powerful conditional selector builder for Surimi CSS, enabling you to style elements based on the state of other elements using the modern `:has()` selector.

## Installation

```bash
pnpm add @surimi/conditional
```

## Basic Usage

```typescript
import { when } from '@surimi/conditional';

// Style a container when a button inside is hovered
when('.button').hovered().select('.container').style({
  backgroundColor: 'blue',
});

// Generates: :where(.container):has(.button:hover) { background-color: blue; }
```

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
when('.button').not.disabled();
// :where(selector):has(.button:not(:disabled))

when('.input').is.not.focused();
// :where(selector):has(.input:not(:focus))
```

### Combining Conditions with `.and`

Chain multiple conditions together with AND logic (all conditions must be met):

```typescript
when('.button').hovered().and.focused().select('.container').style({
  borderColor: 'blue',
});
// :where(.container):has(.button:hover:focus)

when('.input').focused().and.valid().and.not.disabled().select('.form').style({
  borderColor: 'green',
});
// :where(.form):has(.input:focus:valid:not(:disabled))
```

The `.and` property returns the builder, allowing you to continue chaining conditions. All chained conditions are concatenated in the final selector.

### Alternative Conditions with `.or`

Create alternatives using OR logic (any condition can be met):

```typescript
when('.button').hovered().or.focused().select('.container').style({
  backgroundColor: 'lightblue',
});
// :where(.container):has(.button:hover, .button:focus)

when('.element').active().or.focused().or.hovered().select('.parent').style({
  opacity: '1',
});
// :where(.parent):has(.element:active, .element:focus, .element:hover)
```

The `.or` property starts a new condition group. Groups are separated by commas in the final CSS, creating OR logic.

### Complex Combinations

Mix `.and` and `.or` to create sophisticated conditional logic:

```typescript
// Style form when input is (focused AND valid) OR (hovered AND enabled)
when('.input').focused().and.valid().or.hovered().and.not.disabled().select('.form').style({ borderColor: 'green' });

// Generates: :where(.form):has(.input:focus:valid, .input:hover:not(:disabled))
```

## Real-World Examples

### Form Validation Indicator

```typescript
// Green border when input is focused and valid
when('.input').focused().and.valid().select('.form-group').style({ borderColor: 'green' });

// Red border when input is focused and invalid
when('.input').focused().and.invalid().select('.form-group').style({ borderColor: 'red' });
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
// Style label differently based on checkbox state
when('.toggle-checkbox').checked().and.not.disabled().select('.toggle-label').style({
  backgroundColor: 'green',
  color: 'white',
});

when('.toggle-checkbox').not.checked().and.not.disabled().select('.toggle-label').style({
  backgroundColor: 'gray',
  color: 'black',
});
```

## API Reference

### Core Methods

- `when(selector: string)` - Start a conditional selector chain
- `.select(selector: string)` - Choose the element to style when condition is met
- `.style(properties: CssProperties)` - Apply CSS styles

### Pseudo-Class Methods

All methods return a chainable builder:

- `hovered()`, `focused()`, `active()`, `visited()`
- `checked()`, `disabled()`, `enabled()`
- `focusedWithin()`, `focusedVisible()`
- `valid()`, `invalid()`
- `required()`, `optional()`
- `readOnly()`, `readWrite()`
- `placeholderShown()`
- `defaulted()`, `indeterminate()`
- `blank()`, `empty()`
- `targeted()`
- `firstChild()`, `lastChild()`, `onlyChild()`
- `firstOfType()`, `lastOfType()`, `onlyOfType()`
- `nthChild(n)`, `nthLastChild(n)`, `nthOfType(n)`, `nthLastOfType(n)`

### Chainable Properties

- `.is` - Syntactic sugar (returns same builder)
- `.not` - Negates the next condition
- `.and` - Continues adding conditions to current group (AND logic)
- `.or` - Starts a new condition group (OR logic)

## How It Works

The conditional builder uses the CSS `:has()` pseudo-class combined with `:where()` for specificity control:

```typescript
when('.button').hovered().select('.container')
// ↓
:where(.container):has(.button:hover)
```

- **`:where()`** - Keeps specificity at zero, preventing specificity conflicts
- **`:has()`** - Selects elements that contain matching descendants
- **`.and`** - Concatenates pseudo-classes: `.button:hover:focus`
- **`.or`** - Creates comma-separated groups: `.button:hover, .button:focus`

## Browser Support

This package relies on the `:has()` selector, which is supported in:

- Chrome/Edge 105+
- Safari 15.4+
- Firefox 121+

For older browsers, the styles simply won't apply (graceful degradation).

## License

MIT
