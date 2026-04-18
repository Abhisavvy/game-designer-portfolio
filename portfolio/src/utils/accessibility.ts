/**
 * Accessibility utility functions and helpers
 */

/**
 * Manages focus for modal dialogs and dynamic content
 */
export class FocusManager {
  private previousFocus: HTMLElement | null = null;
  private focusTrap: HTMLElement | null = null;

  /**
   * Captures current focus and optionally sets focus trap
   */
  captureFocus(trapElement?: HTMLElement) {
    this.previousFocus = document.activeElement as HTMLElement;
    if (trapElement) {
      this.setFocusTrap(trapElement);
    }
  }

  /**
   * Restores focus to previously focused element
   */
  restoreFocus() {
    if (this.previousFocus) {
      this.previousFocus.focus();
      this.previousFocus = null;
    }
    this.clearFocusTrap();
  }

  /**
   * Sets up focus trap within an element
   */
  private setFocusTrap(element: HTMLElement) {
    this.focusTrap = element;
    const focusableElements = this.getFocusableElements(element);
    
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    document.addEventListener('keydown', this.handleFocusTrap);
  }

  /**
   * Clears focus trap
   */
  private clearFocusTrap() {
    if (this.focusTrap) {
      document.removeEventListener('keydown', this.handleFocusTrap);
      this.focusTrap = null;
    }
  }

  /**
   * Handles Tab key within focus trap
   */
  private handleFocusTrap = (event: KeyboardEvent) => {
    if (event.key !== 'Tab' || !this.focusTrap) return;

    const focusableElements = this.getFocusableElements(this.focusTrap);
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const currentElement = document.activeElement as HTMLElement;

    if (event.shiftKey) {
      // Shift + Tab
      if (currentElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (currentElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  };

  /**
   * Gets all focusable elements within a container
   */
  private getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    return Array.from(container.querySelectorAll(focusableSelectors))
      .filter((element) => {
        const el = element as HTMLElement;
        return el.offsetWidth > 0 && el.offsetHeight > 0 && !el.hidden;
      }) as HTMLElement[];
  }
}

/**
 * Announces content to screen readers
 */
export class ScreenReaderAnnouncer {
  private announcer: HTMLElement;
  private timeoutId: number | null = null;

  constructor() {
    this.announcer = this.createAnnouncer();
  }

  /**
   * Announces a message to screen readers
   */
  announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.announcer.setAttribute('aria-live', priority);
    this.announcer.textContent = '';

    // Brief delay to ensure screen readers notice the change
    this.timeoutId = window.setTimeout(() => {
      this.announcer.textContent = message;
      
      // Clear after announcing
      this.timeoutId = window.setTimeout(() => {
        this.announcer.textContent = '';
      }, 1000);
    }, 100);
  }

  /**
   * Creates the hidden announcer element
   */
  private createAnnouncer(): HTMLElement {
    const existing = document.getElementById('sr-announcer');
    if (existing) return existing;

    const announcer = document.createElement('div');
    announcer.id = 'sr-announcer';
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.style.cssText = `
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    `;
    
    document.body.appendChild(announcer);
    return announcer;
  }
}

// Global instances
export const focusManager = new FocusManager();
export const announcer = new ScreenReaderAnnouncer();

/**
 * Generates unique IDs for form fields and ARIA relationships
 */
let idCounter = 0;
export function generateId(prefix = 'a11y'): string {
  return `${prefix}-${++idCounter}`;
}

/**
 * Custom hook for managing accessible form fields
 */
export interface AccessibleFieldProps {
  id: string;
  labelId?: string;
  descriptionId?: string;
  errorId?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  'aria-required'?: boolean;
}

export function createAccessibleField(
  label?: string,
  description?: string,
  error?: string,
  required?: boolean
): AccessibleFieldProps {
  const id = generateId('field');
  const labelId = label ? `${id}-label` : undefined;
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  
  const describedBy = [descriptionId, errorId].filter(Boolean).join(' ') || undefined;

  return {
    id,
    labelId,
    descriptionId,
    errorId,
    'aria-describedby': describedBy,
    'aria-invalid': !!error,
    'aria-required': required,
  };
}

/**
 * Keyboard navigation utilities
 */
export const KeyboardNav = {
  /**
   * Handles arrow key navigation within a group of elements
   */
  handleArrowKeys(
    event: KeyboardEvent,
    elements: NodeListOf<Element> | Element[],
    currentIndex: number,
    onChange: (newIndex: number) => void
  ) {
    const elementsArray = Array.from(elements);
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        newIndex = (currentIndex + 1) % elementsArray.length;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        newIndex = currentIndex === 0 ? elementsArray.length - 1 : currentIndex - 1;
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = elementsArray.length - 1;
        break;
    }

    if (newIndex !== currentIndex) {
      onChange(newIndex);
      (elementsArray[newIndex] as HTMLElement).focus();
    }
  },

  /**
   * Adds keyboard support to clickable elements
   */
  makeClickable(element: HTMLElement, onClick: () => void) {
    element.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onClick();
      }
    });
  }
};

/**
 * Checks if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Safely scrolls element into view with respect for motion preferences
 */
export function scrollIntoViewSafely(
  element: HTMLElement,
  options?: ScrollIntoViewOptions
) {
  const defaultOptions: ScrollIntoViewOptions = {
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    block: 'center',
    inline: 'nearest',
  };

  element.scrollIntoView({ ...defaultOptions, ...options });
}