import {
  PRODUCTS,
  type CatalogProduct,
  type CategoryId,
  type SizeId,
} from "@/components/catalog-data"

export type ProductColor = {
  id: string
  name: string
  hex: string
}

export type ProductDetail = CatalogProduct & {
  gallery: string[]
  description: string
  colors: ProductColor[]
  defaultColorId: string
  defaultSize?: SizeId
}

type ProductExtras = Partial<
  Pick<
    ProductDetail,
    "gallery" | "description" | "colors" | "defaultColorId" | "defaultSize"
  >
>

const COLOR = {
  peach: { id: "peach", name: "Peach", hex: "#E8A87C" },
  sage: { id: "sage", name: "Sage", hex: "#9CAF88" },
  cream: { id: "cream", name: "Cream", hex: "#F5E6D3" },
  teal: { id: "teal", name: "Teal", hex: "#0F5257" },
  white: { id: "white", name: "White", hex: "#FFFFFF" },
  beige: { id: "beige", name: "Beige", hex: "#E8D5C0" },
  natural: { id: "natural", name: "Natural", hex: "#D8B98A" },
} as const

const DESCRIPTIONS: Record<Exclude<CategoryId, "sale">, string> = {
  dresses:
    "ပေါ့ပါးတဲ့ ချည်သားနဲ့ Linen အထည်တွေကို ရန်ကုန်ရဲ့ ပူအိုက်တဲ့ ရာသီဥတုအတွက် ရွေးချယ်ထားပါတယ်။ ချုပ်ရိုးတွေ သပ်ရပ်ပြီး နေ့စဉ်ဝတ်ဆင်ရာမှာ သက်တောင့်သက်သာရှိစေပါတယ်။ ရေအေးနဲ့ လက်ဖြင့် လျှော်ဖွပ်ရန် အကြံပြုပါတယ်။",
  tops: "ပေါ့ပါးတဲ့ ချည်သားနဲ့ ချုပ်ထားတဲ့ အင်္ကျီဖြစ်ပြီး တစ်နေကုန် ဝတ်ဆင်ရတာ သက်တောင့်သက်သာရှိပါတယ်။ ရိုးရာအထည်အလှဆင်မှုနဲ့ ရိုးရှင်းတဲ့ ဂါဝန် ဒါမှမဟုတ် Longyi နဲ့ လိုက်ဖက်ပါတယ်။",
  bags: "ခြင်းကြားနဲ့ လက်ဖြင့် ယက်လုပ်ထားတဲ့ အိတ်ဖြစ်ပြီး နေ့စဉ်အသုံးအဆောင်အတွက် ခိုင်ခံ့ပါတယ်။ သဘာဝအရောင်ဖြစ်တာကြောင့် ဘယ်ဝတ်စုံနဲ့မဆို လိုက်ဖက်ပါတယ်။",
}

const FALLBACK_COLORS: ProductColor[] = [
  { id: "original", name: "Original", hex: "#EFE7DA" },
]

const PRODUCT_EXTRAS: Record<string, ProductExtras> = {
  "peach-midi": {
    gallery: [
      "https://storage.googleapis.com/banani-generated-images/generated-images/ec12ba2c-aaae-4a0e-ad82-f4ecf0d1980b.jpg",
      "https://storage.googleapis.com/banani-generated-images/generated-images/6fab1b18-6a95-4bcf-ad24-22693ad2701e.jpg",
      "https://storage.googleapis.com/banani-generated-images/generated-images/36682d22-6390-4550-83fa-baeb75338f12.jpg",
      "https://storage.googleapis.com/banani-generated-images/generated-images/11f9a972-b19a-45c3-9570-ede98496201c.jpg",
    ],
    description:
      "ပေါ့ပါးသော ချည်သားစစ်စစ်ဖြင့် ချုပ်ထားပြီး ရန်ကုန်ရာသီဥတုနှင့် အထူးသင့်တော်ပါတယ်။ ရင်ကွဲအတိုင်း ချုပ်ရိုးသပ်ရပ်ပြီး နေ့စဉ်ဝတ်အတွက် သက်တောင့်သက်သာရှိစေပါတယ်။ ဒူးအောက်ပိုင်း အရှည်ရှိတာကြောင့် ခါးနဲ့ ခန္ဓာကိုယ်ကို သပ်ရပ်စွာ ဖုံးအုပ်ပေးပါတယ်။ အိတ်ထဲ ထည့်သိမ်းရလွယ်ကူပြီး ခရီးသွားရာမှာလည်း အဆင်ပြေပါတယ်။",
    colors: [COLOR.peach, COLOR.sage, COLOR.cream, COLOR.teal],
    defaultColorId: COLOR.peach.id,
    defaultSize: "M",
  },
  "woven-blouse": {
    colors: [COLOR.white, COLOR.cream],
  },
  "linen-day-dress": {
    colors: [COLOR.sage, COLOR.teal],
  },
  "floral-summer": {
    colors: [COLOR.peach, COLOR.cream, COLOR.sage],
  },
  "knit-cardigan": {
    colors: [COLOR.beige, COLOR.cream],
  },
  "teal-longyi": {
    colors: [COLOR.teal, COLOR.sage],
  },
  "beige-summer": {
    colors: [COLOR.cream, COLOR.beige, COLOR.peach],
  },
  "sage-linen-set": {
    colors: [COLOR.sage, COLOR.teal],
  },
  "cotton-blouse": {
    colors: [COLOR.white, COLOR.cream],
  },
  "rattan-handbag": {
    colors: [COLOR.natural],
  },
}

export function getProductDetail(id: string): ProductDetail | undefined {
  const product = PRODUCTS.find((entry) => entry.id === id)
  if (!product) return undefined

  const extras = PRODUCT_EXTRAS[id] ?? {}
  const colors = extras.colors ?? FALLBACK_COLORS

  return {
    ...product,
    gallery: extras.gallery ?? [product.image],
    description: extras.description ?? DESCRIPTIONS[product.category],
    colors,
    defaultColorId: extras.defaultColorId ?? colors[0]?.id ?? "",
    defaultSize: extras.defaultSize ?? product.sizes[0],
  }
}

export function getRelatedProducts(
  product: CatalogProduct,
  limit = 4
): CatalogProduct[] {
  const sameCategory = PRODUCTS.filter(
    (entry) => entry.id !== product.id && entry.category === product.category
  )
  const rest = PRODUCTS.filter(
    (entry) => entry.id !== product.id && entry.category !== product.category
  )

  return [...sameCategory, ...rest].slice(0, limit)
}
