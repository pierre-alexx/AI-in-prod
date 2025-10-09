"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ImageUploadProps {
  onImageSelect: (file: File | null) => void;
  selectedImage: File | null;
  className?: string;
  disabled?: boolean;
}

export function ImageUpload({ 
  onImageSelect, 
  selectedImage, 
  className,
  disabled = false 
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    if (disabled) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    onImageSelect(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Simulate upload progress
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 50);
  }, [onImageSelect, disabled]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect, disabled]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const removeFile = useCallback(() => {
    onImageSelect(null);
    setPreview(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onImageSelect]);

  return (
    <div className={cn("w-full", className)}>
      <motion.div
        className={cn(
          "group relative border-2 border-dashed rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer",
          isDragging 
            ? "border-white/60 bg-white/10 scale-[1.02]" 
            : "border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        whileHover={{ scale: disabled ? 1 : 1.01 }}
        whileTap={{ scale: disabled ? 1 : 0.99 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />

        {/* Background overlay */}
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative p-8 text-center">
          {preview ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              {/* Image Preview */}
              <div className="relative mx-auto w-32 h-32 rounded-xl overflow-hidden border border-white/20">
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
                {uploadProgress < 100 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                )}
                {uploadProgress === 100 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 bg-white/10 flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </motion.div>
                )}
              </div>

              {/* File Info */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-white truncate">
                  {selectedImage?.name}
                </p>
                <p className="text-xs text-white/60">
                  {selectedImage ? `${(selectedImage.size / 1024 / 1024).toFixed(2)} MB` : ''}
                </p>
              </div>

              {/* Progress Bar */}
              {uploadProgress < 100 && (
                <div className="w-full bg-white/10 rounded-full h-1">
                  <motion.div
                    className="bg-white h-1 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}

              {/* Remove Button */}
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white/80 hover:text-white bg-white/10 hover:bg-red-500/20 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-4 h-4" />
                Remove
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Upload Icon */}
              <motion.div
                className="mx-auto w-16 h-16 rounded-full bg-white/10 flex items-center justify-center"
                animate={isDragging ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                transition={{ duration: 0.2 }}
              >
                {isDragging ? (
                  <motion.div
                    animate={{ y: [-2, 2, -2] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  >
                    <Upload className="w-8 h-8 text-white/80" />
                  </motion.div>
                ) : (
                  <ImageIcon className="w-8 h-8 text-white/80" />
                )}
              </motion.div>

              {/* Upload Text */}
              <div className="space-y-2">
                <motion.p
                  className="text-lg font-semibold text-white"
                  animate={isDragging ? { scale: 1.05 } : { scale: 1 }}
                >
                  {isDragging ? 'Drop your image here' : 'Upload your image'}
                </motion.p>
                <p className="text-sm text-white/60">
                  Drag and drop or click to browse
                </p>
                <p className="text-xs text-white/40">
                  PNG, JPG, GIF up to 5MB
                </p>
              </div>

              {/* Upload Button */}
              <motion.button
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-xl transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Upload className="w-4 h-4" />
                Choose File
              </motion.button>
            </motion.div>
          )}
        </div>

        {/* Animated particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 2) * 40}%`,
              }}
              animate={{
                y: [-20, 20, -20],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
