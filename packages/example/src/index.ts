export function example() {
  // This should raise an TSESLint error for trivially inferred type.
  // (and typescript+TSESLint error for unused variable)
  const x: number = 1;
  return 'example';
}
