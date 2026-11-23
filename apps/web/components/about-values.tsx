import {
  BadgeCheck,
  HeartHandshake,
  Truck,
  type LucideIcon,
} from "lucide-react"
import { getTranslations } from "next-intl/server"

type Value = {
  id: string
  icon: LucideIcon
  labelKey: "values.locallyMade" | "values.ships" | "values.fairPrices"
}

const values: Value[] = [
  { id: "local", icon: HeartHandshake, labelKey: "values.locallyMade" },
  { id: "ships", icon: Truck, labelKey: "values.ships" },
  { id: "prices", icon: BadgeCheck, labelKey: "values.fairPrices" },
]

export default async function AboutValues() {
  const t = await getTranslations("About")

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {values.map(({ id, icon: Icon, labelKey }) => (
        <div
          key={id}
          className="flex flex-col items-center gap-2 rounded-md border border-border bg-card px-2 py-4 text-center"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary">
            <Icon className="size-5 text-primary" strokeWidth={2.4} />
          </span>
          <div className="font-body text-[13px] leading-[1.6] font-bold text-foreground">
            {t(labelKey)}
          </div>
        </div>
      ))}
    </div>
  )
}
