# Surimi Plugin System - Design Proposals

This document explores multiple approaches for implementing a plugin system in Surimi that allows users to extend builder functionality with custom methods while maintaining type safety.

## Goals

1. **Type Safety**: Plugins should be fully typed with TypeScript, providing autocomplete and type checking
2. **Extensibility**: Allow extending existing builders (SelectorBuilder, MediaBuilder, etc.) with custom methods
3. **Composability**: Support multiple plugins being used together
4. **Developer Experience**: Simple, intuitive API that feels natural with existing Surimi usage
5. **Zero Runtime Overhead**: Plugin system should compile to efficient CSS with no runtime cost

## Current Architecture

Surimi uses:
- **Class-based builders**: `SelectorBuilder`, `MediaBuilder`, etc.
- **ts-mixer**: For composing mixins into builder classes
- **PostCSS**: AST for CSS generation
- **Token-based context**: Type-level string manipulation for selectors

Example current usage:
```typescript
import { select } from 'surimi';

select('.button')
  .hover()
  .style({ backgroundColor: 'blue' });
```

---

## Option 1: Mixin-Based Plugin System (Recommended)

**Approach**: Extend the current ts-mixer pattern to support user-defined mixins as plugins.

### API Design

```typescript
// plugin-definition.ts
import { CoreBuilder } from 'surimi/plugin';
import type { Tokenize } from '@surimi/parsers';

export abstract class WithAnimation<TContext extends string> extends CoreBuilder<Tokenize<TContext>> {
  public fadeIn(duration = '0.3s') {
    this.style({
      animation: `fadeIn ${duration}`,
      opacity: '1',
    });
    return this;
  }

  public slideIn(direction: 'left' | 'right' | 'top' | 'bottom' = 'left') {
    this.style({
      animation: `slideIn-${direction} 0.3s ease-out`,
    });
    return this;
  }
}

export abstract class WithSpacing<TContext extends string> extends CoreBuilder<Tokenize<TContext>> {
  public gap(size: string) {
    this.style({ gap: size });
    return this;
  }

  public padding(size: string) {
    this.style({ padding: size });
    return this;
  }
}
```

### Usage

```typescript
// app.css.ts
import { createSurimi } from 'surimi';
import { WithAnimation, WithSpacing } from './plugins/animation-plugin';

const { select, media } = createSurimi({
  plugins: [WithAnimation, WithSpacing],
});

// Now select() returns a builder with the plugin methods
select('.modal')
  .fadeIn('0.5s')        // from WithAnimation plugin
  .gap('1rem')           // from WithSpacing plugin
  .hover()               // built-in method
  .style({ color: 'red' });
```

### Implementation

```typescript
// surimi/plugin.ts
export { CoreBuilder } from './lib/builders/core.builder';

// surimi/index.ts
import { mix } from 'ts-mixer';
import type { CoreBuilder } from './lib/builders/core.builder';

type PluginMixin = abstract new (...args: ConstructorParameters<typeof CoreBuilder>) => CoreBuilder;

export interface SurimiConfig {
  plugins?: PluginMixin[];
}

export function createSurimi(config?: SurimiConfig) {
  const plugins = config?.plugins ?? [];

  // Create extended SelectorBuilder with plugins
  class ExtendedSelectorBuilder extends SelectorBuilder {}
  
  if (plugins.length > 0) {
    // Apply plugins as mixins
    Object.setPrototypeOf(ExtendedSelectorBuilder, mix(...plugins, SelectorBuilder));
  }

  // Create select function that uses the extended builder
  function select<TSelectors extends ArrayWithAtLeastOneItem<ValidSelector>>(
    ...selectors: TSelectors
  ) {
    return _select(selectors, SurimiContext.root, SurimiContext.root, ExtendedSelectorBuilder);
  }

  return {
    select,
    media: createMediaWithPlugins(plugins),
    container: createContainerWithPlugins(plugins),
    // ... other APIs
  };
}
```

### Pros
- ✅ Leverages existing ts-mixer pattern
- ✅ Full type safety and autocomplete
- ✅ Familiar to developers who use current Surimi
- ✅ Easy to compose multiple plugins
- ✅ No runtime overhead

### Cons
- ⚠️ Requires exposing CoreBuilder as public API
- ⚠️ Plugin authors need to understand the builder pattern
- ⚠️ Each API function needs plugin support

