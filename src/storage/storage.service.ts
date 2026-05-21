import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

type UploadObjectInput = {
  key: string;
  body: Buffer | Uint8Array | string;
  contentType?: string;
  cacheControl?: string;
};

@Injectable()
export class StorageService {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(configService: ConfigService) {
    this.bucket = configService.getOrThrow<string>('storage.bucket');
    this.publicUrl = configService.getOrThrow<string>('storage.publicUrl');
    this.client = new S3Client({
      region: configService.getOrThrow<string>('storage.region'),
      endpoint: configService.get<string>('storage.endpoint'),
      credentials: {
        accessKeyId: configService.getOrThrow<string>('storage.accessKeyId'),
        secretAccessKey: configService.getOrThrow<string>(
          'storage.secretAccessKey',
        ),
      },
    });
  }

  async uploadObject(input: UploadObjectInput) {
    this.assertConfigured();

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: input.key,
        Body: input.body,
        ContentType: input.contentType,
        CacheControl: input.cacheControl ?? 'public, max-age=31536000',
      }),
    );

    return {
      key: input.key,
      url: this.getPublicUrl(input.key),
    };
  }

  async deleteObject(key: string) {
    this.assertConfigured();
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  getPublicUrl(key: string) {
    this.assertPublicUrlConfigured();

    return `${this.publicUrl}/${key}`;
  }

  buildObjectKey(...parts: string[]) {
    return parts
      .map((part) => this.normalizeKeyPart(part))
      .filter(Boolean)
      .join('/');
  }

  private normalizeKeyPart(key: string) {
    return key.replace(/^\/+|\/+$/g, '');
  }

  private assertConfigured() {
    this.assertPublicUrlConfigured();

    if (!this.bucket) {
      throw new Error('R2_BUCKET is required.');
    }
  }

  private assertPublicUrlConfigured() {
    if (!this.publicUrl) {
      throw new Error('R2_PUBLIC_URL is required.');
    }
  }
}
