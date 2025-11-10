// Storage bucket verification and helper utilities

import { supabase, STORAGE_BUCKET, COVERS_BUCKET } from './supabase';

export interface StorageCheck {
  bucketExists: boolean;
  isPublic: boolean;
  canUpload: boolean;
  error?: string;
}

/**
 * Verify if a storage bucket is properly configured
 */
export async function verifyBucket(bucketName: string): Promise<StorageCheck> {
  try {
    // Try to list the bucket (this checks if it exists)
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      return {
        bucketExists: false,
        isPublic: false,
        canUpload: false,
        error: `Cannot access storage: ${listError.message}`,
      };
    }

    const bucket = buckets?.find(b => b.name === bucketName);

    if (!bucket) {
      return {
        bucketExists: false,
        isPublic: false,
        canUpload: false,
        error: `Bucket "${bucketName}" does not exist. Please create it in Supabase Dashboard.`,
      };
    }

    return {
      bucketExists: true,
      isPublic: bucket.public || false,
      canUpload: true,
    };
  } catch (error: any) {
    return {
      bucketExists: false,
      isPublic: false,
      canUpload: false,
      error: error.message,
    };
  }
}

/**
 * Check if a file URL is accessible (returns 200 OK)
 */
export async function verifyFileAccess(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Get user-friendly error message for storage issues
 */
export function getStorageErrorMessage(bucketCheck: StorageCheck, bucketName: string): string {
  if (!bucketCheck.bucketExists) {
    return `Storage bucket "${bucketName}" is not set up. Please follow the instructions in STORAGE_TROUBLESHOOTING.md to create the bucket in your Supabase dashboard.`;
  }

  if (!bucketCheck.isPublic) {
    return `Storage bucket "${bucketName}" exists but is not public. Please make it public in Supabase Dashboard → Storage → ${bucketName} → Settings → "Public bucket".`;
  }

  if (!bucketCheck.canUpload) {
    return `Cannot upload to bucket "${bucketName}". Please check your storage policies in Supabase Dashboard.`;
  }

  return bucketCheck.error || 'Unknown storage error';
}

/**
 * Verify both books and covers buckets are configured
 */
export async function verifyStorageSetup(): Promise<{
  booksBucket: StorageCheck;
  coversBucket: StorageCheck;
  isReady: boolean;
  message: string;
}> {
  const booksBucket = await verifyBucket(STORAGE_BUCKET);
  const coversBucket = await verifyBucket(COVERS_BUCKET);

  const isReady = booksBucket.bucketExists &&
                  booksBucket.isPublic &&
                  coversBucket.bucketExists &&
                  coversBucket.isPublic;

  let message = '';

  if (!isReady) {
    const issues: string[] = [];

    if (!booksBucket.bucketExists) {
      issues.push(`• Books bucket "${STORAGE_BUCKET}" needs to be created`);
    } else if (!booksBucket.isPublic) {
      issues.push(`• Books bucket "${STORAGE_BUCKET}" needs to be made public`);
    }

    if (!coversBucket.bucketExists) {
      issues.push(`• Covers bucket "${COVERS_BUCKET}" needs to be created`);
    } else if (!coversBucket.isPublic) {
      issues.push(`• Covers bucket "${COVERS_BUCKET}" needs to be made public`);
    }

    message = `Storage setup incomplete:\n${issues.join('\n')}\n\nPlease follow STORAGE_TROUBLESHOOTING.md for setup instructions.`;
  } else {
    message = 'Storage is configured correctly';
  }

  return {
    booksBucket,
    coversBucket,
    isReady,
    message,
  };
}
