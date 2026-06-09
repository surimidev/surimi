import type { Tokenize } from '@surimi/parsers';
import { mix } from 'ts-mixer';
import { WithSelecting } from '#builders/mixins';

import { CoreBuilder } from './core.builder';

export interface AtRuleBuilder<T extends string> extends WithSelecting<T> {}

/**
 * Used for building at-rules (e.g. `@media`, `@keyframes` etc.).
 * Common at-rules should have their own builders extending this class.
 *
 * This uses the Selecting mixin, which adds a `select` method for nested selections.
 */
@mix(WithSelecting)
export class AtRuleBuilder<T extends string> extends CoreBuilder<Tokenize<T>> {}
