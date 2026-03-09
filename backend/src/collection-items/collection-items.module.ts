import { Module } from '@nestjs/common';
import { CollectionItemsService } from './collection-items.service.js';
import { CollectionItemsController } from './collection-items.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [CollectionItemsController],
  providers: [CollectionItemsService],
  exports: [CollectionItemsService],
})
export class CollectionItemsModule {}
