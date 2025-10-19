/**
 * This file defines types to operate on builders using context strings and context arrays.
 * The context is used to give the user type hints when building selectors, applying styles etc.
 *
 * The core idea is that using some string like "@media (max-width: 600px) ⤷ button:hover > .icon::after",
 * we can extract a structured representation of the context as an array of items,
 * each representing a part of the selector or at-rule.
 * For this example, the context array would look like:
 * [
 *   { atRule: '@media', params: '(max-width: 600px)' },
 *   { selector: 'button' },
 *   { pseudoClass: 'hover' },
 *   { selector: '.icon', relation: 'child' },
 *   { pseudoElement: 'after' },
 * ]
 *
 * Groups of selectors can be represented using square brackets syntax:
 * "[button, .link] > .icon" would parse to:
 * [
 *   { group: [{ selector: 'button' }, { selector: '.link' }] },
 *   { selector: '.icon', relation: 'child' },
 * ]
 *
 * This structured context can then be used by the builder classes to generate the correct PostCSS AST,
 * while also providing type hints to users about what methods are available in the current context.
 *
 * It's important for these strings to be human-readable, but also unambiguous and easy to parse both ways (string -> context array, context array -> string).
 * To achieve this, we use specific delimiters:
 * - " ⤷ " to denote at-rule nesting
 * - " > ", " + ", " ~ ", " " to denote selector relationships (child, adjacent sibling, general sibling, descendant)
 * - "[...]" to denote groups of selectors
 * - ", " to denote multiple selectors (within groups)
 * - ":" to denote pseudo-classes
 * - "::" to denote pseudo-elements
 */

import type { NestableAtRule, SelectorRelationship, WithoutAtPrefix } from '#types/css.types';

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
 * Map of relation kinds to their string representation in CSS selectors.
 */
export interface BuilderContextRelationMap {
  child: '>';
  adjacent: '+';
  sibling: '~';
  descendant: ' ';
}

/**
 * Union type for all possible builder context kinds.
 * They are used to generate complete context strings for selectors, pseudo-classes/elements etc.
 * Some items can have relations to the previous item in the context, which is represented by the {@link BuilderContextRelation}.
 * For example, a selector context item can have a child relation to the previous selector.
 */
// TODO: We could make all of this even better by adding `BasePseudoClasses` and `BasePseudoElements` here for better type hints
// But that makes validation and parsing significantly more complex, so for now we keep it simple
export type BuilderContextItem =
  | { selector: string; relation?: BuilderContextRelationKind }
  | { pseudoClass: string }
  | { pseudoElement: string }
  | { atRule: NestableAtRule; params: string }
  | { group: BuilderContextItem[] };

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
 * type AtRule = ExtractContextStringItem<{ atRule: '@media'; params: '(max-width: 600px)' }>; // "@media (max-width: 600px)"
 * type Group = ExtractContextStringItem<{ group: [{ selector: 'button' }, { selector: '.link' }] }>; // "[button, .link]"
 */
export type ExtractContextStringItem<TContext extends BuilderContextItem> = TContext extends {
  selector: infer S;
}
  ? S extends string
    ? TContext extends { relation: infer R }
      ? R extends SelectorRelationship
        ? ` ${BuilderContextRelationMap[R]} ${S}`
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
      : TContext extends { atRule: infer A; params: infer Params }
        ? A extends NestableAtRule
          ? Params extends string
            ? `${A} ${Params} ⤷ `
            : never
          : never
        : TContext extends { group: infer G }
          ? G extends BuilderContextItem[]
            ? `[${ExtractGroupString<G>}]`
            : never
          : never;

/**
 * Helper type to extract comma-separated string representation of group items.
 * Used internally by ExtractContextStringItem for group context items.
 */
type ExtractGroupString<TGroupItems extends BuilderContextItem[]> = TGroupItems extends [infer First, ...infer Rest]
  ? First extends BuilderContextItem
    ? Rest extends BuilderContextItem[]
      ? Rest extends []
        ? `${ExtractContextStringItem<First>}`
        : `${ExtractContextStringItem<First>}, ${ExtractGroupString<Rest>}`
      : never
    : never
  : '';

