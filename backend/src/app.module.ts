import { Module } from '@nestjs/common';
import { GameModule } from './game/game.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [GameModule, RedisModule],
})
export class AppModule {}
