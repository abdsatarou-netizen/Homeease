import { Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FavoritesService } from './favorites.service';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @Get()
  list(@Request() req) {
    return this.favoritesService.list(req.user.userId);
  }

  @Post(':propertyId/toggle')
  toggle(@Request() req, @Param('propertyId') propertyId: string) {
    return this.favoritesService.toggle(req.user.userId, propertyId);
  }
}
