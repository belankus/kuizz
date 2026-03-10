import { Module, forwardRef } from '@nestjs/common';
import { CollectionItemsService } from './collection-items.service.js';
import { CollectionItemsController } from './collection-items.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { CollectionsModule } from '../collections/collections.module.js';

@Module({
  imports: [PrismaModule, forwardRef(() => CollectionsModule)],
  controllers: [CollectionItemsController],
  providers: [CollectionItemsService],
  exports: [CollectionItemsService],
})
export class CollectionItemsModule {}
