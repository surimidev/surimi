import postcss from 'postcss';

import { SelectorBuilder } from '#lib/builders/index';
import { GetSelectorBuilder, SelectorsAsGroup, ValidSelector } from '#types/selector.types';
import { ArrayWithAtLeastOneItem } from '#types/util.types';

export abstract class Surimi {
  public static root: postcss.Root = postcss.root();

  public static clear() {
    Surimi.root = postcss.root();
  }

  public static build() {
    return Surimi.root.toString();
  }
}

export function select<TSelectors extends ArrayWithAtLeastOneItem<ValidSelector>>(
  ...selectors: TSelectors
): GetSelectorBuilder<TSelectors> {
  if (selectors.length === 0) {
    throw new Error('At least one selector must be provided');
  } else if (selectors.length === 1) {
    if (typeof selectors[0] !== 'string') {
      throw new Error('Selector must be a string');
    }

    return new SelectorBuilder([{ selector: selectors[0] as string }], Surimi.root) as GetSelectorBuilder<TSelectors>;
  }

  // As with types, filter out empty strings
  const selectorItems = selectors
    .filter(i => i.length > 0)
    .map(selector => ({ selector })) as SelectorsAsGroup<TSelectors>;

  // TODO: Fix/remove type assertion. Not sure why it's needed.
  return new SelectorBuilder([{ group: selectorItems }] as any, Surimi.root) as GetSelectorBuilder<TSelectors>;
}
