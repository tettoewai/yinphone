"use client"

import { MessageCircle } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import BottomSheet from "@/components/bottom-sheet"
import { CONTACT } from "@/components/contact-data"
import type { SizeId } from "@/components/catalog-data"
import { localizeDigits } from "@/lib/format"

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
  const locale = useLocale()
  const t = useTranslations("Product.sizeGuide")

  const available = sizes.length
    ? MEASUREMENTS.filter((row) => sizes.includes(row.size))
    : MEASUREMENTS

  const columns = [
    {
      id: "size",
      label: t("size"),
      cell: (row: (typeof MEASUREMENTS)[number]) => row.size,
    },
    {
      id: "bust",
      label: t("bust"),
      cell: (row: (typeof MEASUREMENTS)[number]) =>
        localizeDigits(row.bust, locale),
    },
    {
      id: "waist",
      label: t("waist"),
      cell: (row: (typeof MEASUREMENTS)[number]) =>
        localizeDigits(row.waist, locale),
    },
    {
      id: "hip",
      label: t("hip"),
      cell: (row: (typeof MEASUREMENTS)[number]) =>
        localizeDigits(row.hip, locale),
    },
    {
      id: "length",
      label: t("length"),
      cell: (row: (typeof MEASUREMENTS)[number]) =>
        localizeDigits(row.length, locale),
    },
  ]

  return (
    <BottomSheet title={t("title")} description={t("unit")} onClose={onClose}>
      <div className="px-4 pb-4">
        <div className="overflow-hidden rounded-md border border-border">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-secondary text-left">
                {columns.map((column) => (
                  <th
                    key={column.id}
                    scope="col"
                    className="px-3 py-2 font-semibold"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {available.map((row) => (
                <tr key={row.size} className="border-t border-border">
                  {columns.map((column, index) => (
                    <td
                      key={column.id}
                      className={
                        index === 0
                          ? "px-3 py-2 font-bold"
                          : "px-3 py-2 text-muted-foreground"
                      }
                    >
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="pt-3 font-body text-xs leading-[1.8] text-muted-foreground">
          {t("note")}
        </p>

        <a
          href={CONTACT.messengerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-md bg-messenger text-sm font-bold text-primary-foreground"
        >
          <MessageCircle className="size-[17px]" strokeWidth={2.82} />
          <span className="font-body">{t("ask")}</span>
        </a>
      </div>
    </BottomSheet>
  )
}
