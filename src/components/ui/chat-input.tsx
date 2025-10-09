"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
  maxLength?: number;
  // When true, the send button requires an image to be present
  requireImage?: boolean;
  // Indicates whether an image is currently selected
  hasImage?: boolean;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Describe what you want (e.g., \"remove background\", \"add a big smile\", \"make it brighter\")",
  disabled = false,
  isLoading = false,
  className,
  maxLength = 500,
  requireImage = false,
  hasImage = false,
}: ChatInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;
    const maxHeight = 200; // Maximum height in pixels
    textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const allowSubmit = value.trim() && (!requireImage || hasImage) && !disabled && !isLoading;
      if (allowSubmit) {
        onSubmit();
      }
    }
  }, [value, requireImage, hasImage, disabled, isLoading, onSubmit]);

  const handleSubmit = useCallback(() => {
    const allowSubmit = value.trim() && (!requireImage || hasImage) && !disabled && !isLoading;
    if (allowSubmit) {
      onSubmit();
    }
  }, [value, requireImage, hasImage, disabled, isLoading, onSubmit]);

  const remainingChars = maxLength - value.length;
  const isNearLimit = remainingChars < 50;

  return (
    <div className={cn("w-full", className)}>
      <motion.div
        className={cn(
          "relative group rounded-2xl border transition-all duration-300",
          isFocused 
            ? "border-white/60 bg-white/10 shadow-lg shadow-white/5" 
            : isHovered
            ? "border-white/40 bg-white/5"
            : "border-white/20 bg-white/5",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        animate={{
          scale: isFocused ? 1.02 : 1,
        }}
        transition={{ duration: 0.2 }}
      >
        {/* Background overlay */}
        <div className="absolute inset-0 rounded-2xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="relative flex items-end gap-3 p-4">
          {/* Textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              disabled={disabled}
              maxLength={maxLength}
              className={cn(
                "w-full resize-none bg-transparent text-white placeholder:text-white/50",
                "focus:outline-none focus:ring-0",
                "text-sm leading-relaxed",
                "min-h-[44px] max-h-[200px]"
              )}
              style={{ fontFamily: 'SentinelBook, ui-sans-serif, system-ui' }}
            />

            {/* Character count */}
            <AnimatePresence>
              {isFocused && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-2 right-3"
                >
                  <span className={cn(
                    "text-xs",
                    isNearLimit ? "text-orange-400" : "text-white/40"
                  )}>
                    {remainingChars} characters remaining
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Submit Button */}
          <motion.button
            onClick={handleSubmit}
            disabled={!value.trim() || (requireImage && !hasImage) || disabled || isLoading}
            className={cn(
              "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center",
              "transition-all duration-200",
              value.trim() && (!requireImage || hasImage) && !disabled && !isLoading
                ? "bg-white text-black hover:bg-gray-100 shadow-lg shadow-white/10"
                : "bg-white/10 text-white/40 cursor-not-allowed"
            )}
            whileHover={value.trim() && (!requireImage || hasImage) && !disabled && !isLoading ? { scale: 1.05 } : {}}
            whileTap={value.trim() && (!requireImage || hasImage) && !disabled && !isLoading ? { scale: 0.95 } : {}}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </motion.button>
        </div>

        {/* Floating label removed as requested */}

        {/* Animated particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              style={{
                left: `${15 + i * 25}%`,
                top: `${20 + (i % 2) * 60}%`,
              }}
              animate={{
                y: [-10, 10, -10],
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration: 2 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.4,
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
