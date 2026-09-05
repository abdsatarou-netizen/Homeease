import { Body, Controller, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { ViewingRequestStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ViewingRequestsService } from './viewing-requests.service';

@Controller('viewing-requests')
@UseGuards(JwtAuthGuard)
export class ViewingRequestsController {
  constructor(private service: ViewingRequestsService) {}

  @Post()
  create(@Request() req, @Body() body: { propertyId: string; requestedDate: string; message?: string }) {
    return this.service.create(req.user.userId, body.propertyId, body.requestedDate, body.message);
  }

  @Get('mine')
  mine(@Request() req) {
    return this.service.listForClient(req.user.userId);
  }

  @Get('received')
  received(@Request() req) {
    return this.service.listForOwner(req.user.userId);
  }

  @Patch(':id/respond')
  respond(@Request() req, @Param('id') id: string, @Body('status') status: ViewingRequestStatus) {
    return this.service.respond(req.user.userId, id, status);
  }
}
