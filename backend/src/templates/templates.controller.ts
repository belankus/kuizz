import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { TemplatesService } from './templates.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

@Controller('templates')
@UseGuards(JwtAuthGuard)
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  findAll() {
    return this.templatesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.templatesService.findOne(id);
  }

  @Post(':id/use')
  useTemplate(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.templatesService.useTemplate(id, user.id);
  }
}
