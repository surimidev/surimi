# Surimi Plugin System

The Surimi plugin system allows you to extend builder functionality with custom methods, add new top-level APIs, and maintain full TypeScript type safety.

## Quick Start

```typescript
import { createSurimi, WithStyling } from 'surimi';

// 1. Define a plugin as a mixin class
export abstract class WithAnimations<TContext extends string> 
  extends WithStyling<TContext> {
  
  public fadeIn(duration = '0.3s') {
    this.style({
      animation: `fadeIn ${duration}`,
      opacity: '1',
    });
    return this;
  }
}

// 2. Use the plugin to extend SelectorBuilder
const { select } = createSurimi({ 
  selectorPlugins: [WithAnimations] 
});

// 3. Plugin methods are now available with full type safety!
select('.modal').fadeIn('0.5s');
```

## Plugin Configuration Options

The `createSurimi` function accepts a configuration object with the following options:

### Extending Builders

```typescript
const { select, media, container, mixin, style } = createSurimi({
  // Extend SelectorBuilder (returned by select())
  selectorPlugins: [WithAnimations, WithSpacing],
  
  // Extend MediaQueryBuilder (returned by media())
  mediaPlugins: [WithMediaHelpers],
  
  // Extend ContainerQueryBuilder (returned by container())
  containerPlugins: [WithContainerHelpers],
  
  // Extend MixinBuilder (returned by mixin())
  mixinPlugins: [WithMixinHelpers],
  
  // Extend Style class (returned by style())
  stylePlugins: [WithStyleHelpers],
});
```

### Adding Custom APIs

```typescript
const { select, customMethod, anotherApi } = createSurimi({
  selectorPlugins: [WithAnimations],
  apis: {
    customMethod: () => {
      // Custom logic
      return 'custom value';
    },
    anotherApi: (param: string) => {
      // Another custom API
      return `result: ${param}`;
    },
  },
});

// Use the custom APIs
console.log(customMethod()); // 'custom value'
console.log(anotherApi('test')); // 'result: test'
```

## Creating Plugins

### Basic Plugin Structure

A plugin is an abstract class that extends `WithStyling` (or `CoreBuilder`) and adds custom methods:

```typescript
import { WithStyling } from 'surimi';

export abstract class MyPlugin<TContext extends string> 
  extends WithStyling<TContext> {
  
  public myMethod(param: string) {
    // Access this.style() to apply CSS properties
    this.style({ color: param });
    
    // Always return this for method chaining
    return this;
  }
}
```

### Available Base Classes

- **`WithStyling<TContext>`** - Provides `this.style()` method (recommended for most plugins)
- **`CoreBuilder<Tokenize<TContext>>`** - Lower-level base class with PostCSS access

### Available Methods in Plugins

When extending `WithStyling`, you have access to:

- **`this.style(properties)`** - Apply CSS properties to the current selector
- **`this._context`** - The current selector context (as tokens)
- **`this._postcssContainer`** - The PostCSS container for this builder
- **`this._postcssRoot`** - The PostCSS root node
- **`this.getOrCreateRule()`** - Get or create the PostCSS rule for the current selector

## Example Plugins

### Animation Plugin

```typescript
import { WithStyling } from 'surimi';

export abstract class WithAnimations<TContext extends string> 
  extends WithStyling<TContext> {
  
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

### Spacing Plugin

```typescript
import { WithStyling } from 'surimi';

export abstract class WithSpacing<TContext extends string> 
  extends WithStyling<TContext> {
  
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

### Typography Plugin

```typescript
import { WithStyling } from 'surimi';

type FontSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';

const fontSizeMap: Record<FontSize, string> = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
};

export abstract class WithTypography<TContext extends string> 
  extends WithStyling<TContext> {
  
  public fontSize(size: FontSize | string) {
    const value = size in fontSizeMap ? fontSizeMap[size as FontSize] : size;
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
}
```

## Usage Examples

### Single Plugin

```typescript
import { createSurimi } from 'surimi';
import { WithAnimations } from './plugins/animations';

const { select } = createSurimi({ 
  selectorPlugins: [WithAnimations] 
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
  selectorPlugins: [WithAnimations, WithSpacing, WithTypography] 
});

select('.card')
  .fadeIn('0.3s')      // from WithAnimations
  .padding('1rem')     // from WithSpacing (assuming it has a padding method)
  .fontSize('lg');     // from WithTypography
```

### Extending Different Builders

```typescript
import { createSurimi } from 'surimi';

// Plugin for MediaQueryBuilder
abstract class WithMediaHelpers<TContext extends string> 
  extends WithStyling<TContext> {
  public mobile() {
    return this.maxWidth('768px');
  }
  public tablet() {
    return this.minWidth('769px').maxWidth('1024px');
  }
}

const { media } = createSurimi({
  mediaPlugins: [WithMediaHelpers],
});

// Now you can use the helper methods
media().mobile().select('.card').style({ padding: '1rem' });
```

### Adding Custom APIs

```typescript
const { select, generateColorPalette } = createSurimi({
  selectorPlugins: [WithAnimations],
  apis: {
    generateColorPalette: (baseColor: string) => {
      // Generate a color palette from a base color
      return {
        light: `lighten(${baseColor}, 20%)`,
        base: baseColor,
        dark: `darken(${baseColor}, 20%)`,
      };
    },
  },
});

const palette = generateColorPalette('#3498db');
select('.primary').style({ backgroundColor: palette.base });
```

## Plugin Composition

Multiple plugins can be composed together. Methods from all plugins are available on the builder:

```typescript
const { select } = createSurimi({
  selectorPlugins: [
    WithAnimations, 
    WithSpacing, 
    WithTypography
  ],
});

select('.card')
  .fadeIn('0.3s')      // from WithAnimations
  .paddingY('1rem')    // from WithSpacing
  .fontSize('lg')      // from WithTypography
  .fontWeight('bold')  // from WithTypography
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

const { select } = createSurimi({ 
  selectorPlugins: [WithAnimations] 
});
```

## Advanced Features

### Plugin Methods on Derived Builders

Currently, plugin methods are only available on the initial builder returned by the API functions. Methods that create new builder instances (like `.hover()`, `.child()`) return builders without plugin methods.

**Workaround:**

```typescript
// ✅ Apply plugin methods first
select('.button').padding('1rem').hover().style({ color: 'blue' });

// Or use multiple select() calls
select('.button').padding('1rem');
select('.button').hover().style({ color: 'blue' });
```

This is a known limitation that may be addressed in future versions.

## Migration from Old Plugin API

If you were using the old plugin API:

**Old:**
```typescript
const { select } = createSurimi({ plugins: [WithAnimations] });
```

**New:**
```typescript
const { select } = createSurimi({ selectorPlugins: [WithAnimations] });
```

The new API provides more granular control over which builders are extended.

## Future Enhancements

- Plugin methods available on all builder instances (including after `.hover()`, `.child()`, etc.)
- Plugin lifecycle hooks
- Plugin dependencies and composition helpers
- Built-in plugin utilities and helpers
- Official plugin packages

## Feedback

We'd love to hear your feedback on the plugin system! Please share your use cases, suggestions, and plugin ideas.
