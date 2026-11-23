import 'dotenv/config';
import { hash, argon2id } from 'argon2';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client.js';
import type { ProductSize } from '@/generated/prisma/enums.js';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ---------- Channels ----------
// Placeholder handles: replace with the real shop accounts before go-live.
const channels = [
  {
    slug: 'messenger',
    nameMy: 'Messenger',
    nameEn: 'Messenger',
    url: 'https://m.me/yinphoneboutique',
    sortOrder: 1,
  },
  {
    slug: 'viber',
    nameMy: 'Viber',
    nameEn: 'Viber',
    url: 'viber://chat?number=%2B95XXXXXXXXX',
    sortOrder: 2,
  },
  {
    slug: 'telegram',
    nameMy: 'Telegram',
    nameEn: 'Telegram',
    url: 'https://t.me/yinphoneboutique',
    sortOrder: 3,
  },
];

// ---------- Categories ----------
const categories = [
  { slug: 'blouses', nameMy: 'ရင်ဖုံး', nameEn: 'Blouses', sortOrder: 1 },
  { slug: 'longyi', nameMy: 'လုံချည်', nameEn: 'Longyi', sortOrder: 2 },
  {
    slug: 'dresses-sets',
    nameMy: 'ဂါဝန်နှင့် အစုံ',
    nameEn: 'Dresses & Sets',
    sortOrder: 3,
  },
];

// ---------- Products ----------
// Prices and stock are sample values. Burmese text should be reviewed by a native speaker.
type SeedProduct = {
  slug: string;
  category: string;
  nameMy: string;
  nameEn: string;
  descriptionMy: string;
  descriptionEn: string;
  priceMmk: number;
  stock: number;
  /** Empty means one size fits all (e.g. longyi), not out of stock. */
  sizes: ProductSize[];
};

