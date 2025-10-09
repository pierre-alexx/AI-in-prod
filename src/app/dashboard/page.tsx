"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { ImageUpload } from "@/components/ui/image-upload";
import { ChatInput } from "@/components/ui/chat-input";
import { GradientButton } from "@/components/ui/gradient-button";
import { ModelSelector } from "@/components/ui/model-selector";

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
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("black-forest-labs/flux-kontext-dev");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [inputImageUrl, setInputImageUrl] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

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
    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (res.ok) setProjects((p) => p.filter((x) => x.id !== id));
  }

  if (isLoading) return <div className="p-6 text-white">Chargement...</div>;
  if (!user) return <div className="p-6 text-white">Veuillez vous connecter.</div>;

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8 text-white">
      <h1 className="text-2xl font-semibold mb-6">Mon tableau de bord</h1>

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

      <h2 className="text-xl font-semibold mt-14 mb-3">Mes projets</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {projects.map((p) => (
          <div key={p.id} className="border border-white/10 rounded p-3 space-y-2 bg-black/30">
            {p.output_image_url ? (
              <img src={p.output_image_url} alt="output" className="rounded" />
            ) : (
              <div className="text-xs text-zinc-400">En cours...</div>
            )}
            <div className="text-xs text-zinc-400 break-words">{p.prompt}</div>
            <button onClick={() => handleDelete(p.id)} className="text-xs px-2 py-1 border border-white/20 rounded">Supprimer</button>
          </div>
        ))}
      </div>
    </main>
  );
}


