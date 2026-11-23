import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import {
  createOrderSchema,
  orderCodeSchema,
  type CreateOrderInput,
} from './dto/create-order.schema.js';
import { OrdersService } from './orders.service.js';

@Controller()
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get('channels')
  listChannels() {
    return this.orders.listChannels();
  }

  @Post('orders')
  create(@Body({ schema: createOrderSchema }) input: CreateOrderInput) {
    return this.orders.create(input);
  }

  @Get('orders/:code')
  findByCode(@Param('code', { schema: orderCodeSchema }) code: string) {
    return this.orders.findByCode(code);
  }
}
