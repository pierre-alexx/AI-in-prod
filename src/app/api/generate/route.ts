import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

// Initialize Replicate
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

// Initialize Supabase with service role key for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  console.log('=== API ROUTE CALLED ===');
  
  try {
    // Check authenticated user via cookie-based auth
    const authClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set() {},
          remove() {},
        },
      }
    );
    const { data: userData } = await authClient.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate environment variables
    if (!process.env.REPLICATE_API_TOKEN) {
      console.error('REPLICATE_API_TOKEN is not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Supabase environment variables are not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    console.log('Environment variables validated successfully');

    const formData = await request.formData();
    const image = formData.get('image') as File;
    const prompt = formData.get('prompt') as string;
    const model = formData.get('model') as string;

    console.log('Form data received:', { 
      hasImage: !!image, 
      imageName: image?.name, 
      prompt: prompt,
      model: model
    });

    if (!image || !prompt) {
      console.log('Missing required fields:', { hasImage: !!image, hasPrompt: !!prompt });
      return NextResponse.json(
        { error: 'Image and prompt are required' },
        { status: 400 }
      );
    }

    // Use prompt as-is
    const effectivePrompt = prompt;
    console.log('Prompt:', effectivePrompt);

    // Upload image to input-images bucket (normalize EXIF orientation to avoid sideways outputs)
    console.log('Starting image upload to Supabase...');
    const rawArrayBuffer = await image.arrayBuffer();
    let uploadBytes: Buffer = Buffer.from(new Uint8Array(rawArrayBuffer));
    let uploadContentType = image.type || 'image/jpeg';
    try {
      const sharp = (await import('sharp')).default;
      // Auto-rotate based on EXIF orientation and strip orientation metadata
      let pipeline = sharp(uploadBytes).rotate();
      // If content type is unusual, normalize to JPEG to ensure broad support
      if (!/^(image\/(png|jpeg|jpg|webp))$/i.test(uploadContentType)) {
        uploadContentType = 'image/jpeg';
        pipeline = pipeline.jpeg({ quality: 95 });
      }
      uploadBytes = await pipeline.toBuffer();
    } catch (exifErr) {
      console.log('EXIF normalization skipped (sharp not available or failed):', exifErr);
    }

    const imagePath = `input/${Date.now()}-${image.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('input-images')
      .upload(imagePath, uploadBytes, {
        contentType: uploadContentType,
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload image' },
        { status: 500 }
      );
    }

    console.log('Image uploaded successfully:', uploadData);

    // Get public URL for the uploaded image
    const { data: { publicUrl } } = supabase.storage
      .from('input-images')
      .getPublicUrl(imagePath);

    // Call Replicate API
    let output: any;
    try {
      // Use the selected model or default to SDXL
      const selectedModel = model || "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b";
      
      console.log('Calling Replicate API with:', {
        model: selectedModel,
        prompt: effectivePrompt,
        publicUrl: publicUrl
      });
      
      // Call the selected model with appropriate parameters
      console.log('Selected model for processing:', selectedModel);
      
      if (selectedModel.includes("black-forest-labs/flux-kontext-dev")) {
        // Flux Kontext (image editing) - send input_image with aspect ratio preservation
        console.log('Using Flux Kontext (image editing)');
        
        // Get input image dimensions to preserve aspect ratio
        let width = 1024;
        let height = 1024;
        try {
          const imgResponse = await fetch(publicUrl);
          if (imgResponse.ok) {
            const imgBuffer = await imgResponse.arrayBuffer();
            const img = await import('sharp').then(sharp => sharp.default(imgBuffer));
            const metadata = await img.metadata();
            if (metadata.width && metadata.height) {
              // Calculate dimensions that maintain aspect ratio, max 1024px
              const maxSize = 1024;
              const aspectRatio = metadata.width / metadata.height;
              if (aspectRatio > 1) {
                width = maxSize;
                height = Math.round(maxSize / aspectRatio);
              } else {
                height = maxSize;
                width = Math.round(maxSize * aspectRatio);
              }
              console.log('Input image dimensions:', metadata.width, 'x', metadata.height);
              console.log('Output dimensions:', width, 'x', height);
            }
          }
        } catch (dimensionError) {
          console.log('Could not get image dimensions, using default 1024x1024:', dimensionError);
        }
        
        output = await replicate.run("black-forest-labs/flux-kontext-dev" as any, {
          input: {
            prompt: effectivePrompt,
            input_image: publicUrl,
            output_format: "jpg",
            num_inference_steps: 30,
            width: width,
            height: height
          }
        });
      } else if (selectedModel.includes("google/nano-banana")) {
        // Google Nano Banana supports image_input (array) and prompt
        console.log('Using Google Nano Banana');
        const imageInputs = publicUrl ? [publicUrl] : [];
        output = await replicate.run("google/nano-banana" as any, {
          input: {
            prompt: effectivePrompt,
            image_input: imageInputs
          }
        });
        // No fallback here; we want to ensure we only show Nano Banana output
      } else {
        return NextResponse.json({ error: 'Unsupported model selected' }, { status: 400 });
      }
      
      console.log('Replicate run response:', output);
    console.log('Output type:', typeof output);
    console.log('Output is array:', Array.isArray(output));
    if (Array.isArray(output)) {
      console.log('Output length:', output.length);
      output.forEach((item, index) => {
        console.log(`Output[${index}]:`, item, 'Type:', typeof item);
      });
    }
    } catch (replicateError: any) {
      console.error('Replicate API error:', replicateError);
      console.error('Error details:', {
        message: replicateError.message,
        status: replicateError.status,
        response: replicateError.response,
        body: replicateError.body
      });
      
      // Check if it's a billing/credits issue
      if (replicateError.status === 422 || replicateError.status === 402) {
        return NextResponse.json(
          { 
            error: 'Replicate API requires credits. Please add credits to your Replicate account or use a different image generation service.',
            details: 'The Replicate API requires payment to use. You can add credits at https://replicate.com/account/billing'
          },
          { status: 402 }
        );
      }
      
      // For other Replicate errors, provide a fallback option
      return NextResponse.json(
        { 
          error: 'Image generation service unavailable', 
          details: `Replicate API error: ${replicateError.message || 'Unknown error'}. Please add credits to your Replicate account or try again later.`,
          fallback: 'You can add credits at https://replicate.com/account/billing to use the image generation feature.',
          debug: {
            status: replicateError.status,
            message: replicateError.message,
            fullError: JSON.stringify(replicateError, null, 2)
          }
        },
        { status: 503 }
      );
    }

    // Helper: recursively find first URL-like string in any structure
    function findFirstUrl(value: any, depth = 0): string | null {
      if (depth > 6 || value == null) return null;
      if (typeof value === 'string') {
        // Accept http(s) URLs and data URLs for images
        if (/^https?:\/\//.test(value)) return value;
        if (/^data:image\//.test(value)) return value;
        return null;
      }
      if (Array.isArray(value)) {
        for (const v of value) {
          const url = findFirstUrl(v, depth + 1);
          if (url) return url;
        }
        return null;
      }
      if (typeof value === 'object') {
        // Common keys some models use
        const preferredKeys = [
          'url', 'image', 'image_url', 'asset_url', 'uri', 'file',
          'output', 'outputs', 'images', 'result', 'results', 'data', 'content', 'path'
        ];
        for (const key of preferredKeys) {
          if (key in value) {
            const url = findFirstUrl((value as any)[key], depth + 1);
            if (url) return url;
          }
        }
        // Fallback: scan all values
        for (const v of Object.values(value)) {
          const url = findFirstUrl(v, depth + 1);
          if (url) return url;
        }
      }
      return null;
    }

    if (!output) {
      return NextResponse.json(
        { error: 'No output generated from Replicate (empty response)' },
        { status: 500 }
      );
    }

    // Get the generated image URL from the output
    let generatedImageUrl: string | null = null;
    
    if (Array.isArray(output) && output.length > 0) {
      const firstOutput = output[0];
      
      // Check if it's a ReadableStream
      if (firstOutput && typeof firstOutput === 'object' && 'getReader' in firstOutput) {
        console.log('Reading ReadableStream from Replicate...');
        const reader = firstOutput.getReader();
        const chunks = [];
        
        // Read all chunks from the stream
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }
        reader.releaseLock();
        
        // Combine chunks and convert to blob URL
        const imageData = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
        let offset = 0;
        for (const chunk of chunks) {
          imageData.set(chunk, offset);
          offset += chunk.length;
        }
        
        // Upload the image data to Supabase storage
        console.log('Uploading generated image to Supabase output-images bucket...');
        const outputImagePath = `output/${Date.now()}-generated.png`;
        
        // Test bucket access first
        try {
          const { data: buckets, error: listError } = await supabase.storage.listBuckets();
          console.log('Available buckets:', buckets?.map(b => b.name));
          if (listError) {
            console.error('Error listing buckets:', listError);
          }
        } catch (listErr) {
          console.error('Error accessing storage:', listErr);
        }
        
        // Try output-images first, fallback to input-images if it fails
        let uploadError = null;
        let bucketName = 'output-images';
        
        const { error: outputUploadError } = await supabase.storage
          .from('output-images')
          .upload(outputImagePath, imageData, {
            contentType: 'image/png',
            upsert: false
          });
        
        if (outputUploadError) {
          console.log('Output bucket failed, trying input bucket:', outputUploadError.message);
          bucketName = 'input-images';
          const { error: inputUploadError } = await supabase.storage
            .from('input-images')
            .upload(outputImagePath, imageData, {
              contentType: 'image/png',
              upsert: false
            });
          uploadError = inputUploadError;
        } else {
          uploadError = outputUploadError;
        }

        if (uploadError) {
          console.error('Upload error:', uploadError);
          return NextResponse.json(
            { 
              error: 'Failed to upload generated image',
              details: uploadError.message,
              bucket: bucketName
            },
            { status: 500 }
          );
        }

        // Get public URL for the generated image
        const { data: { publicUrl: outputPublicUrl } } = supabase.storage
          .from(bucketName)
          .getPublicUrl(outputImagePath);
        
        generatedImageUrl = outputPublicUrl;
        console.log('Generated image uploaded successfully:', outputPublicUrl);
        
        // Test the URL accessibility
        try {
          const testResponse = await fetch(outputPublicUrl, { method: 'HEAD' });
          console.log('Generated image URL test:', testResponse.status, testResponse.statusText);
          if (!testResponse.ok) {
            console.error('Generated image URL not accessible:', testResponse.status);
          }
        } catch (testError) {
          console.error('Error testing generated image URL:', testError);
        }
      } else if (typeof firstOutput === 'string') {
        generatedImageUrl = firstOutput;
      } else {
        // Try to discover a URL recursively from the array contents
        generatedImageUrl = findFirstUrl(output);
      }
    } else if (output && typeof (output as any).url === 'function') {
      try {
        generatedImageUrl = await (output as any).url();
      } catch (e) {
        console.error('Failed to call output.url()', e);
      }
    } else if (typeof output === 'string') {
      generatedImageUrl = output;
    } else if (output && typeof output === 'object' && 'url' in output) {
      generatedImageUrl = (output as any).url;
    } else {
      // Last attempt: search entire structure for a URL
      generatedImageUrl = findFirstUrl(output);
    }
    
    if (!generatedImageUrl) {
      console.error('No URL found in Replicate output. Sample:', JSON.stringify(output)?.slice(0, 500));
      return NextResponse.json(
        { 
          error: 'No image URL returned from Replicate',
          details: 'Replicate returned a response without a direct URL. Please check your Replicate run for details.',
        },
        { status: 500 }
      );
    }

    console.log('Generated image URL from Replicate:', generatedImageUrl);

    // Persist the generated image into Supabase so we always serve from our bucket
    let outputPublicUrl = generatedImageUrl;
    try {
      const filename = `output/${Date.now()}-generated`;
      let bytes: ArrayBuffer | null = null;
      let contentType = 'image/png';

      if (/^https?:\/\//.test(generatedImageUrl)) {
        const resp = await fetch(generatedImageUrl);
        if (resp.ok) {
          bytes = await resp.arrayBuffer();
          const ct = resp.headers.get('content-type');
          if (ct) contentType = ct;
        }
      } else if (/^data:image\//.test(generatedImageUrl)) {
        const match = generatedImageUrl.match(/^data:(.*?);base64,(.*)$/);
        if (match) {
          contentType = match[1] || contentType;
          const b64 = match[2];
          const bin = Buffer.from(b64, 'base64');
          bytes = bin.buffer.slice(bin.byteOffset, bin.byteOffset + bin.byteLength);
        }
      }

      if (bytes) {
        let bucketName = 'output-images';
        const outputKey = `${filename}.${contentType.includes('jpeg') ? 'jpg' : contentType.includes('png') ? 'png' : 'webp'}`;
        const { error: upErr } = await supabase.storage
          .from(bucketName)
          .upload(outputKey, bytes, { contentType, upsert: false });
        if (upErr) {
          console.log('Primary output upload failed, falling back to input-images:', upErr.message);
          bucketName = 'input-images';
          const { error: upErr2 } = await supabase.storage
            .from(bucketName)
            .upload(outputKey, bytes, { contentType, upsert: false });
          if (!upErr2) {
            const { data: { publicUrl: finalUrl } } = supabase.storage.from(bucketName).getPublicUrl(outputKey);
            outputPublicUrl = finalUrl;
          }
        } else {
          const { data: { publicUrl: finalUrl } } = supabase.storage.from(bucketName).getPublicUrl(outputKey);
          outputPublicUrl = finalUrl;
        }
      }
    } catch (persistErr) {
      console.error('Failed to persist generated image; returning original URL instead:', persistErr);
    }

    // Save to projects table
    const { error: dbError } = await supabase
      .from('projects')
      .insert({
        input_image_url: publicUrl,
        output_image_url: outputPublicUrl,
        prompt: prompt, // Save original prompt, not sanitized
        status: 'completed',
        user_id: userId,
      });

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save project' },
        { status: 500 }
      );
    }

    console.log('Returning URLs:', {
      inputImageUrl: publicUrl,
      outputImageUrl: outputPublicUrl
    });

    return NextResponse.json({
      success: true,
      outputImageUrl: outputPublicUrl,
      inputImageUrl: publicUrl,
      // Debug helpers (safe: truncated)
      modelUsed: (typeof model === 'string' ? model : 'unknown'),
      outputSample: (() => {
        try { return typeof output === 'string' ? output.slice(0, 300) : JSON.stringify(output)?.slice(0, 300); } catch { return null; }
      })()
    });

  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}