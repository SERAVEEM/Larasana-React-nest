import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class R2Service {
  private readonly logger = new Logger(R2Service.name);
  private readonly s3: S3Client;
  private readonly bucketName: string;
  private readonly publicUrl: string;

  constructor() {
    const accountId = process.env.R2_ACCOUNT_ID;
    this.bucketName = process.env.R2_BUCKET_NAME || 'larasana';
    this.publicUrl = process.env.R2_PUBLIC_URL || 'https://pub-f243a32e4dee45969b6714c325a336f8.r2.dev';

    this.s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
    });
  }

  /**
   * Upload a file buffer to R2 and return the public URL
   */
  async uploadFile(
    buffer: Buffer,
    filename: string,
    mimetype: string,
    folder: string = 'product',
  ): Promise<string> {
    // Create a unique key with timestamp to avoid collisions
    const timestamp = Date.now();
    const sanitizedName = filename
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .toLowerCase();
    const key = `${folder}/${timestamp}-${sanitizedName}`;

    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: buffer,
          ContentType: mimetype,
        }),
      );

      const publicUrl = `${this.publicUrl}/${key}`;
      this.logger.log(`Uploaded file to R2: ${publicUrl}`);
      return publicUrl;
    } catch (error) {
      this.logger.error(`Failed to upload to R2: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Delete a file from R2 by its key or full URL
   */
  async deleteFile(keyOrUrl: string): Promise<void> {
    // If a full URL is provided, extract the key
    let key = keyOrUrl;
    if (keyOrUrl.startsWith('http')) {
      const url = new URL(keyOrUrl);
      key = url.pathname.substring(1); // remove leading /
    }

    try {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );
      this.logger.log(`Deleted file from R2: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete from R2: ${error.message}`, error.stack);
      throw error;
    }
  }
}
