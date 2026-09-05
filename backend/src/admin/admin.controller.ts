import { Body, Controller, Get, Param, Patch, Query, Request, UseGuards } from '@nestjs/common';
import { ReportStatus, Role, VerificationStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
export class AdminController {
  constructor(private service: AdminService) {}

  @Get('dashboard')
  dashboard() {
    return this.service.dashboard();
  }

  @Get('reports')
  listReports(@Query('status') status?: ReportStatus) {
    return this.service.listReports(status);
  }

  @Patch('reports/:id')
  updateReport(@Param('id') id: string, @Body('status') status: ReportStatus) {
    return this.service.updateReportStatus(id, status);
  }

  @Get('verifications')
  listVerifications(@Query('status') status?: VerificationStatus) {
    return this.service.listVerifications(status);
  }

  @Patch('verifications/:id')
  decideVerification(@Request() req, @Param('id') id: string, @Body('status') status: VerificationStatus) {
    return this.service.decideVerification(req.user.userId, id, status);
  }

  @Get('settings')
  getSettings() {
    return this.service.getSettings();
  }

  @Patch('settings/:key')
  setSetting(@Param('key') key: string, @Body('value') value: string) {
    return this.service.setSetting(key, value);
  }
}
