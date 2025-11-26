import type { ArrayWithAtLeastOneItem, JoinSelectors } from '#types';

export function joinSelectors<TSelectors extends ArrayWithAtLeastOneItem<string>>(
  selectors: TSelectors,
): JoinSelectors<TSelectors> {
  return selectors.join(', ') as JoinSelectors<TSelectors>;
}
