import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { PaymentProvider, PaymentStatus, Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private service: PaymentsService) {}

  @Post('initiate')
  @UseGuards(JwtAuthGuard)
  initiate(@Request() req, @Body() body: { bookingId: string; amount: number; provider: PaymentProvider }) {
    return this.service.initiate(req.user.userId, body.bookingId, body.amount, body.provider);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  mine(@Request() req) {
    return this.service.listMine(req.user.userId);
  }

  // Webhook du prestataire de paiement — pas de JwtAuthGuard (appelé par un
  // serveur externe) ; à protéger par vérification de signature dès
  // l'intégration réelle de Kkiapay / MTN MoMo.
  @Post('webhook')
  webhook(@Body() body: { transactionReference: string; status: PaymentStatus }) {
    return this.service.confirmByReference(body.transactionReference, body.status);
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  listAll() {
    return this.service.listAll();
  }
}
