export interface CustomProperty<TValue extends string = string> {
  name: string;
  syntax: string;
  inherits: boolean;
  initialValue: TValue;
}
