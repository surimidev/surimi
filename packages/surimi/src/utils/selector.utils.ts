import { JoinSelectors } from '#types/selector.types';
import { ArrayWithAtLeastOneItem } from '#types/util.types';

export function joinSelectors<TSelectors extends ArrayWithAtLeastOneItem<string>>(
  selectors: TSelectors,
): JoinSelectors<TSelectors> {
  return selectors.join(', ') as JoinSelectors<TSelectors>;
}
