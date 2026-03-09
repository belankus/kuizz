import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CollectionsService } from './collections.service.js';
import { CreateCollectionDto } from './dto/create-collection.dto.js';
import { UpdateCollectionDto } from './dto/update-collection.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CollectionItemsService } from '../collection-items/collection-items.service.js';
import { CreateCollectionItemDto } from '../collection-items/dto/create-collection-item.dto.js';

@Controller('collections')
@UseGuards(JwtAuthGuard)
export class CollectionsController {
  constructor(
    private readonly collectionsService: CollectionsService,
    private readonly collectionItemsService: CollectionItemsService,
  ) {}

  @Post()
  create(
    @Request() req: { user: { id: string } },
    @Body() createCollectionDto: CreateCollectionDto,
  ) {
    return this.collectionsService.create(req.user.id, createCollectionDto);
  }

  @Get()
  findAll(@Request() req: { user: { id: string } }) {
    return this.collectionsService.findAll(req.user.id);
  }

  @Get('saved')
  findSaved(@Request() req: { user: { id: string } }) {
    return this.collectionsService.findSaved(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.collectionsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCollectionDto: UpdateCollectionDto,
  ) {
    return this.collectionsService.update(id, updateCollectionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.collectionsService.remove(id);
  }

  @Post(':id/save')
  toggleSave(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
  ) {
    return this.collectionsService.toggleSave(req.user.id, id);
  }

  @Post(':id/invite')
  invite(@Param('id') id: string, @Body('email') email: string) {
    return this.collectionsService.invite(id, email);
  }

  @Post(':id/items')
  createItem(
    @Param('id') id: string,
    @Body() createCollectionItemDto: CreateCollectionItemDto,
  ) {
    return this.collectionItemsService.create(id, createCollectionItemDto);
  }
}