/**
 * Recursively build a string representation of the builder context.
 * Used to generate the final selector string including at-rules, selectors, pseudo-classes and pseudo-elements.
 *
 * @example
 * type FullContext = ExtractContextString<
 * [
 *   { atRule: '@media'; params: '(max-width: 600px)' },
 *   { selector: 'button' },
 *   { selector: '.icon'; relation: 'child' },
 *   { pseudoClass: 'hover' },
 *   { pseudoElement: 'after' },
 * ]
 * >; // "@media (max-width: 600px) ⤷ button > .icon:hover::after"
 *
 * type GroupContext = ExtractContextString<
 * [
 *   { group: [{ selector: 'button' }, { selector: '.link' }] },
 *   { selector: '.icon'; relation: 'child' },
 * ]
 * >; // "[button, .link] > .icon"
 */
export type ExtractContextString<TContexts extends BuilderContext> = TContexts extends [infer First, ...infer Rest]
  ? First extends BuilderContextItem
    ? Rest extends BuilderContextItem[]
      ? ExtractContextString<Rest> extends ''
        ? `${ExtractContextStringItem<First>}`
        : `${ExtractContextStringItem<First>}${ExtractContextString<Rest>}`
      : never
    : never
  : '';

/**
 * The exact opposite of {@link ExtractContextString}, this type takes a selector string
 * and converts it into a BuilderContext type.
 *
 * @example
 * type Context = ExtractBuildContextFromString<"@media (max-width: 600px) ⤷ button > .icon:hover::after">;
 * // [
 * //  { atRule: '@media'; params: '(max-width: 600px)' },
 * //  { selector: 'button' },
 * //  { selector: '.icon'; relation: 'child' },
 * //  { pseudoClass: 'hover' },
 * //  { pseudoElement: 'after' },
 * // ]
 *
 * type GroupContext = ExtractBuildContextFromString<"[button, .link] > .icon">;
 * // [
 * //  { group: [{ selector: 'button' }, { selector: '.link' }] },
 * //  { selector: '.icon'; relation: 'child' },
 * // ]
 */
export type ExtractBuildContextFromString<T extends string> = T extends '' ? [] : ExtractBuildContextItem<T>;

/**
 * Helper type to parse relation-based selectors (>, +, ~, space).
 * This reduces duplication in the main parsing logic.
 */
type ParseWithRelation<Before extends string, After extends string, Relation extends BuilderContextRelationKind> = [
  ...ExtractBuildContextItem<Before>,
  ...ExtractBuildContextItemWithRelation<After, Relation>,
];

/**
 * Helper type to parse pseudo-elements with optional continuation.
 * Handles patterns like "selector::element rest" where rest can be more selectors.
 */
type ParsePseudoElement<
  Before extends string,
  ElementAndRest extends string,
> = ElementAndRest extends `${infer Element} > ${infer After}`
  ? [
      ...ExtractBuildContextItem<Before>,
      { pseudoElement: Element },
      ...ExtractBuildContextItemWithRelation<After, 'child'>,
    ]
  : ElementAndRest extends `${infer Element} + ${infer After}`
    ? [
        ...ExtractBuildContextItem<Before>,
        { pseudoElement: Element },
        ...ExtractBuildContextItemWithRelation<After, 'adjacent'>,
      ]
    : ElementAndRest extends `${infer Element} ~ ${infer After}`
      ? [
          ...ExtractBuildContextItem<Before>,
          { pseudoElement: Element },
          ...ExtractBuildContextItemWithRelation<After, 'sibling'>,
        ]
      : ElementAndRest extends `${infer Element} ${infer After}`
        ? [
            ...ExtractBuildContextItem<Before>,
            { pseudoElement: Element },
            ...ExtractBuildContextItemWithRelation<After, 'descendant'>,
          ]
        : [...ExtractBuildContextItem<Before>, { pseudoElement: ElementAndRest }];

/**
 * Helper type to parse pseudo-classes with optional continuation.
 * Handles patterns like "selector:class rest" where rest can be more selectors.
 */
type ParsePseudoClass<
  Before extends string,
  ClassAndRest extends string,
