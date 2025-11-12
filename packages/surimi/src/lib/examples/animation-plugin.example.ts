/**
 * Example plugin: Animation utilities
 * 
 * This plugin adds convenient animation methods to Surimi builders.
 */

import type { Tokenize } from '@surimi/parsers';

import { WithStyling } from '../builders/mixins/styling.mixin';

/**
 * Plugin that adds animation helper methods to builders
 */
export abstract class WithAnimations<TContext extends string> extends WithStyling<TContext> {
  /**
   * Apply a fade-in animation
   * @param duration - Animation duration (default: '0.3s')
   */
  public fadeIn(duration = '0.3s') {
    this.style({
      animation: `fadeIn ${duration}`,
      opacity: '1',
    });
    return this;
  }

  /**
   * Apply a fade-out animation
   * @param duration - Animation duration (default: '0.3s')
   */
  public fadeOut(duration = '0.3s') {
    this.style({
      animation: `fadeOut ${duration}`,
      opacity: '0',
    });
    return this;
  }

  /**
   * Apply a slide-in animation from specified direction
   * @param direction - Direction to slide from
   * @param duration - Animation duration (default: '0.3s')
   */
  public slideIn(direction: 'left' | 'right' | 'top' | 'bottom' = 'left', duration = '0.3s') {
    this.style({
      animation: `slideIn-${direction} ${duration} ease-out`,
    });
    return this;
  }

  /**
   * Apply a generic animation with custom parameters
   * @param name - Animation name
   * @param duration - Animation duration (default: '0.3s')
   * @param easing - Easing function (default: 'ease')
   */
  public animate(name: string, duration = '0.3s', easing = 'ease') {
    this.style({
      animation: `${name} ${duration} ${easing}`,
    });
    return this;
  }

  /**
   * Apply a pulse animation
   * @param duration - Animation duration (default: '1s')
   */
  public pulse(duration = '1s') {
    this.style({
      animation: `pulse ${duration} infinite`,
    });
    return this;
  }

  /**
   * Apply a bounce animation
   * @param duration - Animation duration (default: '1s')
   */
  public bounce(duration = '1s') {
    this.style({
      animation: `bounce ${duration}`,
    });
    return this;
  }
}
