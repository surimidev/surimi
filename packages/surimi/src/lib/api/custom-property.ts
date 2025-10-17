export class CustomProperty<TValue = string & {}> {
  public readonly name: string;
  public readonly syntax: string;
  public readonly inherits: boolean;
  public readonly initialValue: TValue;

  constructor(name: string, syntax: string, inherits: boolean, initialValue: TValue) {
    this.name = name;
    this.syntax = syntax;
    this.inherits = inherits;
    this.initialValue = initialValue;
  }

  public toString(): string {
    return `var(${this.name})`;
  }
}
