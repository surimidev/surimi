import type { JoinSelectors } from '#types/selector.types';
import type { ArrayWithAtLeastOneItem } from '#types/util.types';

export function joinSelectors<TSelectors extends ArrayWithAtLeastOneItem<string>>(
  selectors: TSelectors,
): JoinSelectors<TSelectors> {
  return selectors.join(', ') as JoinSelectors<TSelectors>;
}
