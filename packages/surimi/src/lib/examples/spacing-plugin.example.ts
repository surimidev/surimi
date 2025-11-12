/**
 * Example plugin: Spacing utilities
 * 
 * This plugin adds convenient spacing methods to Surimi builders.
 */

import type { Tokenize } from '@surimi/parsers';

import { WithStyling } from '../builders/mixins/styling.mixin';

/**
 * Plugin that adds spacing helper methods to builders
 */
export abstract class WithSpacing<TContext extends string> extends WithStyling<TContext> {
  /**
   * Apply gap (for flexbox/grid)
   * @param size - Gap size
   */
  public gap(size: string) {
    this.style({ gap: size });
    return this;
  }

  /**
   * Apply row gap
   * @param size - Row gap size
   */
  public rowGap(size: string) {
    this.style({ rowGap: size });
    return this;
  }

  /**
   * Apply column gap
   * @param size - Column gap size
   */
  public columnGap(size: string) {
    this.style({ columnGap: size });
    return this;
  }

  /**
   * Apply padding on all sides
   * @param size - Padding size
   */
  public padding(size: string) {
    this.style({ padding: size });
    return this;
  }

  /**
   * Apply padding to specific sides
   * @param top - Top padding
   * @param right - Right padding (defaults to top if not provided)
   * @param bottom - Bottom padding (defaults to top if not provided)
   * @param left - Left padding (defaults to right if not provided)
   */
  public paddingXY(top: string, right?: string, bottom?: string, left?: string) {
    const values = [top, right ?? top, bottom ?? top, left ?? right ?? top].join(' ');
    this.style({ padding: values });
    return this;
  }

  /**
   * Apply horizontal padding
   * @param size - Horizontal padding size
   */
  public paddingX(size: string) {
    this.style({
      paddingLeft: size,
      paddingRight: size,
    });
    return this;
  }

  /**
   * Apply vertical padding
   * @param size - Vertical padding size
   */
  public paddingY(size: string) {
    this.style({
      paddingTop: size,
      paddingBottom: size,
    });
    return this;
  }

  /**
   * Apply margin on all sides
   * @param size - Margin size
   */
  public margin(size: string) {
    this.style({ margin: size });
    return this;
  }

  /**
   * Apply horizontal margin
   * @param size - Horizontal margin size
   */
  public marginX(size: string) {
    this.style({
      marginLeft: size,
      marginRight: size,
    });
    return this;
  }

  /**
   * Apply vertical margin
   * @param size - Vertical margin size
   */
  public marginY(size: string) {
    this.style({
      marginTop: size,
      marginBottom: size,
    });
    return this;
  }

  /**
   * Center element horizontally with margin auto
   */
  public centerX() {
    this.style({
      marginLeft: 'auto',
      marginRight: 'auto',
    });
    return this;
  }
}
