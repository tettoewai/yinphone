import { Controller, Get, Param, Query } from '@nestjs/common';

import { CatalogService } from './catalog.service.js';
import {
  listProductsQuerySchema,
  productSlugSchema,
  type ListProductsQuery,
} from './dto/list-products.query.js';

@Controller()
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('categories')
  listCategories() {
    return this.catalog.listCategories();
  }

  @Get('products')
  listProducts(
    @Query({ schema: listProductsQuerySchema }) query: ListProductsQuery,
  ) {
    return this.catalog.listProducts(query);
  }

  @Get('products/:slug')
  getProduct(@Param('slug', { schema: productSlugSchema }) slug: string) {
    return this.catalog.getProduct(slug);
  }
}
