import { NextRequest, NextResponse } from 'next/server';
import { supabase, STORAGE_BUCKET, COVERS_BUCKET } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Upload API called');
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const coverImage = formData.get('coverImage') as File | null;

    console.log('📄 File:', file?.name, file?.size);
    console.log('🖼️ Cover:', coverImage?.name);

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    // Upload book file
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    console.log('⬆️ Uploading to bucket:', STORAGE_BUCKET);
    const { data: fileData, error: fileError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (fileError) {
      console.error('❌ File upload error:', fileError);
      return NextResponse.json(
        { error: 'Failed to upload file', details: fileError.message },
        { status: 500 }
      );
    }

    console.log('✅ File uploaded:', fileData?.path);

    // Get public URL for the uploaded file
    const { data: { publicUrl: fileUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName);

    console.log('🔗 File URL:', fileUrl);

    let coverUrl: string | undefined;

    // Upload cover image if provided
    if (coverImage) {
      const coverExt = coverImage.name.split('.').pop();
      const coverFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${coverExt}`;

      console.log('⬆️ Uploading cover to bucket:', COVERS_BUCKET);
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
        console.log('✅ Cover uploaded:', coverUrl);
      } else {
        console.error('⚠️ Cover upload failed:', coverError);
      }
    }

    const response = {
      fileUrl,
      fileName,
      coverUrl,
      fileSize: file.size,
    };

    console.log('✅ Upload complete, returning:', response);
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('❌ Upload API error:', error);
    return NextResponse.json(
      { error: 'Failed to process upload', details: error.message },
      { status: 500 }
    );
  }
}
