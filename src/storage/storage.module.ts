import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ImageStorageService } from './image-storage.service';
import { StorageService } from './storage.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [ImageStorageService, StorageService],
  exports: [ImageStorageService, StorageService],
})
export class StorageModule {}
