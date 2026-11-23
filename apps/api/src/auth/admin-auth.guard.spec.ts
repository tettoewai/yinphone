import type { ExecutionContext } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import { AdminAuthGuard, type AdminRequest } from './admin-auth.guard.js';
import type { AuthService } from './auth.service.js';

function createContext(cookie?: string) {
  const request = { headers: {} } as AdminRequest;
  if (cookie) request.headers.cookie = cookie;

  const context = {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;

  return { context, request };
}

function createGuard(resolveSession: ReturnType<typeof vi.fn>) {
  return new AdminAuthGuard({ resolveSession } as unknown as AuthService);
}

const admin = {
  id: 'a1',
  email: 'staff@yinphone.shop',
  name: 'YinPhone Staff',
  role: 'STAFF' as const,
  mustChangePassword: false,
};

describe('AdminAuthGuard', () => {
  it('rejects a request without a session cookie', async () => {
    const resolveSession = vi.fn();
    const { context } = createContext();

    await expect(
      createGuard(resolveSession).canActivate(context),
    ).rejects.toMatchObject({
      status: 401,
      response: { code: 'NOT_SIGNED_IN' },
    });
    expect(resolveSession).not.toHaveBeenCalled();
  });

  it('rejects a token the service does not recognise', async () => {
    const resolveSession = vi.fn().mockResolvedValue(null);
    const { context } = createContext('yp_session=stale-token');

    await expect(
      createGuard(resolveSession).canActivate(context),
    ).rejects.toMatchObject({
      status: 401,
      response: { code: 'SESSION_EXPIRED' },
    });
    expect(resolveSession).toHaveBeenCalledWith('stale-token');
  });

  it('attaches the admin and the session to the request', async () => {
    const resolveSession = vi
      .fn()
      .mockResolvedValue({ sessionId: 's1', user: admin });
    const { context, request } = createContext(
      'theme=dark; yp_session=live-token; other=1',
    );

    await expect(
      createGuard(resolveSession).canActivate(context),
    ).resolves.toBe(true);

    expect(request.admin).toEqual(admin);
    expect(request.adminSessionId).toBe('s1');
    expect(request.sessionToken).toBe('live-token');
  });
});
