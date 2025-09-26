## `@janis.me/starter`

Repo template for my repositories. Based on pnpm workspaces, and includes default setup for:

- [Github actions](https://github.com)
- [PNPM catalogs](https://pnpm.io/catalogs)
- [Testing (vitest/playwright)](https://vitest.dev/)
- [Formatting (Prettier)](https://prettier.io/)
- [Linting (ts-eslint)](https://typescript-eslint.io/)
- [Typescript](https://www.typescriptlang.org/)
- [Dependency management (taze)](https://github.com/antfu-collective/taze)

By default, the following commands are available across the repo:

- `pnpm deps` for updating dependencies with [Taze](https://github.com/antfu-collective/taze)
- `pnpm format` to format all packages with prettier
- `pnpm lint` for linting all packages (respects each packages overrides)
- `pnpm test` to run all tests using `vitest`.

## Github

There are two workflows defined by default. First, when you open PRs or push to the branches `main` or `development`, all unit tests will run. Secondly, when pushing tags starting with `v` and a semantic version, all packages will be published (if configured and not private), and a changelog will be generated that's put into a new github release.

For this to work, you need to set a `NPM_TOKEN` in your github env. The publish workflow uses a github environment called `propd`, but you can of course change that.

## Testing

The repo defines a default vitest workspace. This allows you to add test to every package without having to setup vitest again and again. It just works. The testing setup will look for `*.unit.test.ts` and `*.browser.test.ts` files and run them with the respective runner.

## Formatting

There is just a single prettier config defined at top-level. If you need to add exceptions/rules/plugins, add it there

## Linting

The linter config is defined in the `linter-config` package. This defines a `base-config` that can be used to extend others. For example, it already defines a `reactConfig`, that extends the default with some react-specific rules. The `linter-config` package also exports `eslint` and `tseslint` so you can easily override rules in each package.

For example:

```ts
import { reactConfig, tseslint, type ConfigArray } from '@janis.me/linter-config';

const customConfig: ConfigArray = tseslint.config(...reactConfig, {
  rules: {
    'import/no-unresolved': [
      'error',
      // or whatever.
    ],
  },
});

export default customConfig;
```

When running `pnpm lint`, it respects these overrides and will lint all packages using their own config. Thus, you should add a new `eslint.config.ts` file to each package. It can be as simple as

```ts
import { baseConfig } from '@janis.me/linter-config';

export default baseConfig;
```

## Typescript

The typescript config is exported from the `typescript-config` package. It has a `base` config and one for `react`.

In both cases, you can extend those by creating a tsconfig file in one of the sub-packages and putting

```json
{
  "extends": "@janis.me/typescript-config/base.json",
  "compilerOptions": {
    "types": ["node"]
  },
  "include": ["*.ts"]
}
```

or whatever you need.

## Dependency management

You can run `pnpm deps` to automatically update all your dependencies. run `pnpm deps major` for major upgrades.
This works with pnpm catalogs, sub-packages etc.
