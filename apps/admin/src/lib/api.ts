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

import { notifySessionExpired } from "@/lib/session-expiry"

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

export type AdminOrderStatus = "NEW" | "CONFIRMED" | "DELIVERED" | "CANCELLED"

export type AdminOrderSize = "S" | "M" | "L" | "XL"

/** One row of `GET /api/admin/orders`; the list screen's `OrderSummary`. */
export type AdminOrderSummary = {
  id: string
  code: string
  customerName: string
  customerPhone: string
  /** Summed units, not lines. */
  itemCount: number
  totalMmk: number
  /** Channel slug, e.g. `messenger`. */
  channel: string
  status: AdminOrderStatus
  createdAt: string
}

export type AdminOrderItem = {
  id: string
  productId: string
  slug: string
  nameMy: string
  nameEn: string
  /** `null` for one-size items such as longyi. */
  size: AdminOrderSize | null
  quantity: number
  unitPriceMmk: number
  lineTotalMmk: number
}

export type AdminOrderDetail = AdminOrderSummary & {
  updatedAt: string
  /** The customer's checkout note, or `null`. */
  note: string | null
  /** Earlier orders from the same phone number. */
  priorOrderCount: number
  items: AdminOrderItem[]
}

export type AdminOrderListQuery = {
  q?: string
  channel?: string
  status?: AdminOrderStatus
  range?: "today" | "7d" | "30d" | "all"
  limit?: number
  offset?: number
}

export type AdminOrderPage = {
  items: AdminOrderSummary[]
  total: number
  limit: number
  offset: number
  /** Counts by status over every facet except the status filter. */
  counts: Record<AdminOrderStatus, number>
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

/**
 * 401s that mean "those credentials are wrong", not "the session ended": the
 * login attempt itself, the bootstrap probe (a normal signed-out path) and
 * sign-out (where a stale cookie is expected). None of them should raise the
 * re-authentication dialog.
 */
const SESSION_EXEMPT_PATHS = new Set([
  "/auth/login",
  "/auth/logout",
  "/auth/me",
])

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
  options: { method?: string; body?: unknown; signal?: AbortSignal } = {}
): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: options.method ?? "GET",
      // `include` behaves like `same-origin` for the default relative base and
      // still carries the cookie when `VITE_API_URL` points at another origin.
      credentials: "include",
      signal: options.signal,
      headers:
        options.body === undefined
          ? undefined
          : { "content-type": "application/json" },
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
    })
  } catch (error) {
    // An aborted request was cancelled on purpose (a newer query won); let the
    // caller see that instead of reporting it as a network failure.
    if ((error as { name?: string }).name === "AbortError") throw error

    throw new ApiError({
      status: 0,
      code: "NETWORK",
      message: "Cannot reach the API server",
    })
  }

  const body = await readBody(response)

  if (!response.ok) {
    // A 401 anywhere else means the cookie expired mid-session. Tell the shell
    // so it can ask for the password again without discarding the current page
    // (and any unsaved form state on it).
    if (response.status === 401 && !SESSION_EXEMPT_PATHS.has(path)) {
      notifySessionExpired()
    }

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

  /** Ends the account's other sessions; this device stays signed in. */
  revokeOtherSessions() {
    return request<{ revoked: number }>("/auth/sessions/revoke-others", {
      method: "POST",
    })
  },

  /**
   * The email-OTP reset. All three are unguarded: the caller is signed out.
   * `request` answers 204 whether or not the email has an account.
   */
  requestPasswordReset(email: string) {
    return request<null>("/auth/password-reset/request", {
      method: "POST",
      body: { email },
    })
  },

  verifyPasswordReset(email: string, code: string) {
    return request<{ ticket: string }>("/auth/password-reset/verify", {
      method: "POST",
      body: { email, code },
    })
  },

  completePasswordReset(ticket: string, password: string) {
    return request<null>("/auth/password-reset/complete", {
      method: "POST",
      body: { ticket, password },
    })
  },
}

/** Omits empty values, so a cleared filter never lands in the query string. */
function toQueryString(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue
    search.set(key, String(value))
  }

  const query = search.toString()
  return query ? `?${query}` : ""
}

