import { Banknote, Repeat, Zap, type LucideIcon } from "lucide-react"
import { getTranslations } from "next-intl/server"

type TrustPoint = {
  id: string
  icon: LucideIcon
  labelKey: "trust.fastReply" | "trust.cod" | "trust.exchange"
}

const points: TrustPoint[] = [
  { id: "fast-reply", icon: Zap, labelKey: "trust.fastReply" },
  { id: "cod", icon: Banknote, labelKey: "trust.cod" },
  { id: "exchange", icon: Repeat, labelKey: "trust.exchange" },
]

export default async function TrustStrip() {
  const t = await getTranslations("Home")

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
      {points.map(({ id, icon: Icon, labelKey }) => (
        <div key={id} className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary">
            <Icon className="size-[18px] text-primary" />
          </div>
          <div className="font-body text-sm leading-[1.7] font-medium text-foreground">
            {t(labelKey)}
          </div>
        </div>
      ))}
    </div>
  )
}
