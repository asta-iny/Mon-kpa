import { createHash } from 'node:crypto';
import { v2 as cloudinary } from 'cloudinary';
import { getEnv } from '../../config/env.js';
import { MediaProviderError, classifyCloudinaryError } from './cloudinary.errors.js';

export interface SignedUploadParams {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
}

export interface MediaProvider {
  isConfigured(): boolean;
  createSignedUpload(folder: string): SignedUploadParams;
  deleteByPublicId(publicId: string): Promise<{ result: string }>;
}

export class CloudinaryMediaProvider implements MediaProvider {
  isConfigured(): boolean {
    const env = getEnv();
    return Boolean(
      env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET,
    );
  }

  private ensureConfigured(): void {
    if (!this.isConfigured()) {
      throw new MediaProviderError(
        'not_configured',
        'Cloudinary credentials are not configured on the server',
      );
    }
    const env = getEnv();
    const cloudName = env.CLOUDINARY_CLOUD_NAME;
    const apiKey = env.CLOUDINARY_API_KEY;
    const apiSecret = env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) {
      throw new MediaProviderError(
        'not_configured',
        'Cloudinary credentials are not configured on the server',
      );
    }
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
  }

  createSignedUpload(folder: string): SignedUploadParams {
    this.ensureConfigured();
    const env = getEnv();
    const cloudName = env.CLOUDINARY_CLOUD_NAME;
    const apiKey = env.CLOUDINARY_API_KEY;
    const apiSecret = env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) {
      throw new MediaProviderError(
        'not_configured',
        'Cloudinary credentials are not configured on the server',
      );
    }
    const timestamp = Math.floor(Date.now() / 1000);
    const toSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = createHash('sha1').update(toSign).digest('hex');
    return {
      cloudName,
      apiKey,
      timestamp,
      folder,
      signature,
    };
  }

  async deleteByPublicId(publicId: string): Promise<{ result: string }> {
    this.ensureConfigured();
    try {
      const result = (await cloudinary.uploader.destroy(publicId)) as { result: string };
      return { result: result.result };
    } catch (err) {
      throw new MediaProviderError(classifyCloudinaryError(err), 'Cloudinary delete failed', err);
    }
  }
}

/** Cleanup contract: enqueue or call delete; retryable failures may be re-queued (BullMQ Phase follow-up). */
export interface MediaCleanupJob {
  publicId: string;
  attempt: number;
  maxAttempts: number;
}

export function shouldRetryCleanup(err: MediaProviderError, job: MediaCleanupJob): boolean {
  return err.kind === 'retryable' && job.attempt < job.maxAttempts;
}
