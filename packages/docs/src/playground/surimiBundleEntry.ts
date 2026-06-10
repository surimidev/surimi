// Combined entry bundled into the playground's virtual `surimi` package.
// Bundling main + conditional together keeps a single `@surimi/common`
// `SurimiContext` instance, so `select()` and `when()` write to the same AST root.
export * from 'surimi';
export { when } from 'surimi/conditional';
