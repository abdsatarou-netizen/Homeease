import { Controller, Get, Param, Patch, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private service: NotificationsService) {}

  @Get()
  list(@Request() req) {
    return this.service.list(req.user.userId);
  }

  @Patch(':id/read')
  markRead(@Request() req, @Param('id') id: string) {
    return this.service.markRead(req.user.userId, id);
  }

  @Patch('read-all')
  markAllRead(@Request() req) {
    return this.service.markAllRead(req.user.userId);
  }
}
