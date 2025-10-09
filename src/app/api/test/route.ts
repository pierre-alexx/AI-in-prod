import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Test endpoint to verify model selection functionality
  const models = [
    {
      id: "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      name: "SDXL",
      description: "High-quality, versatile image generation"
    },
    {
      id: "black-forest-labs/flux-schnell",
      name: "Flux Schnell", 
      description: "Ultra-fast image generation"
    },
    {
      id: "ideogram-ai/ideogram-v3-turbo",
      name: "Ideogram V3 Turbo",
      description: "Excellent for text in images"
    },
    {
      id: "recraft-ai/recraft-v3-svg",
      name: "Recraft V3 SVG",
      description: "Vector graphics and icons"
    },
    {
      id: "bytedance/seedream-3",
      name: "Seedream 3",
      description: "Best overall quality and prompt adherence"
    }
  ];

  return NextResponse.json({
    success: true,
    message: "Model selection API is working",
    availableModels: models
  });
}

export async function POST(request: NextRequest) {
  // Test endpoint to verify model parameter is being passed correctly
  try {
    const formData = await request.formData();
    const model = formData.get('model') as string;
    const prompt = formData.get('prompt') as string;
    
    console.log('Test API received:', { model, prompt });
    
    // Simulate model detection logic
    let detectedModel = "unknown";
    if (model?.includes("flux-schnell")) {
      detectedModel = "Flux Schnell";
    } else if (model?.includes("ideogram-v3-turbo")) {
      detectedModel = "Ideogram V3 Turbo";
    } else if (model?.includes("recraft-v3-svg")) {
      detectedModel = "Recraft V3 SVG";
    } else if (model?.includes("seedream-3")) {
      detectedModel = "Seedream 3";
    } else if (model?.includes("sdxl")) {
      detectedModel = "SDXL";
    }
    
    return NextResponse.json({
      success: true,
      message: "Model parameter received successfully",
      receivedModel: model,
      detectedModel: detectedModel,
      prompt: prompt,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Failed to process model selection test",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}