export const ordersApi = {
  list(query: AdminOrderListQuery = {}, signal?: AbortSignal) {
    return request<AdminOrderPage>(`/admin/orders${toQueryString(query)}`, {
      signal,
    })
  },

  get(code: string, signal?: AbortSignal) {
    return request<AdminOrderDetail>(
      `/admin/orders/${encodeURIComponent(code)}`,
      { signal }
    )
  },

  updateStatus(code: string, status: AdminOrderStatus) {
    return request<AdminOrderDetail>(
      `/admin/orders/${encodeURIComponent(code)}/status`,
      { method: "PATCH", body: { status } }
    )
  },
}

export type AdminProductSize = "S" | "M" | "L" | "XL"

/** Category as it appears on a product row. */
export type AdminProductCategory = {
  id: string
  slug: string
  nameMy: string
  nameEn: string
}

/** One row of `GET /api/admin/products`; the list screen's `ProductSummary`. */
export type AdminProductSummary = {
  id: string
  slug: string
  nameMy: string
  nameEn: string
  priceMmk: number
  stock: number
  isActive: boolean
  category: AdminProductCategory
}

export type AdminProductImage = {
  id: string
  url: string
  altText: string | null
  sortOrder: number
}

export type AdminProductDetail = AdminProductSummary & {
  descriptionMy: string | null
  descriptionEn: string | null
  sizes: AdminProductSize[]
  createdAt: string
  updatedAt: string
  images: AdminProductImage[]
}

export type AdminProductStockFilter = "all" | "in" | "low" | "out"

export type AdminProductVisibilityFilter = "active" | "hidden" | "all"

export type AdminProductSort =
  "default" | "price-asc" | "price-desc" | "stock-asc"

export type AdminProductListQuery = {
  q?: string
  /** Category slug. */
  category?: string
  stock?: AdminProductStockFilter
  visibility?: AdminProductVisibilityFilter
  sort?: AdminProductSort
  limit?: number
  offset?: number
}

export type AdminProductPage = {
  items: AdminProductSummary[]
  total: number
  limit: number
  offset: number
  /** Stock breakdown over the search, category and SHOWING view. */
  counts: { in: number; low: number; out: number }
}

/** The category row the admin list renders, with its product count. */
export type AdminCategory = {
  id: string
  slug: string
  nameMy: string
  nameEn: string
  sortOrder: number
  productCount: number
}

export type CreateProductBody = {
  nameMy: string
  nameEn: string
  descriptionMy?: string
  descriptionEn?: string
  slug?: string
  priceMmk: number
  stock?: number
  sizes?: AdminProductSize[]
  categoryId: string
  isActive?: boolean
  images?: { url: string; altText?: string; sortOrder?: number }[]
}

export type UpdateProductBody = Partial<CreateProductBody>

export type CategoryBody = {
  nameMy?: string
  nameEn?: string
  slug?: string
  sortOrder?: number
}

export const productsApi = {
  list(query: AdminProductListQuery = {}, signal?: AbortSignal) {
    return request<AdminProductPage>(`/admin/products${toQueryString(query)}`, {
      signal,
    })
  },

  get(id: string, signal?: AbortSignal) {
    return request<AdminProductDetail>(
      `/admin/products/${encodeURIComponent(id)}`,
      { signal }
    )
  },

  create(body: CreateProductBody) {
    return request<AdminProductDetail>("/admin/products", {
      method: "POST",
      body,
    })
  },

  update(id: string, body: UpdateProductBody) {
    return request<AdminProductDetail>(
      `/admin/products/${encodeURIComponent(id)}`,
      { method: "PATCH", body }
    )
  },

  setVisibility(id: string, isActive: boolean) {
    return request<AdminProductDetail>(
      `/admin/products/${encodeURIComponent(id)}/visibility`,
      { method: "PATCH", body: { isActive } }
    )
  },

  duplicate(id: string) {
    return request<AdminProductDetail>(
      `/admin/products/${encodeURIComponent(id)}/duplicate`,
      { method: "POST" }
    )
  },

  remove(id: string) {
    return request<null>(`/admin/products/${encodeURIComponent(id)}`, {
      method: "DELETE",
    })
  },
}

