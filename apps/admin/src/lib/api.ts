/**
 * Typed client for the NestJS admin API.
 *
 * Same-origin by default: requests go to `/api/...`, which the Vite dev and
 * preview servers proxy to the API, so the httpOnly session cookie is sent
 * without any CORS or `credentials: "include"` plumbing.
 *
 * Deployments that serve the admin from a different origin set `VITE_API_URL`
 * (see `.env.example`); that origin must also be in the API's `CORS_ORIGINS`.
 */

const API_BASE =
  (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "") || "/api"

export type AdminRole = "OWNER" | "STAFF"

export type AdminUser = {
  id: string
  email: string
  name: string
  role: AdminRole
  mustChangePassword: boolean
}

export type LoginInput = {
  email: string
  password: string
  rememberDevice?: boolean
}

export type LoginResponse = {
  user: AdminUser
  expiresAt: string
}

export type ChangePasswordInput = {
  currentPassword: string
  newPassword: string
}

/** The snake-case-free error body the API returns for known failures. */
type ErrorBody = {
  code?: string
  message?: string | string[]
  attemptsLeft?: number
  retryAfterSeconds?: number
  lockedUntil?: string
}

type ApiErrorInit = {
  status: number
  message: string
  code?: string
  attemptsLeft?: number
  retryAfterSeconds?: number
  lockedUntil?: string
}

export class ApiError extends Error {
  /** HTTP status, or `0` when the request never reached the server. */
  status: number
  code?: string
  attemptsLeft?: number
  retryAfterSeconds?: number
  lockedUntil?: string

  constructor(init: ApiErrorInit) {
    super(init.message)
    this.name = "ApiError"
    this.status = init.status
    this.code = init.code
    this.attemptsLeft = init.attemptsLeft
    this.retryAfterSeconds = init.retryAfterSeconds
    this.lockedUntil = init.lockedUntil
  }
}

async function readBody(response: Response) {
  if (response.status === 204) return null

  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text) as unknown
  } catch {
    return null
  }
}

function messageFrom(body: unknown, fallback: string) {
  if (typeof body !== "object" || body === null) return fallback

  const { message } = body as ErrorBody
  if (Array.isArray(message)) return message[0] ?? fallback

  return typeof message === "string" && message.length > 0 ? message : fallback
}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown } = {}
): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: options.method ?? "GET",
      // `include` behaves like `same-origin` for the default relative base and
      // still carries the cookie when `VITE_API_URL` points at another origin.
      credentials: "include",
      headers:
        options.body === undefined
          ? undefined
          : { "content-type": "application/json" },
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
    })
  } catch {
    throw new ApiError({
      status: 0,
      code: "NETWORK",
      message: "Cannot reach the API server",
    })
  }

  const body = await readBody(response)

  if (!response.ok) {
    const error = (body ?? {}) as ErrorBody

    throw new ApiError({
      status: response.status,
      message: messageFrom(body, "Something went wrong. Please try again."),
      code: error.code,
      attemptsLeft: error.attemptsLeft,
      retryAfterSeconds: error.retryAfterSeconds,
      lockedUntil: error.lockedUntil,
    })
  }

  return body as T
}

export const authApi = {
  login(input: LoginInput) {
    return request<LoginResponse>("/auth/login", {
      method: "POST",
      body: input,
    })
  },

  me() {
    return request<{ user: AdminUser }>("/auth/me")
  },

  logout() {
    return request<null>("/auth/logout", { method: "POST" })
  },

  changePassword(input: ChangePasswordInput) {
    return request<null>("/auth/change-password", {
      method: "POST",
      body: input,
    })
  },
}
