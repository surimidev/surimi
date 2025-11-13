# Surimi Plugin System

The Surimi plugin system provides a simple and flexible way to extend builders with custom methods and add new APIs. Plugins are passed directly as arguments to `createSurimi()`, and each plugin defines which builders it extends.

## Quick Start

```typescript
import { createSurimi, WithStyling } from 'surimi';

// 1. Define a plugin mixin
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

// 2. Create a plugin object
const animationPlugin = {
  name: 'animations',
  selector: [WithAnimations],  // Extends SelectorBuilder
};

// 3. Pass plugins directly to createSurimi
const { select } = createSurimi(animationPlugin);

// 4. Use the extended methods
select('.modal').fadeIn('0.5s');
```

## Plugin Structure

A plugin is an object (or function returning an object) with the following structure:

```typescript
interface SurimiPlugin {
  name?: string;              // Optional plugin name
  selector?: Mixin[];         // Extends SelectorBuilder
  media?: Mixin[];            // Extends MediaQueryBuilder
  container?: Mixin[];        // Extends ContainerQueryBuilder
  mixin?: Mixin[];            // Extends MixinBuilder
  style?: Mixin[];            // Extends Style
  apis?: Record<string, any>; // Custom top-level APIs
}
```

## Creating Plugins

### Basic Plugin

```typescript
import { WithStyling } from 'surimi';

// Define mixin class
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

// Create plugin
export const animationPlugin = {
  name: 'animations',
  selector: [WithAnimations],
};
```

### Plugin Extending Multiple Builders

```typescript
// Mixin for selectors
abstract class WithSelectorHelpers<T extends string> 
  extends WithStyling<T> {
  public fadeIn() {
    this.style({ animation: 'fadeIn 0.3s' });
    return this;
  }
}

// Mixin for media queries
abstract class WithMediaHelpers<T extends string> 
  extends WithStyling<T> {
  public mobile() {
    return this.maxWidth('768px');
  }
}

export const helperPlugin = {
  name: 'helpers',
  selector: [WithSelectorHelpers],
  media: [WithMediaHelpers],
};
```

### Plugin with Custom APIs

```typescript
export const utilsPlugin = {
  name: 'utils',
  apis: {
    generatePalette: (baseColor: string) => ({
      light: `lighten(${baseColor}, 20%)`,
      base: baseColor,
      dark: `darken(${baseColor}, 20%)`,
    }),
  },
};

// Usage
const { generatePalette } = createSurimi(utilsPlugin);
const palette = generatePalette('#3498db');
```

### Dynamic Plugin (Function)

```typescript
export const dynamicPlugin = () => {
  const timestamp = Date.now();
  
  return {
    name: `dynamic-${timestamp}`,
    selector: [WithAnimations],
    apis: {
      getTimestamp: () => timestamp,
    },
  };
};

// Usage
const { select, getTimestamp } = createSurimi(dynamicPlugin());
```

## Using Plugins

### Single Plugin

```typescript
import { createSurimi } from 'surimi';
import { animationPlugin } from './plugins/animations';

const { select } = createSurimi(animationPlugin);

select('.modal').fadeIn('0.5s');
```

### Multiple Plugins

```typescript
import { createSurimi } from 'surimi';
import { animationPlugin } from './plugins/animations';
import { spacingPlugin } from './plugins/spacing';
import { typographyPlugin } from './plugins/typography';

const { select } = createSurimi(
  animationPlugin,
  spacingPlugin,
  typographyPlugin
);

select('.card')
  .fadeIn('0.3s')      // from animationPlugin
  .padding('1rem')     // from spacingPlugin
  .fontSize('lg');     // from typographyPlugin
```

### Using Custom APIs

```typescript
const { select, customMethod } = createSurimi({
  apis: {
    customMethod: () => 'custom value',
  },
});

console.log(customMethod()); // 'custom value'
select('.test').style({ color: 'red' });
```

## Example Plugins

### Animation Plugin

```typescript
import { WithStyling } from 'surimi';

abstract class WithAnimations<TContext extends string> 
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

export const animationPlugin = {
  name: 'animations',
  selector: [WithAnimations],
};
```

