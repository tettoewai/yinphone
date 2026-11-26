import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { AdminAuthGuard } from '../../auth/admin-auth.guard.js';
import { Roles } from '../../auth/roles.decorator.js';
import { RolesGuard } from '../../auth/roles.guard.js';
import { adminIdSchema } from '../dto/id.param.js';
import { AdminChannelsService } from './admin-channels.service.js';
import {
  createChannelSchema,
  type CreateChannelInput,
} from './dto/create-channel.schema.js';
import {
  updateChannelSchema,
  type UpdateChannelInput,
} from './dto/update-channel.schema.js';

@Controller('admin/channels')
@UseGuards(AdminAuthGuard, RolesGuard)
export class AdminChannelsController {
  constructor(private readonly channels: AdminChannelsService) {}

  @Get()
  list() {
    return this.channels.list();
  }

  @Post()
  @Roles('OWNER')
  create(@Body({ schema: createChannelSchema }) input: CreateChannelInput) {
    return this.channels.create(input);
  }

  @Patch(':id')
  @Roles('OWNER')
  update(
    @Param('id', { schema: adminIdSchema }) id: string,
    @Body({ schema: updateChannelSchema }) input: UpdateChannelInput,
  ) {
    return this.channels.update(id, input);
  }
}
