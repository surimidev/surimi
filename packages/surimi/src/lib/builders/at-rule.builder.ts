import { mix } from 'ts-mixer';

import type { Tokenize } from '@surimi/parsers';

import { CoreBuilder } from './core.builder';
import { WithSelecting } from './mixins';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AtRule<T extends string> extends WithSelecting<T> {}

/**
 * Used for building at-rules (e.g. `@media`, `@keyframes` etc.).
 * Common at-rules should have their own builders extending this class.
 *
 * This uses the Selecting mixin, which adds a `select` method for nested selections.
 */
@mix(WithSelecting)
export class AtRule<T extends string> extends CoreBuilder<Tokenize<T>> {}
