import { BadRequestException, Injectable } from '@nestjs/common';
import { StorageService } from './storage.service';

type UploadImageInput = {
  file: Express.Multer.File;
  keyPrefix: string[];
  maxSizeBytes?: number;
};

const DEFAULT_MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;

@Injectable()
export class ImageStorageService {
  constructor(private readonly storageService: StorageService) {}

  async uploadImage(input: UploadImageInput) {
    this.validateImage(input.file, input.maxSizeBytes);

    const key = this.storageService.buildObjectKey(
      ...input.keyPrefix,
      this.buildFileName(input.file),
    );

    const uploadedImage = await this.storageService.uploadObject({
      key,
      body: input.file.buffer,
      contentType: input.file.mimetype,
    });

    return uploadedImage.key;
  }

  async deleteKeyIfManaged(key?: string | null) {
    if (!key || this.isExternalUrl(key)) {
      return;
    }

    await this.storageService.deleteObject(key);
  }

  getPublicUrl(keyOrUrl?: string | null) {
    if (!keyOrUrl) {
      return null;
    }

    if (this.isExternalUrl(keyOrUrl)) {
      return keyOrUrl;
    }

    return this.storageService.getPublicUrl(keyOrUrl);
  }

  private validateImage(file: Express.Multer.File, maxSizeBytes?: number) {
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('File phải là ảnh');
    }

    if (file.size > (maxSizeBytes ?? DEFAULT_MAX_IMAGE_SIZE_BYTES)) {
      throw new BadRequestException('File ảnh vượt quá dung lượng cho phép');
    }
  }

  private buildFileName(file: Express.Multer.File) {
    const extension = this.getFileExtension(file);

    return `${Date.now()}.${extension}`;
  }

  private getFileExtension(file: Express.Multer.File) {
    const extensionFromName = file.originalname.split('.').pop();
    const extensionFromMime = file.mimetype.split('/').pop();

    return (extensionFromName || extensionFromMime || 'jpg').toLowerCase();
  }

  private isExternalUrl(value: string) {
    return /^https?:\/\//i.test(value);
  }
}