> = ClassAndRest extends `${infer Class} > ${infer After}`
  ? [...ExtractBuildContextItem<Before>, { pseudoClass: Class }, ...ExtractBuildContextItemWithRelation<After, 'child'>]
  : ClassAndRest extends `${infer Class} + ${infer After}`
    ? [
        ...ExtractBuildContextItem<Before>,
        { pseudoClass: Class },
        ...ExtractBuildContextItemWithRelation<After, 'adjacent'>,
      ]
    : ClassAndRest extends `${infer Class} ~ ${infer After}`
      ? [
          ...ExtractBuildContextItem<Before>,
          { pseudoClass: Class },
          ...ExtractBuildContextItemWithRelation<After, 'sibling'>,
        ]
      : ClassAndRest extends `${infer Class} ${infer After}`
        ? [
            ...ExtractBuildContextItem<Before>,
            { pseudoClass: Class },
            ...ExtractBuildContextItemWithRelation<After, 'descendant'>,
          ]
        : [...ExtractBuildContextItem<Before>, { pseudoClass: ClassAndRest }];

/**
 * Helper type to parse at-rules with their parameters and continuation.
 */
type ParseAtRule<AtRule extends string, Params extends string, Rest extends string> = AtRule extends NestableAtRule
  ? [{ atRule: AtRule; params: Params }, ...ExtractBuildContextItem<Rest>]
  : never;

/**
 * Parses a single string fragment into a BuilderContextItem array.
 * This type handles the parsing of context strings, including:
 * - At-rules with their parameters (e.g., "@media (max-width: 600px) ⤷ button")
 * - Groups of selectors (e.g., "[button, .link]")
 * - Selectors with optional relations (e.g., "button > .icon", "button")
 * - Pseudo-classes (e.g., "button:hover")
 * - Pseudo-elements (e.g., "button::after")
 * - Complex combinations (e.g., "button:hover::after")
 *
 * The parsing is designed to be unambiguous - each string can only be parsed one way.
 */
export type ExtractBuildContextItem<T extends string> =
  // Handle at-rules: "@media (max-width: 600px) ⤷ rest"
  T extends `${infer AtRule} ${infer Params} ⤷ ${infer Rest}`
    ? ParseAtRule<AtRule, Params, Rest>
    : // Handle groups: "[selector1, selector2] rest"
      T extends `[${infer GroupContent}]${infer Rest}`
      ? Rest extends ''
        ? [{ group: ParseGroupContent<GroupContent> }]
        : Rest extends ` > ${infer After}`
          ? [{ group: ParseGroupContent<GroupContent> }, ...ExtractBuildContextItemWithRelation<After, 'child'>]
          : Rest extends ` + ${infer After}`
            ? [{ group: ParseGroupContent<GroupContent> }, ...ExtractBuildContextItemWithRelation<After, 'adjacent'>]
            : Rest extends ` ~ ${infer After}`
              ? [{ group: ParseGroupContent<GroupContent> }, ...ExtractBuildContextItemWithRelation<After, 'sibling'>]
              : Rest extends ` ${infer After}`
                ? [
                    { group: ParseGroupContent<GroupContent> },
                    ...ExtractBuildContextItemWithRelation<After, 'descendant'>,
                  ]
                : never
      : // Handle pseudo-elements (higher precedence): "selector::element rest"
        T extends `${infer Before}::${infer ElementAndRest}`
        ? ParsePseudoElement<Before, ElementAndRest>
        : // Handle pseudo-classes: "selector:class rest"
          T extends `${infer Before}:${infer ClassAndRest}`
          ? ParsePseudoClass<Before, ClassAndRest>
          : // Handle relation-based selectors
            T extends `${infer Before} > ${infer After}`
            ? ParseWithRelation<Before, After, 'child'>
            : T extends `${infer Before} + ${infer After}`
              ? ParseWithRelation<Before, After, 'adjacent'>
              : T extends `${infer Before} ~ ${infer After}`
                ? ParseWithRelation<Before, After, 'sibling'>
                : // Handle descendant relation (space separation)
                  T extends `${infer Before} ${infer After}`
                  ? // Avoid conflicts with at-rule syntax and special characters
                    Before extends `${string} ⤷`
                    ? never
                    : After extends `>${string}` | `+${string}` | `~${string}`
                      ? never
                      : ParseWithRelation<Before, After, 'descendant'>
                  : // Handle simple selectors
                    T extends string
                    ? T extends ''
                      ? []
                      : [{ selector: T }]
                    : never;