const products: SeedProduct[] = [
  // Blouses
  {
    slug: 'classic-cotton-yin-phone',
    category: 'blouses',
    nameMy: 'ရိုးရာ ရင်ဖုံး',
    nameEn: 'Classic Cotton Yin Phone',
    descriptionMy: 'နေ့စဉ်ဝတ်ရန် အသင့်တော်ဆုံး ရိုးရှင်းသော ဝါဂွန်ရင်ဖုံး။',
    descriptionEn:
      'Simple everyday cotton yin phone, comfortable for all-day wear.',
    priceMmk: 18000,
    stock: 12,
    sizes: ['S', 'M', 'L'],
  },
  {
    slug: 'embroidered-yin-phone-white',
    category: 'blouses',
    nameMy: 'ပန်းပွင့်ထိုး ရင်ဖုံး (ဖြူ)',
    nameEn: 'Embroidered Yin Phone (White)',
    descriptionMy: 'ဖြူရောင်အခြေခံပေါ်တွင် ပန်းပွင့်ထိုးအလုပ်ပါဝင်သည်။',
    descriptionEn:
      'White base with hand-finished floral embroidery on the front panel.',
    priceMmk: 26000,
    stock: 6,
    sizes: ['S', 'M'],
  },
  {
    slug: 'everyday-linen-blouse',
    category: 'blouses',
    nameMy: 'လိနင် ရင်ဖုံး',
    nameEn: 'Everyday Linen Blouse',
    descriptionMy:
      'လေဝင်လေထွက်ကောင်းသော လိနင်အထည်။ ပူသော ရာသီအတွက် သင့်တော်သည်။',
    descriptionEn: 'Breathable linen for hot weather, with a relaxed fit.',
    priceMmk: 22000,
    stock: 9,
    sizes: ['S', 'M', 'L'],
  },
  {
    slug: 'mandalay-style-yin-phone-navy',
    category: 'blouses',
    nameMy: 'မန္တလေးပုံစံ ရင်ဖုံး (နီလာ)',
    nameEn: 'Mandalay-Style Yin Phone (Navy)',
    descriptionMy: 'မန္တလေးပုံစံ ဖြတ်တောက်ချုပ်ဆိုထားသော နီလာရောင် ရင်ဖုံး။',
    descriptionEn: 'Traditional Mandalay cut in deep navy.',
    priceMmk: 24000,
    stock: 8,
    sizes: ['M', 'L', 'XL'],
  },
  {
    slug: 'mandarin-collar-blouse',
    category: 'blouses',
    nameMy: 'မန်ဒရင်း ကော်လံ ရင်ဖုံး',
    nameEn: 'Mandarin Collar Fusion Blouse',
    descriptionMy:
      'ရိုးရာပုံစံကို ခေတ်သစ် မန်ဒရင်းကော်လံဖြင့် ပေါင်းစပ်ထားသည်။',
    descriptionEn:
      'Traditional silhouette with a modern mandarin collar. Works for office and events.',
    priceMmk: 28000,
    stock: 5,
    sizes: ['S', 'M', 'L'],
  },

  // Longyi
  // Longyi are sold free-size, so they carry no size options. Swap in real
  // sizes if the shop stocks waist-sized longyi.
  {
    slug: 'checked-cotton-longyi',
    category: 'longyi',
    nameMy: 'စစ်ကွင်း လုံချည်',
    nameEn: 'Checked Cotton Longyi',
    descriptionMy: 'ကြီးမားသော စစ်ကွင်းပုံစံ ဝါဂွန်လုံချည်။',
    descriptionEn:
      'Classic checked cotton longyi with a comfortable waistband.',
    priceMmk: 32000,
    stock: 10,
    sizes: [],
  },
  {
    slug: 'silk-blend-longyi-gold',
    category: 'longyi',
    nameMy: 'ပိုးရောထည် လုံချည် (ရွှေအစွန်း)',
    nameEn: 'Silk-Blend Longyi (Gold Trim)',
    descriptionMy: 'ပိုးရောထည်ဖြင့် ရွှေအစွန်းပါသော အထူးအခမ်းအနား လုံချည်။',
    descriptionEn:
      'Silk-blend longyi with gold trim, suited for ceremonies and celebrations.',
    priceMmk: 65000,
    stock: 4,
    sizes: [],
  },
  {
    slug: 'everyday-plain-cotton-longyi',
    category: 'longyi',
    nameMy: 'သာမန် လုံချည်',
    nameEn: 'Everyday Plain Cotton Longyi',
    descriptionMy: 'အရောင်တစ်ထည်တည်းဖြင့် နေ့စဉ်သုံး ဝါဂွန်လုံချည်။',
    descriptionEn:
      'Solid-color everyday cotton longyi that pairs with any blouse.',
    priceMmk: 19000,
    stock: 15,
    sizes: [],
  },
  {
    slug: 'ikat-style-longyi',
    category: 'longyi',
    nameMy: 'ရောင်စုံ လုံချည်',
    nameEn: 'Colorful Ikat-Style Longyi',
    descriptionMy: 'အရောင်စုံ ဒီဇိုင်းဖြင့် ထူးခြားသော လုံချည်။',
    descriptionEn:
      'Colorful ikat-inspired pattern for a standout everyday look.',
    priceMmk: 38000,
    stock: 6,
    sizes: [],
  },
  {
    slug: 'pastel-striped-longyi',
    category: 'longyi',
    nameMy: 'ဆော့ဖ်ရောင် မျဉ်းကြောင်း လုံချည်',
    nameEn: 'Pastel Striped Longyi',
    descriptionMy: 'ပေါ့ပါးသော ပါစတယ်ရောင် မျဉ်းကြောင်းပုံစံ။',
    descriptionEn:
      'Light pastel stripes, ideal for warm days and casual outings.',
    priceMmk: 27000,
    stock: 7,
    sizes: [],
  },

  // Dresses & sets
  {
    slug: 'classic-yin-phone-longyi-set',
    category: 'dresses-sets',
    nameMy: 'ရင်ဖုံးနှင့် လုံချည် အစုံ',
    nameEn: 'Classic Yin Phone & Longyi Set',
    descriptionMy: 'ရင်ဖုံးနှင့် လုံချည် တွဲဖက်ဝတ်စုံ။',
    descriptionEn: 'Matching yin phone and longyi set, ready to wear.',
    priceMmk: 45000,
    stock: 5,
    sizes: ['S', 'M', 'L'],
  },
  {
    slug: 'floral-midi-dress',
    category: 'dresses-sets',
    nameMy: 'ပန်းပွင့်ဝတ်စုံ ဂါဝန်',
    nameEn: 'Floral Midi Dress',
    descriptionMy: 'ခါးသေးသော ပန်းပွင့်ပုံ မီဒီဂါဝန်။',
    descriptionEn: 'Fitted waist with a flowing floral midi skirt.',
    priceMmk: 35000,
    stock: 6,
    sizes: ['S', 'M', 'L'],
  },
  {
    slug: 'linen-wrap-dress',
    category: 'dresses-sets',
    nameMy: 'လိနင် ခြုံဝတ်ဂါဝန်',
    nameEn: 'Linen Wrap Dress',
    descriptionMy: 'လိနင်အထည်ဖြင့် ချုပ်ထားသော ခြုံဝတ် ဂါဝန်။',
    descriptionEn:
      'Adjustable wrap-style linen dress for everyday and casual events.',
    priceMmk: 39000,
    stock: 4,
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    slug: 'two-piece-cotton-set',
    category: 'dresses-sets',
    nameMy: 'ဝါဂွန် နှစ်ထပ် အစုံ',
    nameEn: 'Two-Piece Cotton Set',
    descriptionMy: 'ရင်ဖုံးပုံစံ အပေါ်ပိုင်းနှင့် စကတ် အောက်ပိုင်း အစုံ။',
    descriptionEn: 'Cropped top and skirt set in soft cotton.',
    priceMmk: 42000,
    stock: 5,
    sizes: ['S', 'M'],
  },
  {
    slug: 'festive-celebration-gown',
    category: 'dresses-sets',
    nameMy: 'ပွဲတော်ဝတ် ဂါဝန်',
    nameEn: 'Festive Celebration Gown',
    descriptionMy: 'ပွဲတော်နှင့် အခမ်းအနားများအတွက် အထူးဂါဝန်။',
    descriptionEn: 'Statement gown for festivals and formal celebrations.',
    priceMmk: 85000,
    stock: 2,
    sizes: ['M', 'L', 'XL'],
  },
];

