import type { ISurimiSelector } from './types';

/**
 * Represents a CSS class selector
 * Provides methods to get the raw class name or the CSS selector
 */
export class ClassSelector implements ISurimiSelector {
  constructor(private readonly name: string) {}

  /**
   * Returns the raw class name without the dot prefix
   * @example
   * const button = new ClassSelector('button');
   * button.toString(); // "button"
   */
  toString(): string {
    return this.name;
  }

  /**
   * Returns the CSS class selector with dot prefix
   * @example
   * const button = new ClassSelector('button');
   * button.toSelector(); // ".button"
   */
  toSelector(): string {
    return `.${this.name}`;
  }

  /**
   * Gets the raw class name (alias for toString)
   */
  get className(): string {
    return this.name;
  }
}

/**
 * Represents a CSS ID selector
 * Provides methods to get the raw ID name or the CSS selector
 */
export class IdSelector implements ISurimiSelector {
  constructor(private readonly name: string) {}

  /**
   * Returns the raw ID name without the hash prefix
   * @example
   * const header = new IdSelector('header');
   * header.toString(); // "header"
   */
  toString(): string {
    return this.name;
  }

  /**
   * Returns the CSS ID selector with hash prefix
   * @example
   * const header = new IdSelector('header');
   * header.toSelector(); // "#header"
   */
  toSelector(): string {
    return `#${this.name}`;
  }

  /**
   * Gets the raw ID name (alias for toString)
   */
  get idName(): string {
    return this.name;
  }
}
