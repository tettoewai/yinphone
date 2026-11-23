import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

import type { AdminRequest } from './admin-auth.guard.js';

/** Resolves to the admin attached by `AdminAuthGuard`. */
export const CurrentAdmin = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    context.switchToHttp().getRequest<AdminRequest>().admin,
);
