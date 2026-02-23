import { beforeEach, describe, expect, it } from 'vitest';

import { keyframes, Surimi } from '../../src/index';

describe('Keyframes Builder', () => {
  beforeEach(() => {
    Surimi.clear();
  });

  describe('With builder', () => {
    it('should create simple keyframes', () => {
      keyframes('fade-in').from({ opacity: 0 }).to({ opacity: 1 });

      expect(Surimi.build()).toBe(`\
@keyframes fade-in {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}`);
    });

    it('should create keyframes with multiple steps', () => {
      keyframes('slide-and-fade')
        .at('0%', { transform: 'translateX(-100%)', opacity: 0 })
        .at('50%', { transform: 'translateX(0)', opacity: 0.5 })
        .at('100%', { transform: 'translateX(0)', opacity: 1 });

      expect(Surimi.build()).toBe(`\
@keyframes slide-and-fade {
    0% {
        transform: translateX(-100%);
        opacity: 0;
    }
    50% {
        transform: translateX(0);
        opacity: 0.5;
    }
    100% {
        transform: translateX(0);
        opacity: 1;
    }
}`);
    });

    it('should merge styles for the same step', () => {
      keyframes('bounce')
        .at('0%', { transform: 'translateY(0)' })
        .at('50%', { transform: 'translateY(-50px)' })
        .at('50%', { opacity: 0.5 })
        .at('100%', { transform: 'translateY(0)', opacity: 1 });

      expect(Surimi.build()).toBe(`\
@keyframes bounce {
    0% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-50px);
        opacity: 0.5;
    }
    100% {
        transform: translateY(0);
        opacity: 1;
    }
}`);
    });
  });

  describe('With steps argument', () => {
    it('should create keyframes from initial steps', () => {
      keyframes('fade-in', {
        from: { opacity: 0 },
        to: { opacity: 1 },
      });

      expect(Surimi.build()).toBe(`\
@keyframes fade-in {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}`);
    });

    it('should merge steps from argument and builder methods', () => {
      keyframes('slide-and-fade', {
        '0%': { transform: 'translateX(-100%)', opacity: 0 },
        '100%': { transform: 'translateX(0)', opacity: 1 },
      }).at('50%', { transform: 'translateX(0)', opacity: 0.5 });

      expect(Surimi.build()).toBe(`\
@keyframes slide-and-fade {
    0% {
        transform: translateX(-100%);
        opacity: 0;
    }
    100% {
        transform: translateX(0);
        opacity: 1;
    }
    50% {
        transform: translateX(0);
        opacity: 0.5;
    }
}`);
    });

    it('Should handle empty steps in the steps argument', () => {
      keyframes('fade-in', {
        from: { opacity: 0 },
        '50%': {},
        to: { opacity: 1 },
      });

      expect(Surimi.build()).toBe(`\
@keyframes fade-in {
    from {
        opacity: 0;
    }
    50% {
}
    to {
        opacity: 1;
    }
}`);
    });
  });
});
