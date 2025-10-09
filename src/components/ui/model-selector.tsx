"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface ModelOption {
  id: string;
  name: string;
  description: string;
  speed: "Fast" | "Medium" | "Slow";
  quality: "High" | "Medium" | "Standard";
  icon: string;
  color: string;
}

const models: ModelOption[] = [
  
  {
    id: "black-forest-labs/flux-kontext-dev",
    name: "Flux Kontext",
    description: "Text-based image editing",
    speed: "Medium",
    quality: "High",
    icon: "⚡",
    color: "yellow"
  },
  {
    id: "google/nano-banana",
    name: "Google Nano (banana)",
    description: "Google image edit/gen",
    speed: "Fast",
    quality: "High",
    icon: "🍌",
    color: "violet"
  }
];

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  disabled?: boolean;
}

export function ModelSelector({ selectedModel, onModelChange, disabled = false }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedModelData = models.find(model => model.id === selectedModel) || models[0];

  const getColorClasses = (color: string) => {
    const colors = {
      purple: "border-purple-500/30 bg-purple-500/10 hover:border-purple-500/50",
      yellow: "border-yellow-500/30 bg-yellow-500/10 hover:border-yellow-500/50",
      blue: "border-blue-500/30 bg-blue-500/10 hover:border-blue-500/50",
      emerald: "border-emerald-500/30 bg-emerald-500/10 hover:border-emerald-500/50",
      violet: "border-violet-500/30 bg-violet-500/10 hover:border-violet-500/50"
    };
    return colors[color as keyof typeof colors] || colors.purple;
  };

  return (
    <div className="relative">
      {/* Compact Model Selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-white/70 whitespace-nowrap">Model:</span>
        
        <div className="relative min-w-[200px]">
          <motion.button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all duration-200 w-full
              ${getColorClasses(selectedModelData.color)}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              ${isOpen ? 'ring-2 ring-white/20' : ''}
            `}
            whileHover={!disabled ? { scale: 1.02 } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
          >
            <span className="text-lg flex-shrink-0">{selectedModelData.icon}</span>
            <span className="text-white font-medium text-sm flex-1 text-left">{selectedModelData.name}</span>
            <motion.span
              className="text-white/60 text-xs flex-shrink-0"
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              ▼
            </motion.span>
          </motion.button>

          {/* Compact Dropdown */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 right-0 z-50 mt-2 bg-black/95 backdrop-blur-sm border border-white/20 rounded-lg shadow-2xl overflow-hidden min-w-[200px] max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30"
              >
                <div className="py-1">
                  {models.map((model, index) => (
                  <motion.button
                    key={model.id}
                    type="button"
                    onClick={() => {
                      onModelChange(model.id);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150
                      ${selectedModel === model.id 
                        ? 'bg-white/10 text-white' 
                        : 'text-white/80 hover:bg-white/5 hover:text-white'
                      }
                    `}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                  >
                    <span className="text-lg flex-shrink-0">{model.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{model.name}</span>
                        {selectedModel === model.id && (
                          <span className="text-white text-xs flex-shrink-0">✓</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-white/60 flex-shrink-0">{model.description}</span>
                        <div className="flex gap-1 flex-shrink-0">
                          <span className={`px-1.5 py-0.5 rounded text-xs whitespace-nowrap ${
                            model.speed === 'Fast' ? 'bg-green-500/20 text-green-400' :
                            model.speed === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {model.speed}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-xs whitespace-nowrap ${
                            model.quality === 'High' ? 'bg-blue-500/20 text-blue-400' :
                            model.quality === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {model.quality}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
