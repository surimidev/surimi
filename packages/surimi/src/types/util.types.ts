export type CamelCaseToKebabCase<S extends string> = S extends `${infer T}${infer U}`
  ? U extends Uncapitalize<U>
    ? `${Uncapitalize<T>}${CamelCaseToKebabCase<U>}`
    : `${Uncapitalize<T>}-${CamelCaseToKebabCase<U>}`
  : '';