// ---------- Product images ----------
// One photo per product, found by searching Pinterest for the product's Myanmar
// name (see the board https://www.pinterest.com/cssaung/myanmar-dress/ for the
// same look). Each pin belongs to the shop or photographer that posted it, so
// these are third-party photos: fine for local demos, but NOT licensed for
// production, and hotlinking i.pinimg.com is against Pinterest's terms.
// Replace with the shop's own product photos before go-live.
//
// `hash` is the i.pinimg.com path; `altText` describes the garment in the photo.
const PRODUCT_IMAGES: Record<string, { hash: string; altText: string }> = {
  // Blouses
  'classic-cotton-yin-phone': {
    hash: 'f0/51/be/f051becc0fb4b560ab8042c8e4699e62',
    altText: 'Cream cotton yin phone with centre-front frog buttons',
  },
  'embroidered-yin-phone-white': {
    hash: '19/d0/0a/19d00ab33b8e58953fd3e63c2908c1e2',
    altText: 'White yin phone with gold floral embroidery',
  },
  'everyday-linen-blouse': {
    hash: 'e4/f0/94/e4f09431dbd75e55a828fae19aa347e9',
    altText: 'Cream linen blouse with a relaxed boxy cut',
  },
  'mandalay-style-yin-phone-navy': {
    hash: '04/b7/29/04b72937cba551be1dd09207f4f4ec06',
    altText: 'Navy Mandalay-cut yin phone with a diagonal front closure',
  },
  'mandarin-collar-blouse': {
    hash: '32/78/a1/3278a1e4beadde7bde94cf821fa284a0',
    altText: 'Mint green blouse with a stand-up mandarin collar',
  },

  // Longyi
  'checked-cotton-longyi': {
    hash: 'd5/4a/11/d54a11308c01ae8945dffe350c33ec97',
    altText: 'Fine grey checked cotton weave',
  },
  'silk-blend-longyi-gold': {
    hash: '4c/23/26/4c23268bb7a4680abc1b9e53887bb8ef',
    altText: 'Gold acheik silk longyi',
  },
  'everyday-plain-cotton-longyi': {
    hash: '5f/c0/f1/5fc0f10a908d2c028874cb736b54bd10',
    altText: 'Solid champagne everyday longyi',
  },
  'ikat-style-longyi': {
    hash: 'ee/da/c1/eedac105a44763df2d93afe7d59c8560',
    altText: 'Multicolour ikat diamond patterning',
  },
  'pastel-striped-longyi': {
    hash: '49/8b/b4/498bb4048b624864b49ed2ee4fa8ca10',
    altText: 'Pastel striped longyi',
  },

  // Dresses & sets
  'classic-yin-phone-longyi-set': {
    hash: '06/45/ae/0645aeab1715b7731aef40d82d0b9bf9',
    altText: 'Matching red yin phone and longyi set',
  },
  'floral-midi-dress': {
    hash: 'ab/7e/4e/ab7e4e8708a4214b08882fd10a260b91',
    altText: 'White midi dress with a pink floral print',
  },
  'linen-wrap-dress': {
    hash: '22/06/1e/22061ed911d51a9019a365d068dbeba9',
    altText: 'Olive linen wrap dress',
  },
  'two-piece-cotton-set': {
    hash: '72/d8/7d/72d87d31839e67357e71afb3f0ee38ae',
    altText: 'White blouse worn with a gold acheik longyi as a two-piece set',
  },
  'festive-celebration-gown': {
    hash: '07/9c/bc/079cbcce9efa129c54b423a2664d85b3',
    altText: 'Maroon satin blouse with a gold acheik longyi for celebrations',
  },
};

