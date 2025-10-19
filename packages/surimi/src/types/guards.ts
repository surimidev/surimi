export function isAtRuleContextItem(item: unknown): item is { atRule: string; params: string } {
  return (
    typeof item === 'object' &&
    item !== null &&
    'atRule' in item &&
    typeof item.atRule === 'string' &&
    'params' in item &&
    typeof item.params === 'string'
  );
}
