"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { ImageUpload } from "@/components/ui/image-upload";
import { ChatInput } from "@/components/ui/chat-input";
import { GradientButton } from "@/components/ui/gradient-button";
import { ModelSelector } from "@/components/ui/model-selector";
// Subscription UI moved to Profile page

type Project = {
  id: string;
  user_id: string;
  input_image_url: string | null;
  output_image_url: string | null;
  prompt: string | null;
  created_at: string;
};

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const supabase = getSupabaseBrowserClient();
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("black-forest-labs/flux-kontext-dev");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [inputImageUrl, setInputImageUrl] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  // Subscription state is handled in Profile page
  const activeProject = activeIndex !== null && activeIndex >= 0 && activeIndex < projects.length ? projects[activeIndex] : null;
  // Keyboard handlers for modal navigation
  useEffect(() => {
    if (activeIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setActiveIndex(null);
      } else if (e.key === 'ArrowLeft') {
        setActiveIndex((i) => (i === null ? i : Math.max(0, i - 1)));
      } else if (e.key === 'ArrowRight') {
        setActiveIndex((i) => (i === null ? i : Math.min(projects.length - 1, i + 1)));
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeIndex, projects.length]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id,user_id,input_image_url,output_image_url,prompt,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (!error && data) setProjects(data as Project[]);
    };
    load();
  }, [user, supabase]);

  // Subscription fetch moved to Profile page

  async function generateImage(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedImage || !prompt.trim()) return;
    setIsGenerating(true);
    setGenerationError(null);
    setGeneratedImageUrl(null);
    setInputImageUrl(null);
    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('prompt', prompt);
      formData.append('model', selectedModel);
      const res = await fetch("/api/generate", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setGeneratedImageUrl(data.outputImageUrl);
      setInputImageUrl(data.inputImageUrl);
      // refresh list
      const { data: rows } = await supabase
        .from("projects")
        .select("id,user_id,input_image_url,output_image_url,prompt,created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (rows) setProjects(rows as Project[]);
    } catch (err: any) {
      console.error('Generation error:', err);
      setGenerationError(err?.message ?? 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleDelete(id: string) {
    if (typeof window !== 'undefined') {
      const ok = window.confirm('Delete this project permanently?');
      if (!ok) return;
    }
    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (res.ok) setProjects((p) => p.filter((x) => x.id !== id));
  }

  function formatDate(iso: string) {
    const d = new Date(iso);
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric', month: 'short', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    }).format(d);
  }

  if (isLoading) return <div className="p-6 text-white">Chargement...</div>;
  if (!user) return <div className="p-6 text-white">Veuillez vous connecter.</div>;

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8 text-white">
      <h1 className="mb-6 text-4xl sm:text-5xl md:text-6xl" style={{ fontFamily: 'SentinelBlack' }}>Dashboard</h1>
      {/* Subscription status moved to Profile */}

      {/* Image Generation Flow - same as landing */}
      <div className="relative z-20 mt-2">
        <div className="mx-auto max-w-4xl">
          <div className="relative">
            <div className="absolute inset-0 bg-white/5 rounded-3xl blur-xl -m-4" />
            <div className="relative bg-black/20 backdrop-blur-sm rounded-3xl border border-white/10 p-8">
              <form onSubmit={generateImage} className="space-y-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                  <ImageUpload onImageSelect={setSelectedImage} selectedImage={selectedImage} disabled={isGenerating} />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }} className="flex justify-center">
                  <ModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel} disabled={isGenerating} />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                  <ChatInput
                    value={prompt}
                    onChange={setPrompt}
                    onSubmit={() => generateImage(new Event('submit') as any)}
                    placeholder='Describe what you want (e.g., "remove background", "add a big smile", "make it brighter").'
                    disabled={isGenerating}
                    isLoading={isGenerating}
                    maxLength={500}
                    requireImage
                    hasImage={!!selectedImage}
                  />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }} className="flex justify-center">
                  <GradientButton type="submit" disabled={!selectedImage || !prompt.trim() || isGenerating} isLoading={isGenerating} size="lg" className="w-full max-w-lg shadow-2xl shadow-black/20 hover:shadow-3xl hover:shadow-black/30">
                    Generate Image
                  </GradientButton>
                </motion.div>
                {/* Quota message moved to Profile */}
              </form>
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {generationError && (
              <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }} className="mt-6 p-6 bg-red-500/10 border border-red-500/30 rounded-2xl backdrop-blur-sm">
                <p className="text-red-300 text-sm font-medium text-center mb-4">{generationError}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <AnimatePresence>
            {(inputImageUrl || generatedImageUrl) && (
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.6 }} className="mt-12 space-y-8">
                <motion.h3 className="text-2xl font-semibold text-white text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  Your Results
                </motion.h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {inputImageUrl && (
                    <motion.div className="space-y-4" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                      <h4 className="text-lg font-medium text-white/90 text-center">Original</h4>
                      <div className="relative rounded-2xl overflow-hidden border border-white/20 bg-white/5 p-2">
                        <img src={inputImageUrl} alt="Original" className="w-full h-auto rounded-xl" />
                        <div className="mt-2 p-2 bg-black/50 text-xs text-gray-400 break-all">Debug URL: {inputImageUrl}</div>
                      </div>
                    </motion.div>
                  )}
                  {generatedImageUrl && (
                    <motion.div className="space-y-4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                      <h4 className="text-lg font-medium text-white/90 text-center">Generated</h4>
                      <div className="relative rounded-2xl overflow-hidden border border-white/20 bg-white/5 p-2">
                        <img src={generatedImageUrl} alt="Generated" className="w-full h-auto rounded-xl" />
                        <div className="mt-2 p-2 bg-black/50 text-xs text-gray-400 break-all">Debug URL: {generatedImageUrl}</div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <h2 className="mt-14 mb-6 text-3xl sm:text-4xl" style={{ fontFamily: 'SentinelBlack' }}>My Projects</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {projects.map((p, idx) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-md shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_20px_40px_-20px_rgba(0,0,0,0.6)] hover:shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset,0_30px_60px_-20px_rgba(0,0,0,0.7)] transition-shadow"
          >
            <button
              onClick={() => setActiveIndex(idx)}
              className="block w-full text-left"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                {p.output_image_url ? (
                  <img
                    src={p.output_image_url}
                    alt="Generated"
                    className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
                    Processing…
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_10%,rgba(255,255,255,0.08),transparent_65%)] opacity-60" />
              </div>

              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] sm:text-xs text-zinc-400">{formatDate(p.created_at)}</p>
                  <div className="h-px flex-1 bg-white/10" />
                </div>
                <p className="mt-2 text-sm sm:text-[15px] text-zinc-100 line-clamp-2 break-words">
                  {p.prompt || '—'}
                </p>
              </div>
            </button>

            <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <a
                href={p.output_image_url || '#'}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1 text-[11px] text-zinc-100"
                onClick={(e) => { if (!p.output_image_url) e.preventDefault(); }}
              >
                Open
              </a>
              <button
                onClick={() => handleDelete(p.id)}
                className="rounded-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 px-3 py-1 text-[11px] text-red-200"
              >
                Delete
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {activeProject && (
          <motion.div
            key={activeProject.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setActiveIndex(null)}
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative w-full max-w-5xl max-h-[95vh] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative bg-black flex items-center justify-center" style={{ minHeight: '60vh', maxHeight: '80vh' }}>
                {activeProject.output_image_url ? (
                  <img 
                    src={activeProject.output_image_url} 
                    alt="Preview" 
                    className="max-h-full max-w-full object-contain"
                    style={{ maxHeight: '80vh' }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400 text-sm">Processing…</div>
                )}
                <button
                  onClick={() => setActiveIndex(null)}
                  className="absolute top-3 right-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1 text-[11px] text-zinc-100"
                >
                  Close
                </button>
                {activeIndex !== null && activeIndex > 0 && (
                  <button
                    onClick={() => setActiveIndex((i) => (i !== null && i > 0 ? (i - 1) : i))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1 text-[11px] text-zinc-100"
                  >
                    ← Prev
                  </button>
                )}
                {activeIndex !== null && activeIndex < projects.length - 1 && (
                  <button
                    onClick={() => setActiveIndex((i) => (i !== null && i < projects.length - 1 ? (i + 1) : i))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1 text-[11px] text-zinc-100"
                  >
                    Next →
                  </button>
                )}
              </div>
              <div className="p-5 sm:p-6 overflow-y-auto shrink-0">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-400">
                  <span>{formatDate(activeProject.created_at)}</span>
                  <span className="hidden sm:inline">•</span>
                  <a
                    className="text-zinc-200 hover:underline"
                    href={activeProject.output_image_url || '#'}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open image
                  </a>
                </div>
                <p className="mt-3 text-sm text-zinc-100 whitespace-pre-wrap break-words">
                  {activeProject.prompt || '—'}
                </p>
                <div className="mt-5 flex gap-2">
                  <button
                    onClick={() => { handleDelete(activeProject.id); setActiveIndex(null); }}
                    className="rounded-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 px-4 py-2 text-xs text-red-200"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => { if (!activeProject.prompt) return; navigator.clipboard?.writeText(activeProject.prompt); }}
                    className="rounded-full bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 text-xs text-zinc-100"
                  >
                    Copy prompt
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}


