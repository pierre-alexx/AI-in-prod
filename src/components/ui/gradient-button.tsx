"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isLoading?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function GradientButton({
  children,
  isLoading = false,
  variant = "primary",
  size = "md",
  className,
  disabled,
  ...props
}: GradientButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMouseEnter = () => {
    if (!disabled) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) return;

    // Create ripple effect
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const newRipple = {
        id: Date.now(),
        x,
        y,
      };
      setRipples(prev => [...prev, newRipple]);

      // Remove ripple after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
      }, 600);
    }

    props.onClick?.(e);
  };

  const sizeClasses = {
    sm: "h-10 px-4 text-sm",
    md: "h-12 px-6 text-base",
    lg: "h-14 px-8 text-lg",
  };

  const variantClasses = {
    primary: "bg-white text-black hover:bg-gray-50 border border-white/20 shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/20",
    secondary: "bg-gray-600 hover:bg-gray-700 text-white shadow-lg shadow-black/20",
    ghost: "bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm",
  };

  return (
    <motion.button
      ref={buttonRef}
      className={cn(
        "relative overflow-hidden rounded-2xl font-semibold transition-all duration-300",
        "focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "group",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      disabled={disabled || isLoading}
      whileHover={!disabled && !isLoading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
      {...props}
    >
      {/* Background with subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-gray-50 rounded-2xl group-hover:from-gray-50 group-hover:via-white group-hover:to-gray-100 transition-all duration-300" />
      
      {/* Subtle inner shadow */}
      <div className="absolute inset-0 rounded-2xl shadow-inner opacity-20" />
      
      {/* Top highlight */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Subtle border glow */}
      <div className="absolute inset-0 rounded-2xl border border-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Animated shimmer effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: "-100%" }}
        animate={{
          x: isHovered && !disabled ? "100%" : "-100%",
        }}
        transition={{
          duration: 0.8,
          ease: "easeInOut",
        }}
      />
      
      {/* Subtle pulsing effect when ready */}
      {!disabled && !isLoading && (
        <motion.div
          className="absolute inset-0 rounded-2xl border border-white/20"
          animate={{
            scale: [1, 1.02, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      {/* Ripple effects */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            className="absolute bg-white/40 rounded-full pointer-events-none"
            style={{
              left: ripple.x - 15,
              top: ripple.y - 15,
            }}
            initial={{ width: 0, height: 0, opacity: 0.8 }}
            animate={{ 
              width: 50, 
              height: 50, 
              opacity: 0,
              scale: [1, 1.2, 0.8]
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 0.8, 
              ease: "easeOut",
              times: [0, 0.5, 1]
            }}
          />
        ))}
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center gap-3">
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="font-medium">Generating...</span>
          </>
        ) : (
          <>
            <span className="font-semibold tracking-wide">{children}</span>
            <motion.div
              className="w-2 h-2 bg-black/20 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </>
        )}
      </div>

    </motion.button>
  );
}
