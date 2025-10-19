export type CamelCaseToKebabCase<S extends string> = S extends `${infer T}${infer U}`
  ? U extends Uncapitalize<U>
    ? `${Uncapitalize<T>}${CamelCaseToKebabCase<U>}`
    : `${Uncapitalize<T>}-${CamelCaseToKebabCase<U>}`
  : '';

export type KebabCaseToCamelCase<S extends string> = S extends `${infer T}-${infer U}`
  ? `${T}${Capitalize<KebabCaseToCamelCase<U>>}`
  : S;

/**
 * Includes types from T that do match the Pattern
 */
export type IncludeByPattern<T extends string, Pattern extends string> = T extends Pattern ? T : never;
/**
 * Excludes types from T that do match the Pattern
 */
export type ExcludeByPattern<T extends string, Pattern extends string> = T extends Pattern ? never : T;

/**
 * Recursively strips leading colons from a string.
 */
export type StripColons<T extends string> = T extends `:${infer R}` ? StripColons<R> : T;

export type ArrayWithAtLeastOneItem<T> = [T, ...T[]];
