# Surimi Plugin System

The Surimi plugin system allows you to extend builder functionality with custom methods while maintaining full TypeScript type safety.

## Quick Start

```typescript
import { createSurimi, CoreBuilder } from 'surimi';
import type { Tokenize } from '@surimi/parsers';

// 1. Define a plugin as a mixin class
export abstract class WithAnimations<TContext extends string> 
  extends CoreBuilder<Tokenize<TContext>> {
  
  public fadeIn(duration = '0.3s') {
    this.style({
      animation: `fadeIn ${duration}`,
      opacity: '1',
    });
    return this;
  }
}

// 2. Use the plugin
const { select } = createSurimi({ plugins: [WithAnimations] });

// 3. Plugin methods are now available!
select('.modal').fadeIn('0.5s');
```

## Creating Plugins

### Basic Plugin Structure

A plugin is an abstract class that extends `CoreBuilder` and adds custom methods:

```typescript
import { CoreBuilder } from 'surimi';
import type { Tokenize } from '@surimi/parsers';

export abstract class MyPlugin<TContext extends string> 
  extends CoreBuilder<Tokenize<TContext>> {
  
  public myMethod(param: string) {
    // Access this.style() to apply CSS properties
    this.style({ /* CSS properties */ });
    
    // Always return this for method chaining
    return this;
  }
}
```

### Available Methods in Plugins

When writing plugins, you have access to:

- **`this.style(properties)`** - Apply CSS properties to the current selector
- **`this._context`** - The current selector context (as tokens)
- **`this._postcssContainer`** - The PostCSS container for this builder
- **`this._postcssRoot`** - The PostCSS root node

### Example: Animation Plugin

```typescript
import { CoreBuilder } from 'surimi';
import type { Tokenize } from '@surimi/parsers';

export abstract class WithAnimations<TContext extends string> 
  extends CoreBuilder<Tokenize<TContext>> {
  
  public fadeIn(duration = '0.3s') {
    this.style({
      animation: `fadeIn ${duration}`,
      opacity: '1',
    });
    return this;
  }

  public slideIn(direction: 'left' | 'right' | 'top' | 'bottom', duration = '0.3s') {
    this.style({
      animation: `slideIn-${direction} ${duration} ease-out`,
    });
    return this;
  }

  public pulse(duration = '1s') {
    this.style({
      animation: `pulse ${duration} infinite`,
    });
    return this;
  }
}
```

### Example: Spacing Plugin

```typescript
import { CoreBuilder } from 'surimi';
import type { Tokenize } from '@surimi/parsers';

export abstract class WithSpacing<TContext extends string> 
  extends CoreBuilder<Tokenize<TContext>> {
  
  public gap(size: string) {
    this.style({ gap: size });
    return this;
  }

  public paddingX(size: string) {
    this.style({
      paddingLeft: size,
      paddingRight: size,
    });
    return this;
  }

  public paddingY(size: string) {
    this.style({
      paddingTop: size,
      paddingBottom: size,
    });
    return this;
  }

  public centerX() {
    this.style({
      marginLeft: 'auto',
      marginRight: 'auto',
    });
    return this;
  }
}
```

## Using Plugins

### Single Plugin

```typescript
import { createSurimi } from 'surimi';
import { WithAnimations } from './plugins/animations';

const { select } = createSurimi({ 
  plugins: [WithAnimations] 
});

select('.modal').fadeIn('0.5s');
```

### Multiple Plugins

```typescript
import { createSurimi } from 'surimi';
import { WithAnimations } from './plugins/animations';
import { WithSpacing } from './plugins/spacing';
import { WithTypography } from './plugins/typography';

const { select } = createSurimi({ 
  plugins: [WithAnimations, WithSpacing, WithTypography] 
});

select('.card')
  .fadeIn('0.3s')      // from WithAnimations
  .padding('1rem')     // from WithSpacing
  .fontSize('lg');     // from WithTypography
```

### No Plugins (Standard Surimi)

```typescript
import { createSurimi } from 'surimi';

const { select } = createSurimi(); // No plugins

// Only standard methods available
select('.button').hover().style({ color: 'blue' });
```

## Method Chaining

Plugin methods support full method chaining with other plugin methods and the standard `style()` method:

```typescript
const { select } = createSurimi({ 
  plugins: [WithAnimations, WithSpacing, WithTypography] 
});

select('.element')
  .fadeIn()
  .padding('1rem')
  .fontSize('lg')
  .fontWeight('bold')
  .style({ backgroundColor: 'white' });
```

## Current Limitations

⚠️ **Important**: Plugin methods are currently only available on the initial builder returned by `select()`. When using builder methods that create new instances (like `.hover()`, `.child()`, `.before()`), those new instances will not have plugin methods.

### Workaround

Apply plugin methods before navigating or using pseudo-selectors:

```typescript
// ✅ This works
select('.button').padding('1rem').hover().style({ color: 'blue' });

// ❌ This doesn't work (yet)
// select('.button').hover().padding('1rem')
```

For complex scenarios, you can make multiple `select()` calls:

```typescript
// Apply padding to the button
select('.button').padding('1rem');

// Apply styles to hover state separately
select('.button').hover().style({ color: 'blue' });
```

## Example Plugins

