import { Controller, Post, UseInterceptors, UploadedFiles, UseGuards } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import * as multer from 'multer';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) { }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images', 10, {
    storage: multer.memoryStorage(), // NEVER store original on disk
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit for safety, frontend sends compressed anyway
    },
    fileFilter: (req: any, file: any, cb: any) => {
      if (file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
        cb(null, true);
      } else {
        cb(new Error('Format de fichier non supporté'), false);
      }
    },
  }))
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    const urls = await this.mediaService.uploadListingImages(files);
    return {
      message: 'Images traitées avec succès',
      urls
    };
  }
}
