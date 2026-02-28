import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class PingGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('latency_ping')
  handlePing(client: Socket, payload: { start: number }): void {
    client.emit('latency_pong', { start: payload?.start || Date.now() });
  }
}