---

## Option 2: Functional Composition

**Approach**: Use higher-order functions to compose builder extensions.

### API Design

```typescript
// plugin-definition.ts
import type { SelectorBuilder } from 'surimi';

export function withAnimation<T extends SelectorBuilder<any>>(builder: T) {
  return {
    ...builder,
    fadeIn(duration = '0.3s') {
      builder.style({
        animation: `fadeIn ${duration}`,
        opacity: '1',
      });
      return this;
    },
    slideIn(direction: 'left' | 'right' | 'top' | 'bottom' = 'left') {
      builder.style({
        animation: `slideIn-${direction} 0.3s ease-out`,
      });
      return this;
    },
  };
}
```

### Usage

```typescript
import { select } from 'surimi';
import { withAnimation } from './plugins/animation';

const button = withAnimation(select('.button'));
button
  .fadeIn('0.5s')
  .hover()
  .style({ color: 'blue' });
```

### Pros
- ✅ Simple to understand and implement
- ✅ No complex class hierarchies
- ✅ Works with existing builders

### Cons
- ❌ Verbose - need to wrap every builder
- ❌ Type safety is challenging
- ❌ Doesn't feel as integrated

---

## Option 3: Builder Factory Pattern

**Approach**: Create a factory that generates builders with plugins pre-installed.

### API Design

```typescript
// plugin-definition.ts
export const animationPlugin = {
  name: 'animation',
  methods: {
    fadeIn(this: SelectorBuilder<any>, duration = '0.3s') {
      this.style({
        animation: `fadeIn ${duration}`,
        opacity: '1',
      });
      return this;
    },
  },
};
```

### Usage

```typescript
import { surimi } from 'surimi';
import { animationPlugin } from './plugins/animation';

const { select } = surimi([animationPlugin]);

select('.button').fadeIn();
```

### Implementation

```typescript
export function surimi(plugins: Plugin[] = []) {
  // Build a new SelectorBuilder class with plugin methods
  const SelectorBuilderWithPlugins = class extends SelectorBuilder {
    constructor(...args: ConstructorParameters<typeof SelectorBuilder>) {
      super(...args);
      
      // Bind plugin methods
      plugins.forEach(plugin => {
        Object.entries(plugin.methods).forEach(([name, method]) => {
          (this as any)[name] = method.bind(this);
        });
      });
    }
  };

  function select(...selectors: any[]) {
    return new SelectorBuilderWithPlugins(/* ... */);
  }

  return { select };
}
```

### Pros
- ✅ Clean API
- ✅ Single initialization point

### Cons
- ❌ Type inference is very difficult
- ❌ Runtime overhead for method binding
- ❌ Plugin method `this` context is tricky

---

## Option 4: Proxy-Based Runtime Extension

**Approach**: Use JavaScript Proxy to intercept method calls and delegate to plugins.

### API Design

```typescript
export const animationPlugin = {
  fadeIn(builder: SelectorBuilder<any>, duration = '0.3s') {
    builder.style({
      animation: `fadeIn ${duration}`,
      opacity: '1',
    });
    return builder;
  },
};
```

### Usage

```typescript
import { surimi } from 'surimi';
import { animationPlugin } from './plugins/animation';

const { select } = surimi({ plugins: [animationPlugin] });

select('.button').fadeIn('0.5s');
```

### Implementation

```typescript
export function surimi(config: { plugins: any[] }) {
  function select(...selectors: any[]) {
    const builder = _select(selectors);
    
    return new Proxy(builder, {
      get(target, prop) {
        // Check if method exists on builder
        if (prop in target) {
          return (target as any)[prop];
        }
        
        // Check plugins
        for (const plugin of config.plugins) {
          if (prop in plugin) {
            return (...args: any[]) => plugin[prop](target, ...args);
          }
        }
      },
    });
  }

  return { select };
}
```

### Pros
- ✅ Very flexible
- ✅ Easy to add methods dynamically

### Cons
- ❌ Runtime overhead (Proxy is slower)
- ❌ TypeScript types are extremely difficult
- ❌ Debugging is harder
- ❌ Not compatible with build-time optimization

---

## Option 5: Template/Code Generation

**Approach**: Generate builder code at build time from plugin definitions.

### API Design

