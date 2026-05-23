import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
  Req,
  Logger,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import * as multer from 'multer';

@Controller('media')
export class MediaController {
  private readonly logger = new Logger(MediaController.name);
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('images', 10, {
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
    }),
  )
  async uploadImages(@UploadedFiles() files: Express.Multer.File[], @Req() req: any) {
    this.logger.log(`media.upload invoked by user=${req.user?.id || 'unknown'} files=${files?.length || 0}`);

    try {
      const urls = await this.mediaService.uploadListingImages(files);
      this.logger.log(`media.upload succeeded user=${req.user?.id || 'unknown'} uploaded=${urls?.length || 0}`);
      return {
        message: 'Images traitées avec succès',
        urls,
      };
    } catch (err) {
      this.logger.error(`media.upload failed for user=${req.user?.id || 'unknown'} error=${(err as Error)?.message}`, (err as Error)?.stack);
      throw err;
    }
  }
}
