import { SetMetadata } from '@nestjs/common';

import type { AdminRole } from '../generated/prisma/enums.js';

export const ROLES_KEY = 'admin:roles';

/** Restricts a route to the given roles. Pair it with `AdminAuthGuard`. */
export const Roles = (...roles: AdminRole[]) => SetMetadata(ROLES_KEY, roles);
