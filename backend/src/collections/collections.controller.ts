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
  ForbiddenException,
} from '@nestjs/common';
import { CollectionsService } from './collections.service.js';
import { CreateCollectionDto } from './dto/create-collection.dto.js';
import { UpdateCollectionDto } from './dto/update-collection.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CollectionItemsService } from '../collection-items/collection-items.service.js';
import { CreateCollectionItemDto } from '../collection-items/dto/create-collection-item.dto.js';
import {
  canViewCollection,
  canEditCollection,
  canDeleteCollection,
  canManageMembers,
} from '../lib/permissions/collection.permissions.js';

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

  @Get('marketplace')
  getMarketplace() {
    return this.collectionsService.getMarketplace();
  }

  @Get('mine')
  getMyCollections(@Request() req: { user: { id: string } }) {
    return this.collectionsService.getMyCollections(req.user.id);
  }

  @Get('shared')
  getSharedCollections(@Request() req: { user: { id: string } }) {
    return this.collectionsService.getSharedCollections(req.user.id);
  }

  @Get('saved')
  findSaved(@Request() req: { user: { id: string } }) {
    return this.collectionsService.findSaved(req.user.id);
  }

  @Get(':id')
  async findOne(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
  ) {
    const collection = await this.collectionsService.findOne(id);
    if (!canViewCollection(collection, req.user.id)) {
      throw new ForbiddenException(
        'You do not have permission to view this collection',
      );
    }
    return collection;
  }

  @Patch(':id')
  async update(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() updateCollectionDto: UpdateCollectionDto,
  ) {
    const collection = await this.collectionsService.findOne(id);
    if (!canEditCollection(collection, req.user.id)) {
      throw new ForbiddenException(
        'You do not have permission to update this collection',
      );
    }
    return this.collectionsService.update(id, updateCollectionDto);
  }

  @Delete(':id')
  async remove(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
  ) {
    const collection = await this.collectionsService.findOne(id);
    if (!canDeleteCollection(collection, req.user.id)) {
      throw new ForbiddenException('Only the owner can delete this collection');
    }
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
  async invite(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Body('email') email: string,
  ) {
    const collection = await this.collectionsService.findOne(id);
    if (!canManageMembers(collection, req.user.id)) {
      throw new ForbiddenException(
        'You do not have permission to invite members',
      );
    }
    return this.collectionsService.invite(id, email);
  }

  @Post(':id/share')
  async share(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Body('email') email: string,
  ) {
    const collection = await this.collectionsService.findOne(id);
    if (!canManageMembers(collection, req.user.id)) {
      throw new ForbiddenException(
        'You do not have permission to share this collection',
      );
    }
    return this.collectionsService.invite(id, email);
  }

  @Post(':id/items')
  async createItem(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() createCollectionItemDto: CreateCollectionItemDto,
  ) {
    const collection = await this.collectionsService.findOne(id);
    if (!canEditCollection(collection, req.user.id)) {
      throw new ForbiddenException(
        'You do not have permission to add items to this collection',
      );
    }
    return this.collectionItemsService.create(id, createCollectionItemDto);
  }
}