### Spacing Plugin

```typescript
import { WithStyling } from 'surimi';

abstract class WithSpacing<TContext extends string> 
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

export const spacingPlugin = {
  name: 'spacing',
  selector: [WithSpacing],
};
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

abstract class WithTypography<TContext extends string> 
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

export const typographyPlugin = {
  name: 'typography',
  selector: [WithTypography],
};
```

## Plugin Composition

Multiple plugins extending the same builder are merged together:

```typescript
const plugin1 = {
  selector: [WithAnimations],
};

const plugin2 = {
  selector: [WithSpacing],
};

const { select } = createSurimi(plugin1, plugin2);

// Both plugin methods available
select('.element')
  .fadeIn()      // from plugin1
  .padding('1rem'); // from plugin2
```

## Custom API Composition

APIs from multiple plugins are merged. Later plugins can override earlier ones:

```typescript
const plugin1 = {
  apis: {
    method: () => 'first',
    unique1: () => 'value1',
  },
};

const plugin2 = {
  apis: {
    method: () => 'second',  // Overrides plugin1
    unique2: () => 'value2',
  },
};

const { method, unique1, unique2 } = createSurimi(plugin1, plugin2);

console.log(method());   // 'second' (overridden)
console.log(unique1());  // 'value1'
console.log(unique2());  // 'value2'
```

## Best Practices

### 1. Always Return `this`

For method chaining to work:

```typescript
public myMethod() {
  this.style({ /* ... */ });
  return this; // ✅ Required
}
```

### 2. Use TypeScript for Type Safety

```typescript
public fontSize(size: 'sm' | 'md' | 'lg' | string) {
  // Type-safe parameter
}
```

### 3. Provide Sensible Defaults

```typescript
public fadeIn(duration = '0.3s') { // Default duration
  // ...
}
```

### 4. Keep Plugins Focused

- ✅ `animationPlugin` - Animation utilities
- ✅ `spacingPlugin` - Spacing utilities
- ❌ `everythingPlugin` - Too broad

### 5. Document Your Plugins

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

### Package Structure

```json
{
  "name": "@your-org/surimi-plugin-animations",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "peerDependencies": {
    "surimi": "^0.5.0"
  }
}
```

### Export Plugin

```typescript
// index.ts
export { animationPlugin } from './plugin';
export { WithAnimations } from './mixins';
```

### Usage

```bash
npm install @your-org/surimi-plugin-animations
```

```typescript
import { createSurimi } from 'surimi';
import { animationPlugin } from '@your-org/surimi-plugin-animations';

const { select } = createSurimi(animationPlugin);
```

## Advanced Examples

### Conditional Plugin

```typescript
const debugPlugin = process.env.NODE_ENV === 'development' 
  ? {
      apis: {
        debug: (message: string) => console.log('[Surimi]', message),
      },
    }
  : {};

const { select, debug } = createSurimi(debugPlugin);
```

### Plugin with State

```typescript
const themePlugin = (theme: 'light' | 'dark') => ({
  name: 'theme',
  apis: {
    getTheme: () => theme,
    colors: theme === 'light' 
      ? { primary: '#000', secondary: '#666' }
      : { primary: '#fff', secondary: '#ccc' },
  },
});

const { colors } = createSurimi(themePlugin('dark'));
```

## Limitations

- Plugin methods are only available on the initial builder returned by API functions
- Methods that create new instances (`.hover()`, `.child()`) return builders without plugin methods
- Workaround: Apply plugin methods before navigation

```typescript
// ✅ Works
select('.button').padding('1rem').hover().style({ color: 'blue' });

// Or use multiple calls
select('.button').padding('1rem');
select('.button').hover().style({ color: 'blue' });
```

## Migration from Previous API

**Old API:**
```typescript
const { select } = createSurimi({ 
  selectorPlugins: [WithAnimations] 
});
```

**New API:**
```typescript
const { select } = createSurimi({ 
  selector: [WithAnimations] 
});
```

Or even simpler:
```typescript
const animationPlugin = {
  selector: [WithAnimations],
};

const { select } = createSurimi(animationPlugin);
```
