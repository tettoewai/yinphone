import type { ExecutionContext } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import { describe, expect, it, vi } from 'vitest';

import type { AdminRequest } from './admin-auth.guard.js';
import type { AdminView } from './auth.service.js';
import { ROLES_KEY } from './roles.decorator.js';
import { RolesGuard } from './roles.guard.js';

const staff: AdminView = {
  id: 'a1',
  email: 'staff@yinphone.shop',
  name: 'YinPhone Staff',
  role: 'STAFF',
  mustChangePassword: false,
};

const owner: AdminView = {
  ...staff,
  id: 'a2',
  email: 'owner@yinphone.example',
  name: 'YinPhone Owner',
  role: 'OWNER',
};

function createContext(admin?: AdminView) {
  const request = { admin } as AdminRequest;
  const handler = () => {};
  const klass = class {};

  const context = {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => handler,
    getClass: () => klass,
  } as unknown as ExecutionContext;

  return { context, handler, klass };
}

function createGuard(getAllAndOverride: ReturnType<typeof vi.fn>) {
  return new RolesGuard({ getAllAndOverride } as unknown as Reflector);
}

describe('RolesGuard', () => {
  it('allows any signed-in admin when no roles are declared', () => {
    const getAllAndOverride = vi.fn().mockReturnValue(undefined);
    const { context, handler, klass } = createContext(staff);

    expect(createGuard(getAllAndOverride).canActivate(context)).toBe(true);
    expect(getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [handler, klass]);
  });

  it('treats an empty roles list as unrestricted', () => {
    const getAllAndOverride = vi.fn().mockReturnValue([]);
    const { context } = createContext(staff);

    expect(createGuard(getAllAndOverride).canActivate(context)).toBe(true);
  });

  it('allows a role the route lists', () => {
    const getAllAndOverride = vi.fn().mockReturnValue(['OWNER']);
    const { context } = createContext(owner);

    expect(createGuard(getAllAndOverride).canActivate(context)).toBe(true);
  });

  it('rejects a role the route does not list', () => {
    const getAllAndOverride = vi.fn().mockReturnValue(['OWNER']);
    const { context } = createContext(staff);

    try {
      createGuard(getAllAndOverride).canActivate(context);
      expect.unreachable('RolesGuard should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(ForbiddenException);
      expect(error).toMatchObject({
        status: 403,
        response: { code: 'FORBIDDEN' },
      });
    }
  });

  it('rejects when no admin was attached (guard ran without AdminAuthGuard)', () => {
    const getAllAndOverride = vi.fn().mockReturnValue(['STAFF']);
    const { context } = createContext();

    expect(() => createGuard(getAllAndOverride).canActivate(context)).toThrow(
      ForbiddenException,
    );
  });
});
