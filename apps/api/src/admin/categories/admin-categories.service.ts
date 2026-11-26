import { Injectable, NotImplementedException } from '@nestjs/common';

import type { CreateCategoryInput } from './dto/create-category.schema.js';
import type { UpdateCategoryInput } from './dto/update-category.schema.js';

/** Setup stub: the routes and guards are wired; the queries land later. */
@Injectable()
export class AdminCategoriesService {
  list() {
    throw new NotImplementedException('Admin category list is not built yet');
  }

  create(_input: CreateCategoryInput) {
    throw new NotImplementedException('Admin category create is not built yet');
  }

  update(_id: string, _input: UpdateCategoryInput) {
    throw new NotImplementedException('Admin category update is not built yet');
  }

  remove(_id: string) {
    throw new NotImplementedException('Admin category delete is not built yet');
  }
}
