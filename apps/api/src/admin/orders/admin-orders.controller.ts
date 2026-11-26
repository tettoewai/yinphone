import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';

import { AdminAuthGuard } from '../../auth/admin-auth.guard.js';
import { RolesGuard } from '../../auth/roles.guard.js';
import { orderCodeSchema } from '../../orders/dto/create-order.schema.js';
import { AdminOrdersService } from './admin-orders.service.js';
import {
  listAdminOrdersQuerySchema,
  type ListAdminOrdersQuery,
} from './dto/list-orders.query.js';
import {
  updateOrderStatusSchema,
  type UpdateOrderStatusInput,
} from './dto/update-status.schema.js';

@Controller('admin/orders')
@UseGuards(AdminAuthGuard, RolesGuard)
export class AdminOrdersController {
  constructor(private readonly orders: AdminOrdersService) {}

  @Get()
  list(
    @Query({ schema: listAdminOrdersQuerySchema }) query: ListAdminOrdersQuery,
  ) {
    return this.orders.list(query);
  }

  @Get(':code')
  findByCode(@Param('code', { schema: orderCodeSchema }) code: string) {
    return this.orders.findByCode(code);
  }

  @Patch(':code/status')
  updateStatus(
    @Param('code', { schema: orderCodeSchema }) code: string,
    @Body({ schema: updateOrderStatusSchema }) input: UpdateOrderStatusInput,
  ) {
    return this.orders.updateStatus(code, input);
  }
}
