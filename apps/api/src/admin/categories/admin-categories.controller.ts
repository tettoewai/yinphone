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
  UseGuards,
} from '@nestjs/common';

import { AdminAuthGuard } from '../../auth/admin-auth.guard.js';
import { Roles } from '../../auth/roles.decorator.js';
import { RolesGuard } from '../../auth/roles.guard.js';
import { adminIdSchema } from '../dto/id.param.js';
import { AdminCategoriesService } from './admin-categories.service.js';
import {
  createCategorySchema,
  type CreateCategoryInput,
} from './dto/create-category.schema.js';
import {
  updateCategorySchema,
  type UpdateCategoryInput,
} from './dto/update-category.schema.js';

@Controller('admin/categories')
@UseGuards(AdminAuthGuard, RolesGuard)
export class AdminCategoriesController {
  constructor(private readonly categories: AdminCategoriesService) {}

  @Get()
  list() {
    return this.categories.list();
  }

  @Post()
  create(@Body({ schema: createCategorySchema }) input: CreateCategoryInput) {
    return this.categories.create(input);
  }

  @Patch(':id')
  update(
    @Param('id', { schema: adminIdSchema }) id: string,
    @Body({ schema: updateCategorySchema }) input: UpdateCategoryInput,
  ) {
    return this.categories.update(id, input);
  }

  @Delete(':id')
  @Roles('OWNER')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', { schema: adminIdSchema }) id: string) {
    return this.categories.remove(id);
  }
}
