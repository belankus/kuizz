import { Module } from '@nestjs/common';
import { PingGateway } from './ping.gateway.js';

@Module({
  providers: [PingGateway],
})
export class PingModule {}
