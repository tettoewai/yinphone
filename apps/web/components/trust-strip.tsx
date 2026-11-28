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

/**
 * The service promises, set as a hairline row rather than a bordered card so it
 * reads as a footnote to the grids instead of another panel competing with them.
 */
export default async function TrustStrip() {
  const t = await getTranslations("Home")

  return (
    <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8">
      <div className="grid gap-5 border-y border-border py-8 md:grid-cols-3 md:gap-8">
        {points.map(({ id, icon: Icon, labelKey }) => (
          <div key={id} className="flex items-start gap-3">
            <Icon
              className="mt-0.5 size-[18px] shrink-0 text-primary"
              strokeWidth={1.7}
            />
            <span className="text-sm leading-[1.7] font-medium text-foreground">
              {t(labelKey)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
