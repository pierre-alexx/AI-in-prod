"use client";

import { useState } from "react";

export interface ModelOption {
  id: string;
  name: string;
  description: string;
  speed: "Fast" | "Medium" | "Slow";
  quality: "High" | "Medium" | "Standard";
  bestFor: string;
}

const models: ModelOption[] = [
  {
    id: "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
    name: "SDXL",
    description: "High-quality, versatile image generation",
    speed: "Medium",
    quality: "High",
    bestFor: "General purpose, detailed images"
  },
  {
    id: "black-forest-labs/flux-schnell",
    name: "Flux Schnell",
    description: "Ultra-fast image generation",
    speed: "Fast",
    quality: "Medium",
    bestFor: "Quick iterations, real-time generation"
  },
  {
    id: "ideogram-ai/ideogram-v3-turbo",
    name: "Ideogram V3 Turbo",
    description: "Excellent for text in images",
    speed: "Fast",
    quality: "High",
    bestFor: "Text-heavy designs, logos with text"
  },
  {
    id: "recraft-ai/recraft-v3-svg",
    name: "Recraft V3 SVG",
    description: "Vector graphics and icons",
    speed: "Medium",
    quality: "High",
    bestFor: "Logos, icons, vector graphics"
  },
  {
    id: "bytedance/seedream-3",
    name: "Seedream 3",
    description: "Best overall quality and prompt adherence",
    speed: "Slow",
    quality: "High",
    bestFor: "Premium quality, complex prompts"
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

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-white/90 mb-3">
        Choose AI Model
      </label>
      
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between px-4 py-3 
          bg-white/5 border border-white/20 rounded-xl
          text-left transition-all duration-200
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10 hover:border-white/30'}
          ${isOpen ? 'bg-white/10 border-white/30' : ''}
        `}
      >
        <div className="flex items-center gap-3">
          <div className="text-white/80">⚡</div>
          <div>
            <div className="text-white font-medium">{selectedModelData.name}</div>
            <div className="text-white/60 text-sm">{selectedModelData.description}</div>
          </div>
        </div>
        <div className={`w-5 h-5 text-white/60 transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`}>
          ▼
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-black/90 backdrop-blur-sm border border-white/20 rounded-xl shadow-2xl overflow-hidden">
          {models.map((model) => (
            <button
              key={model.id}
              type="button"
              onClick={() => {
                onModelChange(model.id);
                setIsOpen(false);
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 text-left
                transition-colors duration-150
                ${selectedModel === model.id 
                  ? 'bg-white/10 text-white' 
                  : 'text-white/80 hover:bg-white/5 hover:text-white'
                }
              `}
            >
              <div className="text-white/80">⚡</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{model.name}</span>
                  {selectedModel === model.id && (
                    <span className="text-white">✓</span>
                  )}
                </div>
                <div className="text-sm text-white/60 mb-1">{model.description}</div>
                <div className="flex items-center gap-4 text-xs">
                  <span className={`px-2 py-1 rounded-full ${
                    model.speed === 'Fast' ? 'bg-green-500/20 text-green-400' :
                    model.speed === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {model.speed}
                  </span>
                  <span className={`px-2 py-1 rounded-full ${
                    model.quality === 'High' ? 'bg-blue-500/20 text-blue-400' :
                    model.quality === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {model.quality}
                  </span>
                </div>
                <div className="text-xs text-white/50 mt-1">
                  Best for: {model.bestFor}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
