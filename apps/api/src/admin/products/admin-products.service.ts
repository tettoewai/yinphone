import { Injectable, NotImplementedException } from '@nestjs/common';

import type { CreateProductInput } from './dto/create-product.schema.js';
import type { ListAdminProductsQuery } from './dto/list-products.query.js';
import type { UpdateProductInput } from './dto/update-product.schema.js';
import type { UpdateProductVisibilityInput } from './dto/update-visibility.schema.js';

/** Setup stub: the routes and guards are wired; the queries land later. */
@Injectable()
export class AdminProductsService {
  list(_query: ListAdminProductsQuery) {
    throw new NotImplementedException('Admin product list is not built yet');
  }

  findById(_id: string) {
    throw new NotImplementedException('Admin product detail is not built yet');
  }

  create(_input: CreateProductInput) {
    throw new NotImplementedException('Admin product create is not built yet');
  }

  update(_id: string, _input: UpdateProductInput) {
    throw new NotImplementedException('Admin product update is not built yet');
  }

  updateVisibility(_id: string, _input: UpdateProductVisibilityInput) {
    throw new NotImplementedException(
      'Admin product visibility is not built yet',
    );
  }

  duplicate(_id: string) {
    throw new NotImplementedException(
      'Admin product duplicate is not built yet',
    );
  }
}
