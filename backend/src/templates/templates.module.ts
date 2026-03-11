import { Module } from '@nestjs/common';
import { TemplatesService } from './templates.service.js';
import { TemplatesController } from './templates.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [TemplatesController],
  providers: [TemplatesService],
  exports: [TemplatesService],
})
export class TemplatesModule {}
