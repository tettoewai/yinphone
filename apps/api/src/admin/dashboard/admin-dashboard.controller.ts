import { Controller, Get, UseGuards } from '@nestjs/common';

import { AdminAuthGuard } from '../../auth/admin-auth.guard.js';
import { RolesGuard } from '../../auth/roles.guard.js';
import { AdminDashboardService } from './admin-dashboard.service.js';

@Controller('admin/dashboard')
@UseGuards(AdminAuthGuard, RolesGuard)
export class AdminDashboardController {
  constructor(private readonly dashboard: AdminDashboardService) {}

  @Get()
  overview() {
    return this.dashboard.overview();
  }
}
