import { Module } from '@nestjs/common';
import { UsersController } from './users.controller.js';
import { ProfileController } from './profile.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController, ProfileController],
})
export class UsersModule {}
