import { Module } from '@nestjs/common';
import { MediaService } from './media.service';

import { StorageModule } from '../storage/storage.module';
import { MediaController } from './media.controller';

@Module({
  imports: [StorageModule],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
