import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';
import { AdminCategoriesController } from './categories/admin-categories.controller.js';
import { AdminCategoriesService } from './categories/admin-categories.service.js';
import { AdminChannelsController } from './channels/admin-channels.controller.js';
import { AdminChannelsService } from './channels/admin-channels.service.js';
import { AdminDashboardController } from './dashboard/admin-dashboard.controller.js';
import { AdminDashboardService } from './dashboard/admin-dashboard.service.js';
import { AdminOrdersController } from './orders/admin-orders.controller.js';
import { AdminOrdersService } from './orders/admin-orders.service.js';
import { AdminProductsController } from './products/admin-products.controller.js';
import { AdminProductsService } from './products/admin-products.service.js';
import { AdminStaffController } from './staff/admin-staff.controller.js';
import { AdminStaffService } from './staff/admin-staff.service.js';

/**
 * The guarded admin surface under `/api/admin/*`. Imports `AuthModule` for
 * `AdminAuthGuard`/`RolesGuard`; `PrismaModule` is global. Service methods are
 * setup stubs (501) until the implementation phase.
 */
@Module({
  imports: [AuthModule],
  controllers: [
    AdminDashboardController,
    AdminOrdersController,
    AdminProductsController,
    AdminCategoriesController,
    AdminChannelsController,
    AdminStaffController,
  ],
  providers: [
    AdminDashboardService,
    AdminOrdersService,
    AdminProductsService,
    AdminCategoriesService,
    AdminChannelsService,
    AdminStaffService,
  ],
})
export class AdminModule {}
