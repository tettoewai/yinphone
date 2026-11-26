import { Injectable, NotImplementedException } from '@nestjs/common';

import type { InviteStaffInput } from './dto/invite-staff.schema.js';
import type { UpdateStaffInput } from './dto/update-staff.schema.js';

/**
 * Setup stub: the routes and guards are wired; the queries land later.
 * Implementation guardrails: never demote or remove the last OWNER, and no
 * self-role-change through these routes.
 */
@Injectable()
export class AdminStaffService {
  list() {
    throw new NotImplementedException('Admin staff list is not built yet');
  }

  invite(_input: InviteStaffInput) {
    throw new NotImplementedException('Admin staff invite is not built yet');
  }

  update(_id: string, _input: UpdateStaffInput) {
    throw new NotImplementedException('Admin staff update is not built yet');
  }

  remove(_id: string) {
    throw new NotImplementedException('Admin staff remove is not built yet');
  }
}
