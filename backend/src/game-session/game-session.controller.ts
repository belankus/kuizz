import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { GameSessionService } from './game-session.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

interface AuthRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@Controller('game-session')
@UseGuards(JwtAuthGuard)
export class GameSessionController {
  constructor(private readonly gameSessionService: GameSessionService) {}

  @Get()
  async findAll(
    @Req() req: AuthRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const hostId = req.user.id;
    return this.gameSessionService.findAllPaginated(
      hostId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      search,
    );
  }

  @Get(':id/stats')
  async getStats(@Req() req: AuthRequest, @Param('id') id: string) {
    const hostId = req.user.id;
    return this.gameSessionService.getStats(id, hostId);
  }

  @Delete(':id')
  async delete(@Req() req: AuthRequest, @Param('id') id: string) {
    const hostId = req.user.id;
    await this.gameSessionService.delete(id, hostId);
    return { success: true };
  }

  @Get(':id/players/:playerId')
  async getPlayerDetail(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Param('playerId') playerId: string,
  ) {
    const hostId = req.user.id;
    return await this.gameSessionService.getPlayerDetail(id, playerId, hostId);
  }
}