```typescript
// plugins.surimi.ts
export default {
  plugins: {
    animation: {
      fadeIn: {
        params: { duration: 'string = "0.3s"' },
        implementation: `
          this.style({
            animation: \`fadeIn \${duration}\`,
            opacity: '1',
          });
        `,
      },
    },
  },
};
```

### Pros
- ✅ Zero runtime overhead
- ✅ Can optimize generated code

### Cons
- ❌ Requires build step
- ❌ Complex implementation
- ❌ Not flexible for dynamic plugins
- ❌ Difficult to debug

---

## Recommendation: Option 1 (Mixin-Based)

**Option 1** is the recommended approach because it:

1. **Aligns with existing architecture** - Surimi already uses ts-mixer for composing builder capabilities
2. **Provides excellent type safety** - TypeScript can properly infer all types
3. **Zero runtime overhead** - All composition happens at declaration time
4. **Familiar pattern** - Plugin authors use the same patterns as core library
5. **Composable** - Multiple plugins work together seamlessly

### Implementation Phases

**Phase 1: Core Plugin Infrastructure**
- Export `CoreBuilder` and necessary types
- Create `createSurimi()` factory function
- Support plugins in `SelectorBuilder`

**Phase 2: Full Builder Support**
- Add plugin support to `MediaBuilder`, `ContainerBuilder`, etc.
- Ensure all APIs work with plugins

**Phase 3: Plugin Utilities**
- Create helper types for plugin authors
- Add plugin validation
- Create example plugins

### Example Plugin Package

```typescript
// @surimi/plugin-animations
import { CoreBuilder } from 'surimi/plugin';
import type { Tokenize } from '@surimi/parsers';

export abstract class WithAnimations<TContext extends string> 
  extends CoreBuilder<Tokenize<TContext>> {
  
  public animate(name: string, duration = '0.3s', easing = 'ease') {
    this.style({
      animation: `${name} ${duration} ${easing}`,
    });
    return this;
  }

  public fadeIn(duration = '0.3s') {
    return this.animate('fadeIn', duration);
  }

  public fadeOut(duration = '0.3s') {
    return this.animate('fadeOut', duration);
  }

  public slideInLeft(duration = '0.3s') {
    return this.animate('slideInLeft', duration);
  }

  // ... more animation helpers
}
```

### Usage Examples

```typescript
// Simple usage with one plugin
import { createSurimi } from 'surimi';
import { WithAnimations } from '@surimi/plugin-animations';

const { select } = createSurimi({ plugins: [WithAnimations] });

select('.modal').fadeIn('0.5s');
```

```typescript
// Multiple plugins
import { createSurimi } from 'surimi';
import { WithAnimations } from '@surimi/plugin-animations';
import { WithGrid } from '@surimi/plugin-grid';
import { WithTypography } from '@surimi/plugin-typography';

const { select } = createSurimi({ 
  plugins: [WithAnimations, WithGrid, WithTypography] 
});

select('.card')
  .fadeIn()
  .gridColumn('1 / 3')    // from WithGrid
  .fontSize('large');      // from WithTypography
```

---

## Alternative Consideration: Hybrid Approach

Could combine **Option 1** (for type safety) with **Option 3** (for simpler plugin definitions):

```typescript
// Simple plugin definition (Option 3 style)
export const animationPlugin = {
  name: 'animation',
  methods: {
    fadeIn(duration = '0.3s') {
      this.style({ animation: `fadeIn ${duration}` });
      return this;
    },
  },
};

// Compile to mixin class (Option 1) automatically
const WithAnimation = createMixinFromPlugin(animationPlugin);

const { select } = surimi({ plugins: [WithAnimation] });
```

This could provide easier plugin authoring while maintaining the benefits of the mixin approach.

---

## Open Questions

1. **Should plugins be able to add new top-level APIs?** (e.g., not just extend builders but add `createSprite()`)
2. **How should plugin dependencies work?** (Plugin A requires Plugin B)
3. **Should there be a plugin registry/marketplace?**
4. **How to handle plugin versioning and compatibility?**
5. **Should plugins be able to hook into the build/compile process?**

---

## Next Steps

1. ✅ Create this design document
2. Implement prototype of Option 1
3. Create example plugins to validate the approach
4. Get feedback from users/maintainers
5. Refine API based on feedback
6. Implement full solution
7. Document plugin authoring guide
