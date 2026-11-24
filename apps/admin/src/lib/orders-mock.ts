/**
 * Placeholder rows for `/orders`, shaped like the API's Prisma models.
 *
 * Timestamps are relative to module load so the default "Last 7 days" filter
 * always has data — fixed dates (the dashboard mock's approach) silently empty
 * that filter once the week they describe passes. Swapping this file for a
 * `GET /api/orders` response is the only change the page needs.
 *
 * The design mock numbers its seven sample rows `YP-2026-0012`…`YP-2026-0001`
 * while its header and status pills say 24 orders. Codes here run
 * `YP-2026-0024`…`YP-2026-0001` so the count, the pills and the codes agree,
 * while the first seven rows keep the mock's customers, totals and channels.
 */

import type { OrderSummary } from "@/lib/orders"

type MockOrder = Omit<OrderSummary, "id" | "code" | "createdAt"> & {
  /** How many minutes before load the order arrived. */
  minutesAgo: number
}

/**
 * Newest first. Six NEW, nine CONFIRMED, seven DELIVERED and two CANCELLED,
 * which is what the status pills and the sidebar badge are derived from.
 */
const ROWS: readonly MockOrder[] = [
  {
    customerName: "မသီရိ နဒီ • Thiri Nadi",
    customerPhone: "09 123 456 789",
    itemCount: 2,
    totalMmk: 90_000,
    channel: "messenger",
    status: "NEW",
    minutesAgo: 24,
  },
  {
    customerName: "မအေးချမ်း • Aye Chan",
    customerPhone: "09 987 654 321",
    itemCount: 1,
    totalMmk: 45_000,
    channel: "viber",
    status: "NEW",
    minutesAgo: 57,
  },
  {
    customerName: "ကိုမင်းခန့် • Min Khant",
    customerPhone: "09 555 123 456",
    itemCount: 3,
    totalMmk: 128_000,
    channel: "telegram",
    status: "CONFIRMED",
    minutesAgo: 190,
  },
  {
    customerName: "မလှိုင်လှိုင် • Hlaing",
    customerPhone: "09 777 888 999",
    itemCount: 2,
    totalMmk: 62_500,
    channel: "messenger",
    status: "NEW",
    minutesAgo: 340,
  },
  {
    customerName: "မဆုမြတ် • Su Myat",
    customerPhone: "09 111 222 333",
    itemCount: 1,
    totalMmk: 39_500,
    channel: "viber",
    status: "CONFIRMED",
    minutesAgo: 1_560,
  },
  {
    customerName: "မဖြူစင် • Phyu Sin",
    customerPhone: "09 444 555 666",
    itemCount: 4,
    totalMmk: 156_000,
    channel: "messenger",
    status: "DELIVERED",
    minutesAgo: 1_830,
  },
  {
    customerName: "ကိုအောင် • Aung Min",
    customerPhone: "09 999 000 111",
    itemCount: 1,
    totalMmk: 52_000,
    channel: "telegram",
    status: "CANCELLED",
    minutesAgo: 2_040,
  },
  {
    customerName: "မခင်မြတ် • Khin Myat",
    customerPhone: "09 250 314 720",
    itemCount: 3,
    totalMmk: 98_000,
    channel: "messenger",
    status: "NEW",
    minutesAgo: 2_640,
  },
  {
    customerName: "ကိုဇော်လင်း • Zaw Lin",
    customerPhone: "09 782 640 118",
    itemCount: 2,
    totalMmk: 74_000,
    channel: "viber",
    status: "CONFIRMED",
    minutesAgo: 2_980,
  },
  {
    customerName: "မနန္ဒာ • Nandar",
    customerPhone: "09 331 902 447",
    itemCount: 1,
    totalMmk: 28_500,
    channel: "telegram",
    status: "DELIVERED",
    minutesAgo: 3_120,
  },
  {
    customerName: "မအိအိ • Ei Ei",
    customerPhone: "09 615 208 973",
    itemCount: 2,
    totalMmk: 66_000,
    channel: "messenger",
    status: "CONFIRMED",
    minutesAgo: 3_600,
  },
  {
    customerName: "ကိုမျိုးမင်း • Myo Min",
    customerPhone: "09 408 771 236",
    itemCount: 1,
    totalMmk: 34_000,
    channel: "messenger",
    status: "NEW",
    minutesAgo: 4_400,
  },
  {
    customerName: "မသန္တာ • Thandar",
    customerPhone: "09 296 550 814",
    itemCount: 3,
    totalMmk: 112_000,
    channel: "viber",
    status: "DELIVERED",
    minutesAgo: 4_620,
  },
  {
    customerName: "ကိုကျော်စိုး • Kyaw Soe",
    customerPhone: "09 843 126 907",
    itemCount: 2,
    totalMmk: 58_000,
    channel: "telegram",
    status: "CONFIRMED",
    minutesAgo: 5_040,
  },
  {
    customerName: "မနှင်းဝေ • Hnin Wai",
    customerPhone: "09 570 693 482",
    itemCount: 1,
    totalMmk: 45_000,
    channel: "messenger",
    status: "DELIVERED",
    minutesAgo: 5_340,
  },
  {
    customerName: "ကိုနေလင်း • Nay Lin",
    customerPhone: "09 128 907 645",
    itemCount: 4,
    totalMmk: 148_000,
    channel: "viber",
    status: "CONFIRMED",
    minutesAgo: 6_000,
  },
  {
    customerName: "ကိုဝေယံ • Wai Yan",
    customerPhone: "09 664 215 380",
    itemCount: 2,
    totalMmk: 71_500,
    channel: "telegram",
    status: "DELIVERED",
    minutesAgo: 6_360,
  },
  {
    customerName: "မစန္ဒာ • Sandar",
    customerPhone: "09 905 432 871",
    itemCount: 1,
    totalMmk: 25_000,
    channel: "viber",
    status: "NEW",
    minutesAgo: 6_720,
  },
  {
    customerName: "ကိုအောင်ကျော် • Aung Kyaw",
    customerPhone: "09 317 569 204",
    itemCount: 3,
    totalMmk: 104_000,
    channel: "messenger",
    status: "CONFIRMED",
    minutesAgo: 7_080,
  },
  {
    customerName: "မမိုးမိုး • Moe Moe",
    customerPhone: "09 726 841 593",
    itemCount: 2,
    totalMmk: 59_000,
    channel: "messenger",
    status: "DELIVERED",
    minutesAgo: 7_440,
  },
  {
    customerName: "ကိုသီဟ • Thiha",
    customerPhone: "09 482 073 916",
    itemCount: 1,
    totalMmk: 38_000,
    channel: "viber",
    status: "CANCELLED",
    minutesAgo: 7_920,
  },
  {
    customerName: "မယမင်း • Yamin",
    customerPhone: "09 159 630 748",
    itemCount: 2,
    totalMmk: 82_000,
    channel: "telegram",
    status: "CONFIRMED",
    minutesAgo: 8_640,
  },
  {
    customerName: "မချိုချို • Cho Cho",
    customerPhone: "09 803 294 561",
    itemCount: 1,
    totalMmk: 47_500,
    channel: "messenger",
    status: "CONFIRMED",
    minutesAgo: 9_360,
  },
  {
    customerName: "ကိုကောင်းမြတ် • Kaung Myat",
    customerPhone: "09 634 812 075",
    itemCount: 3,
    totalMmk: 121_000,
    channel: "viber",
    status: "DELIVERED",
    minutesAgo: 9_720,
  },
]

/**
 * The clock the rows were generated against. The page filters with the same
 * instant so "Today" and "Last 7 days" always agree with the data on screen.
 */
export const ORDERS_GENERATED_AT = new Date()

export const ORDERS_MOCK: readonly OrderSummary[] = ROWS.map(
  ({ minutesAgo, ...order }, index) => {
    // Rows are newest first, so the serial counts down from the row count.
    const serial = String(ROWS.length - index).padStart(4, "0")

    return {
      ...order,
      id: `ord_${serial}`,
      code: `YP-2026-${serial}`,
      createdAt: new Date(
        ORDERS_GENERATED_AT.getTime() - minutesAgo * 60_000
      ).toISOString(),
    }
  }
)
