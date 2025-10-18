import postcss from 'postcss';

import { SelectorBuilder } from '#lib/builders';

export abstract class Surimi {
  public static root: postcss.Root = postcss.root();
}

export function select<TSelector extends string>(selector: TSelector): SelectorBuilder<TSelector> {
  // TODO: Figure out what doesn't work.
  return new SelectorBuilder<TSelector>([{ selector }] as any, Surimi.root) as any;
}

const x = select('aa');

x.child('.icon').style({ width: '10px' });
