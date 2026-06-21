// Combined entry bundled into the playground's virtual `surimi` package.
// Bundling main + conditional + theme together keeps a single `@surimi/common`
// `SurimiContext` instance, so `select()`, `when()`, and theme tokens share one AST root.
export * from 'surimi';
export * from 'surimi/conditional';
export * from 'surimi/theme';