export const categoriesApi = {
  list(signal?: AbortSignal) {
    return request<AdminCategory[]>("/admin/categories", { signal })
  },

  create(body: CategoryBody & { nameMy: string; nameEn: string }) {
    return request<AdminCategory>("/admin/categories", {
      method: "POST",
      body,
    })
  },

  update(id: string, body: CategoryBody) {
    return request<AdminCategory>(
      `/admin/categories/${encodeURIComponent(id)}`,
      { method: "PATCH", body }
    )
  },

  remove(id: string) {
    return request<null>(`/admin/categories/${encodeURIComponent(id)}`, {
      method: "DELETE",
    })
  },
}

/** One row of `GET /api/admin/channels`; the channels screen renders it. */
export type AdminChannel = {
  id: string
  slug: string
  nameMy: string
  nameEn: string
  /** The shop's public chat link, editable on the screen. */
  url: string
  isActive: boolean
  sortOrder: number
  /** Orders through this channel in the last seven Yangon days. */
  orderCount: number
}

export type ChannelBody = {
  nameMy?: string
  nameEn?: string
  slug?: string
  url?: string
  isActive?: boolean
  sortOrder?: number
}

export const channelsApi = {
  list(signal?: AbortSignal) {
    return request<AdminChannel[]>("/admin/channels", { signal })
  },

  create(body: ChannelBody & { nameMy: string; nameEn: string; url: string }) {
    return request<AdminChannel>("/admin/channels", { method: "POST", body })
  },

  update(id: string, body: ChannelBody) {
    return request<AdminChannel>(`/admin/channels/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body,
    })
  },
}

/** One row of `GET /api/admin/staff`; the settings team card renders it. */
export type AdminStaffMember = {
  id: string
  email: string
  name: string
  role: AdminRole
  /** True until the invitee replaces the temporary password. */
  mustChangePassword: boolean
  /** ISO instant of the last successful sign-in, or `null` before the first. */
  lastLoginAt: string | null
  createdAt: string
}

export type InviteStaffBody = {
  email: string
  name: string
  role: AdminRole
}

export type InviteStaffResult = {
  member: AdminStaffMember
  /** Returned once, for the owner to pass on out-of-band. */
  temporaryPassword: string
}

export type UpdateStaffBody = {
  name?: string
  role?: AdminRole
}

export const staffApi = {
  list(signal?: AbortSignal) {
    return request<AdminStaffMember[]>("/admin/staff", { signal })
  },

  invite(body: InviteStaffBody) {
    return request<InviteStaffResult>("/admin/staff", {
      method: "POST",
      body,
    })
  },

  update(id: string, body: UpdateStaffBody) {
    return request<AdminStaffMember>(`/admin/staff/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body,
    })
  },

  remove(id: string) {
    return request<null>(`/admin/staff/${encodeURIComponent(id)}`, {
      method: "DELETE",
    })
  },
}

/** One column of `GET /api/admin/dashboard`'s seven-day chart. */
export type AdminDashboardDay = {
  /** `YYYY-MM-DD` in Asia/Yangon. */
  date: string
  /** Day-of-month label shown under the bar. */
  day: string
  amountMmk: number
}

/** One slice of the dashboard's channel split. */
export type AdminDashboardChannel = {
  slug: string
  nameMy: string
  nameEn: string
  orders: number
  /** Rounded share of the window's orders, 0–100. */
  sharePct: number
}

/**
 * Today's headline figures. `salesOrders` and `salesMmk` exclude cancelled
 * orders, so "sales" means takings.
 */
export type AdminDashboardToday = {
  orders: number
  salesOrders: number
  salesMmk: number
  ordersYesterday: number
  salesMmkYesterday: number
}

/** One row of the dashboard's recent-orders table. */
export type AdminDashboardRecentOrder = {
  id: string
  code: string
  customerName: string
  totalMmk: number
  /** Channel slug, e.g. `messenger`. */
  channel: string
  status: AdminOrderStatus
  createdAt: string
}

export type AdminDashboardOverview = {
  today: AdminDashboardToday
  /** All-time NEW and CONFIRMED counts; drives the KPI cards and the nav chip. */
  pending: { new: number; confirmed: number }
  salesLast7Days: AdminDashboardDay[]
  channels: AdminDashboardChannel[]
  recentOrders: AdminDashboardRecentOrder[]
  /** Days covered by the chart and the channel split. */
  windowDays: number
}

export const dashboardApi = {
  overview(signal?: AbortSignal) {
    return request<AdminDashboardOverview>("/admin/dashboard", { signal })
  },
}
