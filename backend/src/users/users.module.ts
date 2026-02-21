import { Module } from '@nestjs/common';
import { UsersController } from './users.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
})
export class UsersModule {}
