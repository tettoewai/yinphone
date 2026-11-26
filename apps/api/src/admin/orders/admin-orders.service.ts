import { Injectable, NotImplementedException } from '@nestjs/common';

import type { ListAdminOrdersQuery } from './dto/list-orders.query.js';
import type { UpdateOrderStatusInput } from './dto/update-status.schema.js';

/** Setup stub: the routes and guards are wired; the queries land later. */
@Injectable()
export class AdminOrdersService {
  list(_query: ListAdminOrdersQuery) {
    throw new NotImplementedException('Admin order list is not built yet');
  }

  findByCode(_code: string) {
    throw new NotImplementedException('Admin order detail is not built yet');
  }

  updateStatus(_code: string, _input: UpdateOrderStatusInput) {
    throw new NotImplementedException(
      'Admin order status update is not built yet',
    );
  }
}
