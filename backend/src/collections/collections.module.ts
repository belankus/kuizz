import { Module } from '@nestjs/common';
import { CollectionsService } from './collections.service.js';
import { CollectionsController } from './collections.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { CollectionItemsModule } from '../collection-items/collection-items.module.js';

@Module({
  imports: [PrismaModule, CollectionItemsModule],
  controllers: [CollectionsController],
  providers: [CollectionsService],
})
export class CollectionsModule {}
