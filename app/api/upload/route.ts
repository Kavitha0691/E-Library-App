import { NextRequest, NextResponse } from 'next/server';
import { supabase, STORAGE_BUCKET, COVERS_BUCKET } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const coverImage = formData.get('coverImage') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    // Upload book file
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { data: fileData, error: fileError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (fileError) {
      console.error('File upload error:', fileError);
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    // Get public URL for the uploaded file
    const { data: { publicUrl: fileUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName);

    let coverUrl: string | undefined;

    // Upload cover image if provided
    if (coverImage) {
      const coverExt = coverImage.name.split('.').pop();
      const coverFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${coverExt}`;

      const { data: coverData, error: coverError } = await supabase.storage
        .from(COVERS_BUCKET)
        .upload(coverFileName, coverImage, {
          cacheControl: '3600',
          upsert: false,
        });

      if (!coverError) {
        const { data: { publicUrl } } = supabase.storage
          .from(COVERS_BUCKET)
          .getPublicUrl(coverFileName);
        coverUrl = publicUrl;
      }
    }

    return NextResponse.json({
      fileUrl,
      fileName,
      coverUrl,
      fileSize: file.size,
    });
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: 'Failed to process upload' },
      { status: 500 }
    );
  }
}
