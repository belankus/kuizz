import {
  Controller,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CollectionItemsService } from './collection-items.service.js';
import { UpdateCollectionItemDto } from './dto/update-collection-item.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Request, ForbiddenException } from '@nestjs/common';
import { canEditCollection } from '../lib/permissions/collection.permissions.js';
import { CollectionsService } from '../collections/collections.service.js';

@Controller('collection-items')
@UseGuards(JwtAuthGuard)
export class CollectionItemsController {
  constructor(
    private readonly collectionItemsService: CollectionItemsService,
    private readonly collectionsService: CollectionsService,
  ) {}

  @Patch(':id')
  async update(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() updateCollectionItemDto: UpdateCollectionItemDto,
  ) {
    const item = await this.prismaItemFetch(id);
    const collection = await this.collectionsService.findOne(item.collectionId);
    if (!canEditCollection(collection, req.user.id)) {
      throw new ForbiddenException(
        'You do not have permission to edit this item',
      );
    }
    return this.collectionItemsService.update(id, updateCollectionItemDto);
  }

  @Delete(':id')
  async remove(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
  ) {
    const item = await this.prismaItemFetch(id);
    const collection = await this.collectionsService.findOne(item.collectionId);
    if (!canEditCollection(collection, req.user.id)) {
      throw new ForbiddenException(
        'You do not have permission to remove this item',
      );
    }
    return this.collectionItemsService.remove(id);
  }

  private async prismaItemFetch(id: string) {
    // This is a helper because we need collectionId.
    // Ideally this should be in the service but for brevity and direct permission check:
    const item = await this.collectionItemsService.findOne(id);
    return item;
  }
}
