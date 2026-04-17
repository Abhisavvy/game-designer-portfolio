"use client";

import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  /** Fire only once when element comes into view */
  triggerOnce?: boolean;
  /** Enable the observer (useful for disabling during reduced motion) */
  enabled?: boolean;
}

/**
 * Optimized intersection observer hook
 * Provides better performance than basic whileInView animations
 * Includes built-in reduced motion support
 */
export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
) {
  const {
    threshold = 0.1,
    root = null,
    rootMargin = '0px',
    triggerOnce = true,
    enabled = true,
  } = options;

  const elementRef = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !enabled) return;

    // Don't create observer if already triggered and triggerOnce is true
    if (triggerOnce && hasTriggered) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          if (triggerOnce) {
            setHasTriggered(true);
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          setIsIntersecting(false);
        }
      },
      {
        threshold,
        root,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, root, rootMargin, triggerOnce, enabled, hasTriggered]);

  return {
    ref: elementRef,
    isIntersecting: triggerOnce ? (hasTriggered || isIntersecting) : isIntersecting,
    hasTriggered,
  };
}

/**
 * Hook specifically for animation triggers with reduced motion support
 */
export function useAnimationTrigger(options: UseIntersectionObserverOptions = {}) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const observer = useIntersectionObserver({
    ...options,
    enabled: options.enabled !== false, // Allow manual override
  });

  return {
    ...observer,
    shouldAnimate: !prefersReducedMotion && observer.isIntersecting,
    prefersReducedMotion,
  };
}