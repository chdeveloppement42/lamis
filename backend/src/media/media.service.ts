import { Injectable } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MediaService {
  constructor(private readonly storageService: StorageService) {}

  /**
   * Receives an array of multer files (memory storage), processes them, and saves them.
   * Processes include: watermarking, resizing, and WebP conversion via StorageService.
   * @param files Multer files array
   * @returns Array of public file URLs
   */
  async uploadListingImages(files: Express.Multer.File[]): Promise<string[]> {
    if (!files || files.length === 0) return [];

    const uploadPromises = files.map(async (file) => {
      // Generate unique filename base
      const filename = `${uuidv4()}`;

      // Save with watermark (handles resize/webp/watermark)
      const fileUrl = await this.storageService.saveWatermarked(
        file.buffer,
        filename,
      );

      return fileUrl;
    });

    return Promise.all(uploadPromises);
  }
}
