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
import { AdminStaffService } from './admin-staff.service.js';
import {
  inviteStaffSchema,
  type InviteStaffInput,
} from './dto/invite-staff.schema.js';
import {
  updateStaffSchema,
  type UpdateStaffInput,
} from './dto/update-staff.schema.js';

/** The settings team tab: owners only, per the design. */
@Controller('admin/staff')
@Roles('OWNER')
@UseGuards(AdminAuthGuard, RolesGuard)
export class AdminStaffController {
  constructor(private readonly staff: AdminStaffService) {}

  @Get()
  list() {
    return this.staff.list();
  }

  @Post()
  invite(@Body({ schema: inviteStaffSchema }) input: InviteStaffInput) {
    return this.staff.invite(input);
  }

  @Patch(':id')
  update(
    @Param('id', { schema: adminIdSchema }) id: string,
    @Body({ schema: updateStaffSchema }) input: UpdateStaffInput,
  ) {
    return this.staff.update(id, input);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', { schema: adminIdSchema }) id: string) {
    return this.staff.remove(id);
  }
}