function imagesFor(slug: string): { url: string; altText: string }[] {
  const image = PRODUCT_IMAGES[slug];
  if (!image) return [];
  return [
    {
      url: `https://i.pinimg.com/736x/${image.hash}.jpg`,
      altText: image.altText,
    },
  ];
}

// ---------- Orders (sample data for the dashboard) ----------
const sampleOrders = [
  {
    code: 'YP-2026-0001',
    customerName: 'Ma Thida',
    customerPhone: '09-400-000-001',
    channel: 'messenger',
    status: 'DELIVERED' as const,
    note: 'Deliver before Thingyan.',
    items: [
      { slug: 'classic-cotton-yin-phone', quantity: 1 },
      { slug: 'checked-cotton-longyi', quantity: 1 },
    ],
  },
  {
    code: 'YP-2026-0002',
    customerName: 'Daw Khin',
    customerPhone: '09-400-000-002',
    channel: 'viber',
    status: 'CONFIRMED' as const,
    note: null,
    items: [{ slug: 'floral-midi-dress', quantity: 1 }],
  },
  {
    code: 'YP-2026-0003',
    customerName: 'Ko Aung',
    customerPhone: '09-400-000-003',
    channel: 'telegram',
    status: 'NEW' as const,
    note: 'Gift wrap please.',
    items: [{ slug: 'embroidered-yin-phone-white', quantity: 2 }],
  },
];

async function main() {
  console.log('Seeding channels...');
  for (const c of channels) {
    await prisma.channel.upsert({
      where: { slug: c.slug },
      update: c,
      create: c,
    });
  }

  console.log('Seeding categories...');
  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: c,
      create: c,
    });
  }

  console.log('Seeding products and images...');
  const productIds: Record<string, { id: string; priceMmk: number }> = {};
  for (const p of products) {
    const category = await prisma.category.findUniqueOrThrow({
      where: { slug: p.category },
    });
    const { category: _unused, ...data } = p;
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: { ...data, categoryId: category.id },
      create: { ...data, categoryId: category.id },
    });
    productIds[p.slug] = { id: product.id, priceMmk: product.priceMmk };

    // Re-create images so reruns don't duplicate them
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    const images = imagesFor(p.slug);
    if (images.length) {
      await prisma.productImage.createMany({
        data: images.map(({ url, altText }, i) => ({
          url,
          altText,
          sortOrder: i,
          productId: product.id,
        })),
      });
    }
  }

  console.log('Seeding admin user...');
  const email = process.env.SEED_ADMIN_EMAIL ?? 'owner@yinphone.example';
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!password)
    throw new Error('Set SEED_ADMIN_PASSWORD in your .env before seeding.');
  await prisma.adminUser.upsert({
    where: { email },
    update: {}, // never overwrite an existing admin's password on reseed
    create: {
      email,
      name: 'YinPhone Owner',
      role: 'OWNER',
      passwordHash: await hash(password, {
        type: argon2id,
        memoryCost: 19456, // 19 MiB, OWASP minimum for argon2id
        timeCost: 2,
        parallelism: 1,
      }),
      mustChangePassword: true,
    },
  });

  console.log('Seeding sample orders...');
  for (const o of sampleOrders) {
    const channel = await prisma.channel.findUniqueOrThrow({
      where: { slug: o.channel },
    });

    // Totals are computed from database prices, the same way the API will
    const itemsData = o.items.map((i) => ({
      productId: productIds[i.slug].id,
      quantity: i.quantity,
      unitPriceMmk: productIds[i.slug].priceMmk,
    }));
    const totalMmk = itemsData.reduce(
      (sum, i) => sum + i.quantity * i.unitPriceMmk,
      0,
    );

    await prisma.order.upsert({
      where: { code: o.code },
      update: {}, // idempotent: don't change existing orders on reseed
      create: {
        code: o.code,
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        channelId: channel.id,
        status: o.status,
        note: o.note,
        totalMmk,
        items: { create: itemsData },
      },
    });
  }

  console.log('Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
