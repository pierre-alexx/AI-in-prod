import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    // Fetch project to know file paths
    const { data: project, error: fetchErr } = await supabase
      .from('projects')
      .select('id,input_image_url,output_image_url')
      .eq('id', id)
      .single();
    if (fetchErr || !project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Delete DB row (RLS should restrict; we use service role to enforce app logic)
    const { error: delErr } = await supabase.from('projects').delete().eq('id', id);
    if (delErr) return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });

    // Best effort: remove files if they are in our buckets
    const tryRemove = async (url: string | null, bucket: 'input-images' | 'output-images') => {
      if (!url) return;
      try {
        const u = new URL(url);
        const key = u.pathname.split(`/${bucket}/`)[1];
        if (!key) return;
        await supabase.storage.from(bucket).remove([key]);
      } catch {}
    };

    await tryRemove(project.input_image_url, 'input-images');
    await tryRemove(project.output_image_url, 'output-images');

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}












