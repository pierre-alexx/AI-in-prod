export type UUID = string;

export type StyleRef = {
  id: UUID;
  userId: UUID;
  sourceType: "image" | "url";
  sourceUrl?: string;
  storagePath?: string;
  embedding: number[]; // pgvector
  createdAt: string;
};

export type StyleProfile = {
  id: UUID;
  userId: UUID;
  name: string;
  embedding: number[]; // aggregated style vector
  createdAt: string;
  updatedAt: string;
};

export type LayoutJSON = {
  sections: Array<{ type: string; [key: string]: unknown }>;
};

export type FigmaSpec = { document: unknown } | { nodes: unknown[] };

export type Variant = {
  id: UUID;
  userId?: UUID;
  styleProfileId?: UUID;
  previewUrl: string;
  layout: LayoutJSON;
  figmaSpec: FigmaSpec;
  codeUrl?: string;
  createdAt?: string;
};

export type CodePatch = {
  id: UUID;
  userId: UUID;
  projectRef?: string; // URL or name
  patchName: string;
  diff: string; // unified patch
  tokensDelta?: Record<string, unknown>;
  createdAt: string;
};

export type Feedback = {
  id: UUID;
  userId: UUID;
  variantId: UUID;
  vote: "like" | "dislike";
  comment?: string;
  createdAt: string;
};
