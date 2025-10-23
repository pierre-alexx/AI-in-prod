"use client";

import { useEffect, useRef } from "react";

export function CursorEnforcer() {
  const processedElements = useRef(new WeakSet<Element>());
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Efficient cursor application - only apply to new elements
    const applyCursorsToNewElements = () => {
      const allElements = document.querySelectorAll('*');
      
      allElements.forEach((element: Element) => {
        // Skip if already processed
        if (processedElements.current.has(element)) return;
        
        const htmlElement = element as HTMLElement;
        
        // Check if it's an interactive element
        const isInteractive = htmlElement.matches(
          'a, button, [role=button], [role=link], input:not([type=hidden]), textarea, select, [data-cursor=pointer], .cursor-pointer, .pointer, [tabindex]:not([tabindex="-1"])'
        );
        
        // Check if it's a text input
        const isTextInput = htmlElement.matches(
          'input[type="text"], input[type="search"], input[type="password"], input[type="email"], input[type="url"], input[type="tel"], textarea'
        );
        
        // Apply appropriate cursor
        if (isTextInput) {
          htmlElement.style.setProperty('cursor', "url('/arrow.svg') 8 8, text", 'important');
        } else if (isInteractive) {
          htmlElement.style.setProperty('cursor', "url('/pointer.svg') 8 8, pointer", 'important');
        } else {
          htmlElement.style.setProperty('cursor', "url('/arrow.svg') 8 8, auto", 'important');
        }
        
        // Mark as processed
        processedElements.current.add(element);
      });
    };

    // Apply cursors to existing elements immediately
    applyCursorsToNewElements();

    // Watch for new elements being added to the DOM
    const observer = new MutationObserver((mutations) => {
      let hasNewElements = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              hasNewElements = true;
            }
          });
        }
      });
      
      if (hasNewElements) {
        // Use requestAnimationFrame to batch DOM updates
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }
        rafRef.current = requestAnimationFrame(applyCursorsToNewElements);
      }
    });

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Cleanup
    return () => {
      observer.disconnect();
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return null;
}