import {
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly uploadDir: string;
  private readonly provider: string;

  constructor(private config: ConfigService) {
    this.uploadDir = this.config.get<string>('UPLOAD_DIR', './uploads');
    this.provider = this.config.get<string>('STORAGE_PROVIDER', 'disk');
  }

  onModuleInit() {
    if (this.provider === 'cloudinary') {
      cloudinary.config({
        cloud_name: this.config.getOrThrow<string>('CLOUDINARY_CLOUD_NAME'),
        api_key: this.config.getOrThrow<string>('CLOUDINARY_API_KEY'),
        api_secret: this.config.getOrThrow<string>('CLOUDINARY_API_SECRET'),
      });
    } else {
      if (!fs.existsSync(this.uploadDir)) {
        fs.mkdirSync(this.uploadDir, { recursive: true });
      }
    }
  }

  // Watermarks the image with Sharp then stores it via the configured provider.
  // Returns a public URL.
  async saveWatermarked(fileBuffer: Buffer, filename: string): Promise<string> {
    try {
      // Scale watermark proportionally to the final image width to avoid Sharp's
      // "composite must have same dimensions or smaller" constraint.
      const { width: origWidth = 800 } = await sharp(fileBuffer).metadata();
      const finalWidth = Math.min(origWidth, 1920);
      const wmarkWidth = Math.round(finalWidth * 0.55);
      const wmarkHeight = Math.round(wmarkWidth * 0.2);
      const fontSize = Math.round(wmarkWidth * 0.12);

      const svgWatermark = `
        <svg width="${wmarkWidth}" height="${wmarkHeight}">
          <style>
            .text { fill: white; fill-opacity: 0.5; font-size: ${fontSize}px; font-family: sans-serif; font-weight: bold; }
          </style>
          <text x="50%" y="60%" text-anchor="middle" dominant-baseline="middle" class="text">IMMO LAMIS</text>
        </svg>
      `;

      const processed = await sharp(fileBuffer)
        .resize(1920, null, { withoutEnlargement: true })
        .webp({ quality: 80 })
        .composite([{ input: Buffer.from(svgWatermark), gravity: 'center' }])
        .toBuffer();

      const webpFilename = filename.replace(/\.[^/.]+$/, '') + '.webp';

      if (this.provider === 'cloudinary') {
        // Strip extension from public_id — Cloudinary appends its own
        const publicId = `listings/${webpFilename.replace(/\.[^/.]+$/, '')}`;
        return this.uploadToCloudinary(processed, publicId);
      }

      return this.saveToDisk(processed, webpFilename);
    } catch (error) {
      this.logger.error(
        `saveWatermarked failed: ${(error as Error)?.message}`,
        (error as Error)?.stack,
      );
      throw new InternalServerErrorException(
        "Erreur lors du traitement de l'image",
      );
    }
  }

  // Documents always stay on local disk — they are private admin-only files.
  async saveFile(buffer: Buffer, filename: string): Promise<string> {
    const docDir = path.join(this.uploadDir, 'documents');
    if (!fs.existsSync(docDir)) {
      fs.mkdirSync(docDir, { recursive: true });
    }
    const filePath = path.join(docDir, filename);
    try {
      await fs.promises.writeFile(filePath, buffer);
      const publicPath = this.uploadDir.startsWith('.')
        ? this.uploadDir.substring(1)
        : this.uploadDir;
      return `${publicPath}/documents/${filename}`;
    } catch {
      throw new InternalServerErrorException(
        'Erreur lors de la sauvegarde du document',
      );
    }
  }

  async deleteFile(filepath: string): Promise<void> {
    try {
      if (filepath.startsWith('https://res.cloudinary.com')) {
        await this.deleteFromCloudinary(filepath);
      } else {
        const filename = path.basename(filepath);
        const fullPath = path.join(this.uploadDir, filename);
        if (fs.existsSync(fullPath)) {
          await fs.promises.unlink(fullPath);
        }
      }
    } catch {}
  }

  private async saveToDisk(buffer: Buffer, filename: string): Promise<string> {
    const filePath = path.join(this.uploadDir, filename);
    await fs.promises.writeFile(filePath, buffer);
    const publicPath = this.uploadDir.startsWith('.')
      ? this.uploadDir.substring(1)
      : this.uploadDir;
    return `${publicPath}/${filename}`;
  }

  private uploadToCloudinary(
    buffer: Buffer,
    publicId: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { public_id: publicId, resource_type: 'image', overwrite: true },
        (error: any, result: any) => {
          if (error || !result)
            return reject(error ?? new Error('Cloudinary upload failed'));
          resolve(result.secure_url);
        },
      );
      stream.end(buffer);
    });
  }

  private async deleteFromCloudinary(url: string): Promise<void> {
    // Extract public_id from: https://res.cloudinary.com/{cloud}/image/upload/v{ver}/{public_id}.{ext}
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/);
    if (match) {
      await cloudinary.uploader.destroy(match[1]);
    }
  }
}
