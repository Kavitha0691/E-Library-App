import { NextRequest, NextResponse } from 'next/server';
import { supabase, STORAGE_BUCKET, COVERS_BUCKET } from '@/lib/supabase';
import { verifyStorageSetup, verifyFileAccess } from '@/lib/storageHelpers';

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Upload API called');
    console.log('🔧 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('🔧 Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    // Verify storage setup first (non-blocking warning only)
    console.log('🔍 Verifying storage configuration...');
    try {
      const storageCheck = await verifyStorageSetup();

      if (!storageCheck.isReady) {
        console.warn('⚠️ Storage may not be fully configured:', storageCheck.message);
        console.warn('⚠️ Continuing with upload, but files may not be accessible');
      } else {
        console.log('✅ Storage configuration verified');
      }
    } catch (verifyError: any) {
      console.error('⚠️ Storage verification failed:', verifyError.message);
      console.log('⚠️ Continuing with upload anyway...');
    }

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

    // Verify file is accessible (non-blocking)
    let isAccessible = false;
    try {
      console.log('🔍 Verifying file accessibility...');
      isAccessible = await verifyFileAccess(fileUrl);

      if (!isAccessible) {
        console.warn('⚠️ File uploaded but not publicly accessible!');
        console.warn('This usually means the bucket is not public or policies are missing.');
      } else {
        console.log('✅ File is publicly accessible');
      }
    } catch (accessError: any) {
      console.warn('⚠️ Could not verify file accessibility:', accessError.message);
    }

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

        // Verify cover is accessible (non-blocking)
        try {
          console.log('🔍 Verifying cover accessibility...');
          const isCoverAccessible = await verifyFileAccess(coverUrl);

          if (!isCoverAccessible) {
            console.warn('⚠️ Cover uploaded but not publicly accessible!');
          } else {
            console.log('✅ Cover is publicly accessible');
          }
        } catch (coverAccessError: any) {
          console.warn('⚠️ Could not verify cover accessibility:', coverAccessError.message);
        }
      } else {
        console.error('⚠️ Cover upload failed:', coverError);
      }
    }

    const response = {
      fileUrl,
      fileName,
      coverUrl,
      fileSize: file.size,
      warnings: !isAccessible
        ? ['Files uploaded but may not be publicly accessible. Please check your storage bucket settings in Supabase Dashboard. See STORAGE_TROUBLESHOOTING.md for help.']
        : undefined,
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
