import { Injectable, NotImplementedException } from '@nestjs/common';

import type { CreateChannelInput } from './dto/create-channel.schema.js';
import type { UpdateChannelInput } from './dto/update-channel.schema.js';

/** Setup stub: the routes and guards are wired; the queries land later. */
@Injectable()
export class AdminChannelsService {
  list() {
    throw new NotImplementedException('Admin channel list is not built yet');
  }

  create(_input: CreateChannelInput) {
    throw new NotImplementedException('Admin channel create is not built yet');
  }

  update(_id: string, _input: UpdateChannelInput) {
    throw new NotImplementedException('Admin channel update is not built yet');
  }
}
