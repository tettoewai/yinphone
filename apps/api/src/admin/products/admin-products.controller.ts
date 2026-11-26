import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { AdminAuthGuard } from '../../auth/admin-auth.guard.js';
import { RolesGuard } from '../../auth/roles.guard.js';
import { adminIdSchema } from '../dto/id.param.js';
import { AdminProductsService } from './admin-products.service.js';
import {
  createProductSchema,
  type CreateProductInput,
} from './dto/create-product.schema.js';
import {
  listAdminProductsQuerySchema,
  type ListAdminProductsQuery,
} from './dto/list-products.query.js';
import {
  updateProductSchema,
  type UpdateProductInput,
} from './dto/update-product.schema.js';
import {
  updateProductVisibilitySchema,
  type UpdateProductVisibilityInput,
} from './dto/update-visibility.schema.js';

@Controller('admin/products')
@UseGuards(AdminAuthGuard, RolesGuard)
export class AdminProductsController {
  constructor(private readonly products: AdminProductsService) {}

  @Get()
  list(
    @Query({ schema: listAdminProductsQuerySchema })
    query: ListAdminProductsQuery,
  ) {
    return this.products.list(query);
  }

  @Post()
  create(@Body({ schema: createProductSchema }) input: CreateProductInput) {
    return this.products.create(input);
  }

  @Get(':id')
  findById(@Param('id', { schema: adminIdSchema }) id: string) {
    return this.products.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id', { schema: adminIdSchema }) id: string,
    @Body({ schema: updateProductSchema }) input: UpdateProductInput,
  ) {
    return this.products.update(id, input);
  }

  @Patch(':id/visibility')
  updateVisibility(
    @Param('id', { schema: adminIdSchema }) id: string,
    @Body({ schema: updateProductVisibilitySchema })
    input: UpdateProductVisibilityInput,
  ) {
    return this.products.updateVisibility(id, input);
  }

  /** Copies land hidden so a half-edited product never reaches shoppers. */
  @Post(':id/duplicate')
  duplicate(@Param('id', { schema: adminIdSchema }) id: string) {
    return this.products.duplicate(id);
  }

  /** Refused when the product appears on an order — hide it instead. */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', { schema: adminIdSchema }) id: string) {
    return this.products.remove(id);
  }
}
