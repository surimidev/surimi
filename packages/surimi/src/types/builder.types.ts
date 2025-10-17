import type { NestableAtRule, SelectorRelationship } from '#types/css.types';

/**
 * Used to add at-rules to the builder context. These will be combined when generating the PostCSS AST.
 * Each entry can have multiple parameters, allowing for multiple at-rules of the same type to be nested.
 *
 * For information on what we consider to be a "nestable" at-rule, see the {@link NestableAtRule}.
 */
export type AtRuleContext = Record<NestableAtRule, string[]>;

/**
 * Defines how items in the context are related to each other.
 * Used for adding combinators like child selectors, sibling selectors etc. into the context string.
 */
export type BuilderContextRelationKind = SelectorRelationship;

/**
 * Additional, optional relation information for context items
 * For example, button:hover does not have any relation, but div > button has a child relation.
 */
export interface BuilderContextRelation {
  relation?: BuilderContextRelationKind;
}

/**
 * Map of relation kinds to their string representation in CSS selectors.
 */
export interface BuilderContextRelationMap {
  child: ' > ';
  adjacent: ' + ';
  sibling: ' ~ ';
  descendant: ' ';
}

/**
 * Union type for all possible builder context kinds.
 * They are used to generate complete context strings for selectors, pseudo-classes/elements etc.
 * Some items can have relations to the previous item in the context, which is represented by the {@link BuilderContextRelation}.
 * For example, a selector context item can have a child relation to the previous selector.
 */
export type BuilderContextItem =
  | ({ selector: string } & BuilderContextRelation)
  | { pseudoClass: string }
  | { pseudoElement: string }
  | { atRule: NestableAtRule; params: string };

/**
 * The complete builder context type, represented as an array of context items.
 * Each item contributes to the final selector string, at-rule nesting etc.
 *
 * It is passed to selector builders to maintain the current state of the selector being built, and giving type hints to users.
 */
export type BuilderContext = BuilderContextItem[];

/**
 * Extracts only the non-at-rule items from a builder context type.
 * Used when generating selector strings, as at-rules are handled separately.
 */
export type FlatBuilderContext = {
  [K in keyof BuilderContext]: BuilderContext[K] extends { atRule: unknown } ? never : BuilderContext[K];
};

/**
 * Extract the selector string from a builder context type.
 * Used for generating parts of the final selector string.
 *
 * For example, given a context type of `{ selector: 'button' }`,
 * this will extract the 'button' string.
 *
 * @example
 * type Selector = ExtractContextStringItem<{  selector: 'button' }>; // 'button'
 * type PseudoClass = ExtractContextStringItem<{ pseudoClass: 'hover' }>; // ":hover"
 * type AtRule = ExtractContextStringItem<{ atRule: '@media'; parameter: '(max-width: 600px)' }>; // "@media (max-width: 600px)"
 */
export type ExtractContextStringItem<TContext extends BuilderContextItem> = TContext extends {
  selector: infer S;
}
  ? S extends string
    ? TContext extends { relation: infer R }
      ? R extends SelectorRelationship
        ? `${BuilderContextRelationMap[R]}${S}`
        : `${S}`
      : `${S}`
    : never
  : TContext extends { pseudoClass: infer P }
    ? P extends string
      ? `:${P}`
      : never
    : TContext extends { pseudoElement: infer E }
      ? E extends string
        ? `::${E}`
        : never
      : TContext extends { atRule: infer A; parameter: infer Param }
        ? A extends NestableAtRule
          ? Param extends string
            ? // Using the `⤷` symbol to indicate that everything on the right is nested under the at-rule
              `${A} ${Param} ⤷ `
            : never
          : never
        : never;

/**
 * Recursively build a string representation of the builder context.
 * Used to generate the final selector string including at-rules, selectors, pseudo-classes and pseudo-elements.
 *
 * @example
 * type FullContext = ExtractContextString<
 *   [
 *     { atRule: '@media'; parameter: '(max-width: 600px)' },
 *     { selector: 'button' },
 *     { pseudoClass: 'hover' },
 *     { pseudoElement: 'after' },
 *   ]
 * >; // "@media (max-width: 600px) button:hover::after"
 */
export type ExtractContextString<TContexts extends BuilderContext> = TContexts extends [infer First, ...infer Rest]
  ? First extends BuilderContextItem
    ? Rest extends BuilderContextItem[]
      ? `${ExtractContextStringItem<First>}${ExtractContextString<Rest>}`
      : never
    : never
  : '';

/**
 * The exact opposite of {@link ExtractContextString}, this type takes a selector string
 * and converts it into a BuilderContext type.
 *
 * @example
 * type Context = ExtractBuildContextFromString<"@media (max-width: 600px) ⤷ button:hover::after">;
 * // [
 * //   { atRule: '@media'; parameter: '(max-width: 600px)' },
 * //   { selector: 'button' },
 * //   { pseudoClass: 'hover' },
 * //   { pseudoElement: 'after' },
 * // ]
 */
export type ExtractBuildContextFromString<T extends string> =
  T extends `${infer AtRule} ${infer Params} ⤷ ${infer Rest}`
    ? AtRule extends NestableAtRule
      ? [{ atRule: AtRule; params: Params }, ...ExtractBuildContextFromString<Rest>]
      : []
    : T extends `${infer FirstPart} > ${infer Rest}`
      ? [...ExtractBuildContextFromString<FirstPart>, ...ExtractSelectorWithRelation<Rest, 'child'>]
      : T extends `${infer FirstPart} + ${infer Rest}`
        ? [...ExtractBuildContextFromString<FirstPart>, ...ExtractSelectorWithRelation<Rest, 'adjacent'>]
        : T extends `${infer FirstPart} ~ ${infer Rest}`
          ? [...ExtractBuildContextFromString<FirstPart>, ...ExtractSelectorWithRelation<Rest, 'sibling'>]
          : T extends `${infer FirstPart} ${infer Rest}`
            ? Rest extends string
              ? [...ExtractBuildContextFromString<FirstPart>, ...ExtractSelectorWithRelation<Rest, 'descendant'>]
              : ExtractSingleSelector<T>
            : ExtractSingleSelector<T>;

type ExtractSelectorWithRelation<
  T extends string,
  R extends SelectorRelationship,
> = T extends `${infer Selector}:${infer PseudoClass}::${infer PseudoElement}`
  ? [{ selector: Selector; relation: R }, { pseudoClass: PseudoClass }, { pseudoElement: PseudoElement }]
  : T extends `${infer Selector}:${infer PseudoClass}`
    ? [{ selector: Selector; relation: R }, { pseudoClass: PseudoClass }]
    : T extends `${infer Selector}::${infer PseudoElement}`
      ? [{ selector: Selector; relation: R }, { pseudoElement: PseudoElement }]
      : [{ selector: T; relation: R }];

type ExtractSingleSelector<T extends string> =
  T extends `${infer Selector}:${infer PseudoClass}::${infer PseudoElement}`
    ? [{ selector: Selector }, { pseudoClass: PseudoClass }, { pseudoElement: PseudoElement }]
    : T extends `${infer Selector}:${infer PseudoClass}`
      ? [{ selector: Selector }, { pseudoClass: PseudoClass }]
      : T extends `${infer Selector}::${infer PseudoElement}`
        ? [{ selector: Selector }, { pseudoElement: PseudoElement }]
        : T extends `${infer Selector}`
          ? [{ selector: Selector }]
          : [];
