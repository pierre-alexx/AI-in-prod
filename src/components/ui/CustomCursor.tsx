"use client";

import { useEffect, useRef, useState } from "react";

type CursorState = {
  x: number;
  y: number;
  visible: boolean;
  isPointerTarget: boolean;
  isPressed: boolean;
};

// A custom cursor inspired by Figma: a precise dot with a subtle outer ring.
// - The dot tracks the pointer precisely
// - The ring lags slightly behind for a smooth feel
// - On hover over interactive elements, the ring enlarges
// - On mousedown, the dot scales down for click feedback
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const pointerFineRef = useRef<boolean>(true);

  const [state, setState] = useState<CursorState>({
    x: 0,
    y: 0,
    visible: false,
    isPointerTarget: false,
    isPressed: false,
  });

  const targetPos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Disable custom cursor on touch / coarse pointers
    const mq = window.matchMedia("(pointer: fine)");
    pointerFineRef.current = mq.matches;
    const handleChange = () => {
      pointerFineRef.current = mq.matches;
      setState((s) => ({ ...s, visible: false }));
    };
    mq.addEventListener?.("change", handleChange);
    return () => mq.removeEventListener?.("change", handleChange);
  }, []);

  useEffect(() => {
    if (!pointerFineRef.current) return;

    const updateInteractiveState = (el: Element | null) => {
      const interactiveSelector =
        "a, button, [role=button], [role=link], input:not([type=hidden]), textarea, select, [data-cursor=pointer]";
      const isPointerTarget = !!(el && (el as HTMLElement).closest(interactiveSelector));
      setState((s) => ({ ...s, isPointerTarget }));
    };

    const onMouseMove = (e: MouseEvent) => {
      targetPos.current.x = e.clientX;
      targetPos.current.y = e.clientY;
      setState((s) => ({ ...s, x: e.clientX, y: e.clientY, visible: true }));
      updateInteractiveState(e.target as Element);
    };

    const onMouseEnter = () => setState((s) => ({ ...s, visible: true }));
    const onMouseLeave = () => setState((s) => ({ ...s, visible: false }));
    const onMouseDown = () => setState((s) => ({ ...s, isPressed: true }));
    const onMouseUp = () => setState((s) => ({ ...s, isPressed: false }));

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseenter", onMouseEnter, { passive: true });
    window.addEventListener("mouseleave", onMouseLeave, { passive: true });
    window.addEventListener("mousedown", onMouseDown, { passive: true });
    window.addEventListener("mouseup", onMouseUp, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMouseMove as any);
      window.removeEventListener("mouseenter", onMouseEnter as any);
      window.removeEventListener("mouseleave", onMouseLeave as any);
      window.removeEventListener("mousedown", onMouseDown as any);
      window.removeEventListener("mouseup", onMouseUp as any);
    };
  }, []);

  useEffect(() => {
    if (!pointerFineRef.current) return;

    // Smoothly interpolate the ring toward the target position
    const render = () => {
      const lerp = (start: number, end: number, t: number) => start + (end - start) * t;
      ringPos.current.x = lerp(ringPos.current.x, targetPos.current.x, 0.2);
      ringPos.current.y = lerp(ringPos.current.y, targetPos.current.y, 0.2);

      const dot = dotRef.current;
      const ring = ringRef.current;
      if (dot) {
        const dotScale = state.isPressed ? 0.8 : 1;
        dot.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) translate(-50%, -50%) scale(${dotScale})`;
        dot.style.opacity = state.visible ? "1" : "0";
      }
      if (ring) {
        const baseScale = state.isPointerTarget ? 1.2 : 1;
        const pressScale = state.isPressed ? 0.9 : 1;
        const scale = baseScale * pressScale;
        ring.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%) scale(${scale})`;
        ring.style.opacity = state.visible ? "1" : "0";
      }
      rafRef.current = window.requestAnimationFrame(render);
    };

    rafRef.current = window.requestAnimationFrame(render);
    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, [state.isPointerTarget, state.isPressed, state.visible, state.x, state.y]);

  // Do not render anything on coarse pointers
  if (typeof window !== "undefined" && !pointerFineRef.current) {
    return null;
  }

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden
        className="custom-cursor-ring"
      />
      <div
        ref={dotRef}
        aria-hidden
        className="custom-cursor-dot"
      />
    </>
  );
}





