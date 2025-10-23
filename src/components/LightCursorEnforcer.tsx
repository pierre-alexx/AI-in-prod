"use client";

import { useEffect } from "react";

export function LightCursorEnforcer() {
  useEffect(() => {
    // Lightweight cursor application - only apply once on mount
    const applyCursors = () => {
      // Apply to all existing elements
      const allElements = document.querySelectorAll('*');
      
      allElements.forEach((element: Element) => {
        const htmlElement = element as HTMLElement;
        
        // Check if it's an interactive element
        const isInteractive = htmlElement.matches(
          'a, button, [role=button], [role=link], input:not([type=hidden]), textarea, select, [data-cursor=pointer], .cursor-pointer, .pointer, [tabindex]:not([tabindex="-1"])'
        );
        
        // Check if it's inside a link (like logo area)
        const isInsideLink = htmlElement.closest('a');
        
        // Check if it's a text input
        const isTextInput = htmlElement.matches(
          'input[type="text"], input[type="search"], input[type="password"], input[type="email"], input[type="url"], input[type="tel"], textarea'
        );
        
        // Apply appropriate cursor
        if (isTextInput) {
          htmlElement.style.setProperty('cursor', "url('/arrow.svg') 8 8, text", 'important');
        } else if (isInteractive || isInsideLink) {
          htmlElement.style.setProperty('cursor', "url('/pointer.svg') 8 8, pointer", 'important');
        } else {
          htmlElement.style.setProperty('cursor', "url('/arrow.svg') 8 8, auto", 'important');
        }
      });
    };

    // Apply cursors after a short delay to ensure DOM is ready
    const timeoutId = setTimeout(applyCursors, 100);
    
    return () => clearTimeout(timeoutId);
  }, []);

  return null;
}
