import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { AdminAuthGuard } from '../../auth/admin-auth.guard.js';
import { RolesGuard } from '../../auth/roles.guard.js';
import {
  createOrderSchema,
  orderCodeSchema,
  type CreateOrderInput,
} from '../../orders/dto/create-order.schema.js';
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

  /**
   * Staff take orders on chat as well, so any signed-in admin may record one.
   * It starts as NEW, exactly like a storefront order.
   */
  @Post()
  create(@Body({ schema: createOrderSchema }) input: CreateOrderInput) {
    return this.orders.create(input);
  }

  @Patch(':code/status')
  updateStatus(
    @Param('code', { schema: orderCodeSchema }) code: string,
    @Body({ schema: updateOrderStatusSchema }) input: UpdateOrderStatusInput,
  ) {
    return this.orders.updateStatus(code, input);
  }
}
