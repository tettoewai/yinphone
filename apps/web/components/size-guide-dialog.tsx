"use client"

import { MessageCircle } from "lucide-react"

import BottomSheet from "@/components/bottom-sheet"
import { CONTACT } from "@/components/contact-data"
import type { SizeId } from "@/components/catalog-data"

const MEASUREMENTS: {
  size: SizeId
  bust: string
  waist: string
  hip: string
  length: string
}[] = [
  { size: "S", bust: "32–34", waist: "26–28", hip: "34–36", length: "38" },
  { size: "M", bust: "34–36", waist: "28–30", hip: "36–38", length: "39" },
  { size: "L", bust: "36–38", waist: "30–32", hip: "38–40", length: "40" },
  { size: "XL", bust: "38–40", waist: "32–34", hip: "40–42", length: "41" },
]

type SizeGuideDialogProps = {
  sizes: SizeId[]
  onClose: () => void
}

export default function SizeGuideDialog({
  sizes,
  onClose,
}: SizeGuideDialogProps) {
  const available = sizes.length
    ? MEASUREMENTS.filter((row) => sizes.includes(row.size))
    : MEASUREMENTS

  return (
    <BottomSheet
      title="ဆိုဒ် လမ်းညွှန်"
      description="Size guide • inches"
      onClose={onClose}
    >
      <div className="px-4 pb-4">
        <div className="overflow-hidden rounded-md border border-border">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-secondary text-left">
                <th scope="col" className="px-3 py-2 font-semibold">
                  Size
                </th>
                <th scope="col" className="px-3 py-2 font-semibold">
                  Bust
                </th>
                <th scope="col" className="px-3 py-2 font-semibold">
                  Waist
                </th>
                <th scope="col" className="px-3 py-2 font-semibold">
                  Hip
                </th>
                <th scope="col" className="px-3 py-2 font-semibold">
                  Length
                </th>
              </tr>
            </thead>
            <tbody>
              {available.map((row) => (
                <tr key={row.size} className="border-t border-border">
                  <th scope="row" className="px-3 py-2 font-bold">
                    {row.size}
                  </th>
                  <td className="px-3 py-2 text-muted-foreground">
                    {row.bust}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {row.waist}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{row.hip}</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {row.length}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="pt-3 font-body text-xs leading-[1.8] text-muted-foreground">
          ချည်သားနဲ့ လက်ဖြင့်ချုပ်ထားတာဖြစ်လို့ ၁–၂ လက်မ ကွာနိုင်ပါတယ်။
          သင့်တော်မှာ မသေချာရင် ဆိုင်ကို မေးပါ။
        </p>
        <p className="pt-1 text-xs text-muted-foreground">
          Handmade cotton can vary by 1–2 inches. Ask us if you are between sizes.
        </p>

        <a
          href={CONTACT.messengerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-md bg-messenger text-sm font-bold text-primary-foreground"
        >
          <MessageCircle className="size-[17px]" strokeWidth={2.82} />
          <span className="font-body">Messenger တွင် မေးရန်</span>
        </a>
      </div>
    </BottomSheet>
  )
}