/**
 * Helper type to parse the content inside group brackets into an array of BuilderContextItem.
 * Handles comma-separated selectors within groups like "button, .link, span".
 */
type ParseGroupContent<T extends string> = T extends `${infer First}, ${infer Rest}`
  ? [...ExtractBuildContextItem<First>, ...ParseGroupContent<Rest>]
  : ExtractBuildContextItem<T>;

/**
 * Helper type to parse a selector string that should have a specific relation to the previous selector.
 */
type ExtractBuildContextItemWithRelation<T extends string, Relation extends BuilderContextRelationKind> =
  // Handle pseudo-elements: "selector::element rest"
  T extends `${infer Selector}::${infer ElementAndRest}`
    ? ParsePseudoElementWithRelation<Selector, ElementAndRest, Relation>
    : // Handle pseudo-classes: "selector:class rest"
      T extends `${infer Selector}:${infer ClassAndRest}`
      ? ParsePseudoClassWithRelation<Selector, ClassAndRest, Relation>
      : // Handle regular selector
        T extends string
        ? T extends ''
          ? []
          : [{ selector: T; relation: Relation }]
        : never;

/**
 * Helper type to parse pseudo-elements when they have a relation to the previous selector.
 */
type ParsePseudoElementWithRelation<
  Selector extends string,
  ElementAndRest extends string,
  Relation extends BuilderContextRelationKind,
> = ElementAndRest extends `${infer Element} > ${infer After}`
  ? [
      { selector: Selector; relation: Relation },
      { pseudoElement: Element },
      ...ExtractBuildContextItemWithRelation<After, 'child'>,
    ]
  : ElementAndRest extends `${infer Element} + ${infer After}`
    ? [
        { selector: Selector; relation: Relation },
        { pseudoElement: Element },
        ...ExtractBuildContextItemWithRelation<After, 'adjacent'>,
      ]
    : ElementAndRest extends `${infer Element} ~ ${infer After}`
      ? [
          { selector: Selector; relation: Relation },
          { pseudoElement: Element },
          ...ExtractBuildContextItemWithRelation<After, 'sibling'>,
        ]
      : ElementAndRest extends `${infer Element} ${infer After}`
        ? [
            { selector: Selector; relation: Relation },
            { pseudoElement: Element },
            ...ExtractBuildContextItemWithRelation<After, 'descendant'>,
          ]
        : [{ selector: Selector; relation: Relation }, { pseudoElement: ElementAndRest }];

/**
 * Helper type to parse pseudo-classes when they have a relation to the previous selector.
 */
type ParsePseudoClassWithRelation<
  Selector extends string,
  ClassAndRest extends string,
  Relation extends BuilderContextRelationKind,
> = ClassAndRest extends `${infer Class} > ${infer After}`
  ? [
      { selector: Selector; relation: Relation },
      { pseudoClass: Class },
      ...ExtractBuildContextItemWithRelation<After, 'child'>,
    ]
  : ClassAndRest extends `${infer Class} + ${infer After}`
    ? [
        { selector: Selector; relation: Relation },
        { pseudoClass: Class },
        ...ExtractBuildContextItemWithRelation<After, 'adjacent'>,
      ]
    : ClassAndRest extends `${infer Class} ~ ${infer After}`
      ? [
          { selector: Selector; relation: Relation },
          { pseudoClass: Class },
          ...ExtractBuildContextItemWithRelation<After, 'sibling'>,
        ]
      : ClassAndRest extends `${infer Class} ${infer After}`
        ? [
            { selector: Selector; relation: Relation },
            { pseudoClass: Class },
            ...ExtractBuildContextItemWithRelation<After, 'descendant'>,
          ]
        : [{ selector: Selector; relation: Relation }, { pseudoClass: ClassAndRest }];
