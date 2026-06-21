import { beforeEach, describe, expect, it } from 'vitest';

import { Surimi, select, viewTransition, viewTransitionClass } from '../../src/index';

describe('View Transition Builder', () => {
  beforeEach(() => {
    Surimi.clear();
  });

  describe('Snapshot pseudo-elements', () => {
    it('should emit root-scoped old/new/group/image-pair rules for a name', () => {
      viewTransition('card')
        .old({ animation: 'fade-out 0.3s ease both' })
        .new({ animation: 'fade-in 0.3s ease both' })
        .group({ animationDuration: '0.5s' })
        .imagePair({ isolation: 'isolate' });

      expect(Surimi.build()).toBe(`\
::view-transition-old(card) {
    animation: fade-out 0.3s ease both;
}
::view-transition-new(card) {
    animation: fade-in 0.3s ease both;
}
::view-transition-group(card) {
    animation-duration: 0.5s;
}
::view-transition-image-pair(card) {
    isolation: isolate;
}`);
    });

    it('should NOT nest snapshot rules under the named element', () => {
      const card = viewTransition('card');
      select('.card').use(card);
      card.group({ animationDuration: '0.5s' });

      // .card gets the name; the group rule stays at the top level (no `.card` ancestor).
      expect(Surimi.build()).toBe(`\
.card {
    view-transition-name: card;
}
::view-transition-group(card) {
    animation-duration: 0.5s;
}`);
    });

    it('should merge repeated calls for the same target into one rule', () => {
      viewTransition('card').group({ animationDuration: '0.5s' }).group({ animationTimingFunction: 'ease-out' });

      expect(Surimi.build()).toBe(`\
::view-transition-group(card) {
    animation-duration: 0.5s;
    animation-timing-function: ease-out;
}`);
    });
  });

  describe('Element-name assignment', () => {
    it('should set view-transition-name via use()', () => {
      select('main').use(viewTransition('page'));

      expect(Surimi.build()).toBe(`\
main {
    view-transition-name: page;
}`);
    });

    it('should set view-transition-name when passed as a value token', () => {
      const page = viewTransition('page');
      select('main').style({ viewTransitionName: page });

      expect(Surimi.build()).toBe(`\
main {
    view-transition-name: page;
}`);
    });

    it('should stringify to the name', () => {
      expect(`${viewTransition('hero')}`).toBe('hero');
      expect(viewTransition('hero').build()).toBe('hero');
    });
  });

  describe('Class and universal targeting', () => {
    it('should target a view-transition-class with (*.class)', () => {
      viewTransitionClass('card').group({ animationDuration: '0.4s' });

      expect(Surimi.build()).toBe(`\
::view-transition-group(*.card) {
    animation-duration: 0.4s;
}`);
    });

    it('should target every snapshot with (*)', () => {
      viewTransition.all().old({ animation: 'none' }).new({ animation: 'none' });

      expect(Surimi.build()).toBe(`\
::view-transition-old(*) {
    animation: none;
}
::view-transition-new(*) {
    animation: none;
}`);
    });
  });

  describe('@view-transition at-rule', () => {
    it('should emit the cross-document opt-in', () => {
      viewTransition.navigation('auto');

      expect(Surimi.build()).toBe(`\
@view-transition {
    navigation: auto;
}`);
    });

    it('should allow duplicate at-rules (no dedupe)', () => {
      viewTransition.navigation('auto');
      viewTransition.navigation('none');

      expect(Surimi.build()).toBe(`\
@view-transition {
    navigation: auto;
}
@view-transition {
    navigation: none;
}`);
    });
  });
});
