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

@Controller('collection-items')
@UseGuards(JwtAuthGuard)
export class CollectionItemsController {
  constructor(
    private readonly collectionItemsService: CollectionItemsService,
  ) {}

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCollectionItemDto: UpdateCollectionItemDto,
  ) {
    return this.collectionItemsService.update(id, updateCollectionItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.collectionItemsService.remove(id);
  }
}
