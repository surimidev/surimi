/**
 * Example plugin: Typography utilities
 * 
 * This plugin adds convenient typography methods to Surimi builders.
 */

import type { Tokenize } from '@surimi/parsers';

import { WithStyling } from '../builders/mixins/styling.mixin';

type FontSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
type FontWeight = 'thin' | 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';

const fontSizeMap: Record<FontSize, string> = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
  '5xl': '3rem',
};

const fontWeightMap: Record<FontWeight, string> = {
  thin: '100',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
};

/**
 * Plugin that adds typography helper methods to builders
 */
export abstract class WithTypography<TContext extends string> extends WithStyling<TContext> {
  /**
   * Set font size using predefined scale or custom value
   * @param size - Font size (preset or custom CSS value)
   */
  public fontSize(size: FontSize | string) {
    const value = size in fontSizeMap ? fontSizeMap[size as FontSize] : size;
    this.style({ fontSize: value });
    return this;
  }

  /**
   * Set font weight using predefined names or custom value
   * @param weight - Font weight (preset or custom CSS value)
   */
  public fontWeight(weight: FontWeight | string) {
    const value = weight in fontWeightMap ? fontWeightMap[weight as FontWeight] : weight;
    this.style({ fontWeight: value });
    return this;
  }

  /**
   * Set text alignment
   * @param align - Text alignment
   */
  public textAlign(align: 'left' | 'center' | 'right' | 'justify') {
    this.style({ textAlign: align });
    return this;
  }

  /**
   * Set text color
   * @param color - Text color
   */
  public textColor(color: string) {
    this.style({ color });
    return this;
  }

  /**
   * Set line height
   * @param height - Line height
   */
  public lineHeight(height: string) {
    this.style({ lineHeight: height });
    return this;
  }

  /**
   * Set letter spacing
   * @param spacing - Letter spacing
   */
  public letterSpacing(spacing: string) {
    this.style({ letterSpacing: spacing });
    return this;
  }

  /**
   * Make text uppercase
   */
  public uppercase() {
    this.style({ textTransform: 'uppercase' });
    return this;
  }

  /**
   * Make text lowercase
   */
  public lowercase() {
    this.style({ textTransform: 'lowercase' });
    return this;
  }

  /**
   * Capitalize text
   */
  public capitalize() {
    this.style({ textTransform: 'capitalize' });
    return this;
  }

  /**
   * Apply text truncation with ellipsis
   */
  public truncate() {
    this.style({
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    });
    return this;
  }

  /**
   * Limit text to specific number of lines with ellipsis
   * @param lines - Number of lines to show
   */
  public lineClamp(lines: number) {
    this.style({
      display: '-webkit-box',
      WebkitLineClamp: lines.toString(),
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
    });
    return this;
  }
}