### Typography Utilities

```typescript
export abstract class WithTypography<TContext extends string> 
  extends CoreBuilder<Tokenize<TContext>> {
  
  private fontSizeMap = {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
  };

  public fontSize(size: keyof typeof this.fontSizeMap | string) {
    const value = this.fontSizeMap[size as keyof typeof this.fontSizeMap] ?? size;
    this.style({ fontSize: value });
    return this;
  }

  public fontWeight(weight: 'normal' | 'bold' | 'semibold' | string) {
    const weights = { normal: '400', bold: '700', semibold: '600' };
    const value = weights[weight as keyof typeof weights] ?? weight;
    this.style({ fontWeight: value });
    return this;
  }

  public truncate() {
    this.style({
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    });
    return this;
  }

  public lineClamp(lines: number) {
    this.style({
      display: '-webkit-box',
      WebkitLineClamp: lines.toString(),
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
    });
    return this;
  }
}
```

### Layout Utilities

```typescript
export abstract class WithLayout<TContext extends string> 
  extends CoreBuilder<Tokenize<TContext>> {
  
  public flex(direction?: 'row' | 'column') {
    this.style({
      display: 'flex',
      ...(direction && { flexDirection: direction }),
    });
    return this;
  }

  public grid(columns?: string) {
    this.style({
      display: 'grid',
      ...(columns && { gridTemplateColumns: columns }),
    });
    return this;
  }

  public center() {
    this.style({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    });
    return this;
  }

  public absolute() {
    this.style({ position: 'absolute' });
    return this;
  }

  public relative() {
    this.style({ position: 'relative' });
    return this;
  }
}
```

### Color Utilities

```typescript
export abstract class WithColors<TContext extends string> 
  extends CoreBuilder<Tokenize<TContext>> {
  
  private colors = {
    primary: '#3490dc',
    secondary: '#6574cd',
    success: '#38c172',
    danger: '#e3342f',
    warning: '#f6993f',
  };

  public bg(color: keyof typeof this.colors | string) {
    const value = this.colors[color as keyof typeof this.colors] ?? color;
    this.style({ backgroundColor: value });
    return this;
  }

  public text(color: keyof typeof this.colors | string) {
    const value = this.colors[color as keyof typeof this.colors] ?? color;
    this.style({ color: value });
    return this;
  }

  public border(color: keyof typeof this.colors | string, width = '1px') {
    const value = this.colors[color as keyof typeof this.colors] ?? color;
    this.style({ border: `${width} solid ${value}` });
    return this;
  }
}
```

## Plugin Composition

Multiple plugins can be composed together. Methods from all plugins are available on the builder:

```typescript
const { select } = createSurimi({
  plugins: [WithAnimations, WithSpacing, WithTypography, WithLayout, WithColors],
});

select('.card')
  .flex('column')      // from WithLayout
  .gap('1rem')         // from WithSpacing
  .padding('2rem')     // from WithSpacing
  .bg('white')         // from WithColors
  .fadeIn('0.5s')      // from WithAnimations
  .fontSize('base')    // from WithTypography
  .style({             // standard method
    borderRadius: '8px',
  });
```

## Best Practices

### 1. Always Return `this`

For method chaining to work, always return `this` from your plugin methods:

```typescript
public myMethod() {
  this.style({ /* ... */ });
  return this; // ✅ Required for chaining
}
```

### 2. Use TypeScript for Type Safety

Define parameter types and use TypeScript features:

```typescript
public fontSize(size: 'sm' | 'md' | 'lg' | string) {
  // Type-safe size parameter
}
```

### 3. Provide Sensible Defaults

Make your plugins easy to use with sensible defaults:

```typescript
public fadeIn(duration = '0.3s') { // Default duration
  // ...
}
```

### 4. Keep Plugins Focused

Create focused plugins that do one thing well:

- ✅ `WithAnimations` - Animation utilities
- ✅ `WithSpacing` - Spacing utilities
- ❌ `WithEverything` - Too broad

### 5. Document Your Plugins

Add JSDoc comments to your plugin methods:

```typescript
/**
 * Apply a fade-in animation
 * @param duration - Animation duration (default: '0.3s')
 */
public fadeIn(duration = '0.3s') {
  // ...
}
```

## Publishing Plugins

To share plugins with others, publish them as npm packages:

```json
{
  "name": "@your-org/surimi-plugin-animations",
  "version": "1.0.0",
  "peerDependencies": {
    "surimi": "^0.5.0"
  }
}
```

Users can then install and use your plugin:

```bash
npm install @your-org/surimi-plugin-animations
```

```typescript
import { createSurimi } from 'surimi';
import { WithAnimations } from '@your-org/surimi-plugin-animations';

const { select } = createSurimi({ plugins: [WithAnimations] });
```

## Future Enhancements

The plugin system is currently in its initial version. Future enhancements may include:

- Plugin methods available on all builder instances (including after `.hover()`, `.child()`, etc.)
- Support for plugins extending other builders (MediaBuilder, ContainerBuilder, etc.)
- Plugin lifecycle hooks
- Plugin dependencies and composition helpers
- Built-in plugin utilities and helpers

## Feedback

We'd love to hear your feedback on the plugin system! Please share your use cases, suggestions, and plugin ideas.
