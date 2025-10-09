"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import HeroScene from "@/components/scene/HeroScene";
import { ImageUpload } from "@/components/ui/image-upload";
import { ChatInput } from "@/components/ui/chat-input";
import { GradientButton } from "@/components/ui/gradient-button";
import { ModelSelector } from "@/components/ui/model-selector";

export default function LandingPage() {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [mounted, setMounted] = useState(false);

  const rotate = useTransform(scrollYProgress, [0, 1], [0, 10]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.7]);
  // Parallax offsets for aurora layers
  const l1y = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const l2y = useTransform(scrollYProgress, [0, 1], [0, 30]);
  const l3y = useTransform(scrollYProgress, [0, 1], [0, -20]);

  
  // Image generation states
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [inputImageUrl, setInputImageUrl] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto typewriter sentences (not linked to scroll). Keep static prefix "Renoir " always visible
  const staticPrefix = "Renoir ";
  const phrases = [
    "transforms your images with AI. Upload, describe, create.",
    "makes your photos better. Instantly.",
    "turns ideas into reality. One image at a time.",
    "sees what you see. Makes it better.",
    "creates magic from moments."
  ];
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [typedDynamic, setTypedDynamic] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const holdRef = useRef<number | null>(null);

  useEffect(() => {
    const current = phrases[sentenceIndex % phrases.length];
    const typeDelay = isDeleting ? 14 : 20; // faster typing/deleting

    if (!isDeleting && typedDynamic === current) {
      // Hold before deleting (increased by +2s for readability)
      holdRef.current = window.setTimeout(() => setIsDeleting(true), 5000);
      return () => {
        if (holdRef.current) window.clearTimeout(holdRef.current);
      };
    }

    if (isDeleting && typedDynamic.length === 0) {
      // Move to next sentence
      setIsDeleting(false);
      setSentenceIndex((i) => (i + 1) % phrases.length);
      return;
    }

    const id = window.setTimeout(() => {
      if (isDeleting) {
        setTypedDynamic((t) => t.slice(0, -1));
      } else {
        setTypedDynamic(current.slice(0, typedDynamic.length + 1));
      }
    }, typeDelay);

    return () => window.clearTimeout(id);
  }, [typedDynamic, isDeleting, sentenceIndex]);


  async function generateImage(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedImage || !prompt.trim()) return;

    console.log('=== GENERATE IMAGE CALLED ===');
    console.log('Selected image:', selectedImage);
    console.log('Prompt:', prompt);

    setIsGenerating(true);
    setGenerationError(null);
    setGeneratedImageUrl(null);
    setInputImageUrl(null);

    try {
      console.log('Creating FormData...');
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('prompt', prompt);
      formData.append('model', selectedModel);

      console.log('Making API call to /api/generate...');
      const res = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      console.log('API response received:', res.status, res.statusText);

      // Check if response is JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned an invalid response. Please check your environment variables.');
      }

      const data = await res.json();

      if (!res.ok) {
        const errorMessage = data.error || 'Generation failed';
        const errorDetails = data.details ? ` ${data.details}` : '';
        throw new Error(errorMessage + errorDetails);
      }

      console.log('Received URLs from API:', {
        inputImageUrl: data.inputImageUrl,
        outputImageUrl: data.outputImageUrl
      });
      
      // Test if the URLs are accessible
      if (data.inputImageUrl) {
        console.log('Testing input image URL:', data.inputImageUrl);
        console.log('Input image URL type:', typeof data.inputImageUrl);
        fetch(data.inputImageUrl, { method: 'HEAD' })
          .then(res => {
            console.log('Input image accessible:', res.status, res.statusText);
            console.log('Input image headers:', res.headers.get('content-type'));
          })
          .catch(err => console.error('Input image error:', err));
      }
      
      if (data.outputImageUrl) {
        console.log('Testing output image URL:', data.outputImageUrl);
        console.log('Output image URL type:', typeof data.outputImageUrl);
        fetch(data.outputImageUrl, { method: 'HEAD' })
          .then(res => {
            console.log('Output image accessible:', res.status, res.statusText);
            console.log('Output image headers:', res.headers.get('content-type'));
          })
          .catch(err => console.error('Output image error:', err));
      }
      
      setGeneratedImageUrl(data.outputImageUrl);
      setInputImageUrl(data.inputImageUrl);
    } catch (error) {
      console.error('Generation error:', error);
      setGenerationError(error instanceof Error ? error.message : 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      console.log('Image selected:', file.name, file.size, file.type);
      setSelectedImage(file);
      
      // Create a preview URL for immediate display
      const previewUrl = URL.createObjectURL(file);
      setInputImageUrl(previewUrl);
      
      setGenerationError(null);
      setGeneratedImageUrl(null);
    }
  }

  return (
    <div ref={ref} className="min-h-screen bg-black text-zinc-50">
      <header className="sticky top-0 z-50 isolate border-b border-white/10 bg-black" style={{ backgroundColor: "#000" }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2">
            <Image src="/jony-logo.png" alt="Renoir logo" width={24} height={24} />
            <span className="font-semibold">Renoir</span>
          </div>
          <nav className="hidden gap-6 text-sm md:flex">
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden" style={{ backgroundColor: "#000" }}>
        {/* Noise overlay for texture */}
        <div 
          className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay z-5"
          style={{
            backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140' viewBox='0 0 140 140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")",
            backgroundSize: "140px 140px"
          }}
        />
        
        {/* 3D Canvas background (above gradient, below content) */}
        <div className="pointer-events-none absolute inset-0 z-10">
          {/* Fallback black until mounted to avoid flash */}
          {!mounted && <div className="w-full h-full bg-black" />}
          {mounted && (
            <div className="block w-full h-full min-h-[420px] sm:min-h-0">
              <HeroScene />
            </div>
          )}
        </div>
        
        {/* Subtle animated aurora background with parallax (furthest back) */}
        <div className="pointer-events-none absolute inset-0 z-0">
          {/* Base dark gradient overlay (lighter to show spotlight) */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-transparent" />
          {/* Aurora layers */}
          <motion.div
            className="absolute -inset-40 rounded-[100%] bg-[radial-gradient(60%_60%_at_20%_30%,#6ee7ff44,transparent_60%)] blur-3xl"
            style={{ y: l1y }}
            animate={{ x: [-30, 10, -10, 30, -30], opacity: [0.2, 0.3, 0.25, 0.3, 0.2] }}
            transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -inset-40 rounded-[100%] bg-[radial-gradient(50%_50%_at_80%_20%,#a78bfa44,transparent_60%)] blur-3xl"
            style={{ y: l2y }}
            animate={{ x: [20, -20, 30, -10, 20], opacity: [0.15, 0.25, 0.2, 0.25, 0.15] }}
            transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -inset-40 rounded-[100%] bg-[radial-gradient(40%_40%_at_50%_70%,#22d3ee33,transparent_60%)] blur-3xl"
            style={{ y: l3y }}
            animate={{ x: [-10, 30, -20, 10, -10], opacity: [0.1, 0.2, 0.15, 0.2, 0.1] }}
            transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Soft highlight */}
          <motion.div style={{ rotate }} className="absolute -inset-52">
            <div className="size-full bg-[radial-gradient(60%_60%_at_50%_40%,rgba(255,255,255,0.08),transparent_60%)]" />
          </motion.div>
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-24 sm:pt-28 pb-16 sm:pb-20">
          {/* Full-width title block */}
          <motion.div style={{ opacity }} className="relative z-20 mx-auto max-w-3xl text-center -top-3">
            <p className="text-xs sm:text-sm uppercase tracking-[0.25em] sm:tracking-[0.3em] text-white/80">AI that <span className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">understands</span> your vision</p>
            <h1 className="mt-3 sm:mt-4 text-balance text-4xl sm:text-6xl font-semibold leading-tight sm:leading-[1.05] md:text-7xl" style={{ fontFamily: 'SentinelBlack, ui-sans-serif, system-ui' }}>
              Transform images. Instantly.
            </h1>
          </motion.div>

          {/* Auto-typed rotating sentences between title and CTA */}
          <div className="mt-6 relative -top-1">
            <div className="relative z-20">
              <div className="mx-auto max-w-4xl text-center h-16 sm:h-20 flex items-center justify-center px-1">
                <p className="text-lg sm:text-2xl text-zinc-300" style={{ fontFamily: 'SentinelMedium, ui-sans-serif, system-ui' }}>
                  <span style={{ fontFamily: 'SentinelBlack, ui-sans-serif, system-ui' }}>{staticPrefix}</span>{typedDynamic}
                  <span className="inline-block w-px translate-y-px bg-zinc-400 align-middle animate-[caret-blink_0.7s_steps(1,end)_infinite]" style={{ height: "1em" }} />
                </p>
              </div>
            </div>
          </div>

          {/* Image Generation Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative z-20 mt-12"
          >
            <div className="mx-auto max-w-4xl">
              <div className="relative">
                {/* Subtle background glow */}
                <div className="absolute inset-0 bg-white/5 rounded-3xl blur-xl -m-4" />
                <div className="relative bg-black/20 backdrop-blur-sm rounded-3xl border border-white/10 p-8">
                  <form onSubmit={generateImage} className="space-y-6">
                {/* Image Upload */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <ImageUpload
                    onImageSelect={setSelectedImage}
                    selectedImage={selectedImage}
                    disabled={isGenerating}
                  />
                </motion.div>

                {/* Model Selection - Compact Parameter */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.35 }}
                  className="flex justify-center"
                >
                  <ModelSelector
                    selectedModel={selectedModel}
                    onModelChange={setSelectedModel}
                    disabled={isGenerating}
                  />
                </motion.div>

                {/* Prompt Input */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <ChatInput
                    value={prompt}
                    onChange={setPrompt}
                    onSubmit={() => generateImage(new Event('submit') as any)}
                    placeholder='Describe what you want (e.g., "remove background", "add a big smile", "make it brighter").'
                    disabled={isGenerating}
                    isLoading={isGenerating}
                    maxLength={500}
                  />
                </motion.div>

                {/* Generate Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="flex justify-center"
                >
                  <GradientButton
                    type="submit"
                    disabled={!selectedImage || !prompt.trim() || isGenerating}
                    isLoading={isGenerating}
                    size="lg"
                    className="w-full max-w-lg shadow-2xl shadow-black/20 hover:shadow-3xl hover:shadow-black/30"
                  >
                    Generate Image
                  </GradientButton>
                </motion.div>
                  </form>
                </div>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {generationError && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    className="mt-6 p-6 bg-red-500/10 border border-red-500/30 rounded-2xl backdrop-blur-sm"
                  >
                    <p className="text-red-300 text-sm font-medium text-center mb-4">{generationError}</p>
                    {(generationError.includes('credits') || generationError.includes('unavailable')) && (
                      <div className="text-xs text-red-400 space-y-2">
                        <p>To use image generation, you need to:</p>
                        <ol className="list-decimal list-inside space-y-1">
                          <li>Add credits to your Replicate account at <a href="https://replicate.com/account/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-red-300">replicate.com/account/billing</a></li>
                          <li>Or use a different image generation service</li>
                        </ol>
                        <p className="mt-2 text-yellow-400">
                          💡 <strong>Note:</strong> Replicate requires payment to use their API, even for free models.
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Results Display */}
              <AnimatePresence>
                {(inputImageUrl || generatedImageUrl) && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.6 }}
                    className="mt-12 space-y-8"
                  >
                    <motion.h3 
                      className="text-2xl font-semibold text-white text-center" 
                      style={{ fontFamily: 'SentinelSemiBold, ui-sans-serif, system-ui' }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      Your Results
                    </motion.h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Input Image */}
                      {inputImageUrl && (
                        <motion.div 
                          className="space-y-4"
                          initial={{ opacity: 0, x: -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <h4 className="text-lg font-medium text-white/90 text-center">Original</h4>
                          <div className="relative rounded-2xl overflow-hidden border border-white/20 bg-white/5 p-2">
                            <img
                              src={inputImageUrl}
                              alt="Original"
                              className="w-full h-auto rounded-xl"
                              onError={(e) => {
                                console.error('Failed to load input image:', inputImageUrl);
                                e.currentTarget.style.display = 'none';
                                // Show URL as fallback
                                const fallback = document.createElement('div');
                                fallback.className = 'p-4 bg-gray-800 text-white text-xs break-all';
                                fallback.textContent = `Image failed to load. URL: ${inputImageUrl}`;
                                e.currentTarget.parentNode?.appendChild(fallback);
                              }}
                              onLoad={() => console.log('Input image loaded successfully')}
                            />
                            {/* Debug info */}
                            <div className="mt-2 p-2 bg-black/50 text-xs text-gray-400 break-all">
                              Debug URL: {inputImageUrl}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Generated Image */}
                      {generatedImageUrl && (
                        <motion.div 
                          className="space-y-4"
                          initial={{ opacity: 0, x: 30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 }}
                        >
                          <h4 className="text-lg font-medium text-white/90 text-center">Generated</h4>
                          <div className="relative rounded-2xl overflow-hidden border border-white/20 bg-white/5 p-2">
                            <img
                              src={generatedImageUrl}
                              alt="Generated"
                              className="w-full h-auto rounded-xl"
                              onError={(e) => {
                                console.error('Failed to load generated image:', generatedImageUrl);
                                e.currentTarget.style.display = 'none';
                                // Show URL as fallback
                                const fallback = document.createElement('div');
                                fallback.className = 'p-4 bg-gray-800 text-white text-xs break-all';
                                fallback.textContent = `Image failed to load. URL: ${generatedImageUrl}`;
                                e.currentTarget.parentNode?.appendChild(fallback);
                              }}
                              onLoad={() => console.log('Generated image loaded successfully')}
                            />
                            {/* Debug info */}
                            <div className="mt-2 p-2 bg-black/50 text-xs text-gray-400 break-all">
                              Debug URL: {generatedImageUrl}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>


        </div>

      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-12 text-[11px] sm:text-xs text-zinc-500">
          <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
            <span>© {new Date().getFullYear()} Renoir</span>
            <div className="flex gap-3 sm:gap-4">
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
