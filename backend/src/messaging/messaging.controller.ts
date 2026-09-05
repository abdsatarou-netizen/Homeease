import { Body, Controller, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MessagingService } from './messaging.service';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class MessagingController {
  constructor(private service: MessagingService) {}

  @Post('with/:userId')
  getOrCreate(@Request() req, @Param('userId') otherUserId: string) {
    return this.service.getOrCreateConversation(req.user.userId, otherUserId);
  }

  @Get()
  list(@Request() req) {
    return this.service.listConversations(req.user.userId);
  }

  @Get(':id/messages')
  messages(@Request() req, @Param('id') id: string) {
    return this.service.listMessages(req.user.userId, id);
  }

  @Post(':id/messages')
  send(@Request() req, @Param('id') id: string, @Body('content') content: string) {
    return this.service.sendMessage(req.user.userId, id, content);
  }

  @Patch(':id/block')
  block(@Request() req, @Param('id') id: string, @Body('blocked') blocked: boolean) {
    return this.service.setBlocked(req.user.userId, id, blocked);
  }
}
