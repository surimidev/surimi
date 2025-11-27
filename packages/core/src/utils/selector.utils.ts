import type { ArrayWithAtLeastOneItem, JoinSelectors } from '@surimi/common';

export function joinSelectors<TSelectors extends ArrayWithAtLeastOneItem<string>>(
  selectors: TSelectors,
): JoinSelectors<TSelectors> {
  return selectors.join(', ') as JoinSelectors<TSelectors>;
}
