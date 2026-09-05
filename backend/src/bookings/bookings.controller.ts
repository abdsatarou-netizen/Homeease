import { Body, Controller, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BookingsService } from './bookings.service';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private service: BookingsService) {}

  @Post()
  create(
    @Request() req,
    @Body() body: { propertyId: string; startDate: string; endDate?: string; guestsCount?: number },
  ) {
    return this.service.create(req.user.userId, body.propertyId, body.startDate, body.endDate, body.guestsCount);
  }

  @Get('mine')
  mine(@Request() req) {
    return this.service.listForClient(req.user.userId);
  }

  @Get('received')
  received(@Request() req) {
    return this.service.listForOwner(req.user.userId);
  }

  @Patch(':id/status')
  updateStatus(@Request() req, @Param('id') id: string, @Body('status') status: BookingStatus) {
    return this.service.updateStatus(req.user.userId, req.user.role, id, status);
  }
}
