"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { useState } from "react";

export default function Page() {
  const [prompt, setPrompt] = useState("");
  const [variants, setVariants] = useState<any[]>([]);
  const [analyzeResult, setAnalyzeResult] = useState<any | null>(null);

  async function generate() {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    setVariants(data.variants || []);
  }

  async function analyze(target: string | File) {
    const form = new FormData();
    form.append("target", target instanceof File ? target : String(target));
    const res = await fetch("/api/improve/analyze", { method: "POST", body: form });
    const data = await res.json();
    setAnalyzeResult(data);
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">AI UI Design Agent</h1>
      </header>

      <Tabs.Root defaultValue="scratch">
        <Tabs.List className="inline-flex rounded-lg bg-white p-1 shadow">
          <Tabs.Trigger value="scratch" className="rounded-md px-3 py-1.5 text-sm data-[state=active]:bg-zinc-900 data-[state=active]:text-white">Scratch</Tabs.Trigger>
          <Tabs.Trigger value="improve" className="rounded-md px-3 py-1.5 text-sm data-[state=active]:bg-zinc-900 data-[state=active]:text-white">Improve</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="scratch" className="mt-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="col-span-1 space-y-3">
              <textarea
                className="w-full rounded-md border border-zinc-300 bg-white p-3 text-sm outline-none focus:border-zinc-500"
                rows={8}
                placeholder="Describe the UI you want..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <button onClick={generate} className="w-full rounded-md bg-zinc-900 px-4 py-2 text-white">Generate</button>
            </div>
            <div className="col-span-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {variants.map((v) => (
                <div key={v.id} className="overflow-hidden rounded-lg border bg-white shadow-sm">
                  <img src={v.previewUrl} alt="preview" className="aspect-video w-full object-cover" />
                  <div className="p-3 text-sm">
                    <div className="font-medium">Variant {v.id}</div>
                    <div className="mt-2 flex gap-2">
                      <button className="rounded-md border px-3 py-1">Export Code</button>
                      <button className="rounded-md border px-3 py-1">Export Figma</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Tabs.Content>

        <Tabs.Content value="improve" className="mt-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="col-span-1 space-y-3">
              <input
                type="file"
                accept=".zip"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) analyze(f);
                }}
              />
              <div className="flex items-center gap-2">
                <input className="flex-1 rounded-md border px-2 py-1" placeholder="GitHub repo URL" id="repo" />
                <button
                  className="rounded-md border px-3 py-1"
                  onClick={() => {
                    const el = document.getElementById("repo") as HTMLInputElement | null;
                    if (el?.value) analyze(el.value);
                  }}
                >Analyze</button>
              </div>
            </div>
            <div className="col-span-2">
              {!analyzeResult ? (
                <div className="rounded-lg border bg-white p-6 text-sm text-zinc-500">Upload a ZIP or provide a repo URL to analyze.</div>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-lg border bg-white p-4">
                    <div className="text-sm font-medium">Tokens</div>
                    <pre className="mt-2 text-xs">{JSON.stringify(analyzeResult.tokens, null, 2)}</pre>
                  </div>
                  <div className="rounded-lg border bg-white p-4">
                    <div className="text-sm font-medium">WCAG</div>
                    <pre className="mt-2 text-xs">{JSON.stringify(analyzeResult.wcag, null, 2)}</pre>
                  </div>
                  <div className="rounded-lg border bg-white p-4">
                    <div className="text-sm font-medium">Enhancement Packs</div>
                    <div className="mt-2 flex flex-wrap gap-2 text-sm">
                      {analyzeResult.enhancementPacks?.map((p: string) => (
                        <button key={p} className="rounded-md border px-3 py-1">{p}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
