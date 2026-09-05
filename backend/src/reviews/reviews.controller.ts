import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private service: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Request() req,
    @Body() body: { targetId: string; propertyId?: string; bookingId?: string; rating: number; comment?: string },
  ) {
    return this.service.create(req.user.userId, body);
  }

  @Get('user/:userId')
  forTarget(@Param('userId') userId: string) {
    return this.service.forTarget(userId);
  }

  @Get('property/:propertyId')
  forProperty(@Param('propertyId') propertyId: string) {
    return this.service.forProperty(propertyId);
  }
}
