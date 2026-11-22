import { Banknote, Repeat, Zap, type LucideIcon } from "lucide-react"

type TrustPoint = {
  icon: LucideIcon
  myanmar: string
  label: string
}

const points: TrustPoint[] = [
  {
    icon: Zap,
    myanmar: "၁ နာရီအတွင်း ပြန်ဖြေပေးပါတယ်",
    label: "Fast reply within 1 hour",
  },
  {
    icon: Banknote,
    myanmar: "ရန်ကုန်မြို့တွင်း အိမ်ရောက်ငွေချေ",
    label: "Cash on delivery in Yangon",
  },
  {
    icon: Repeat,
    myanmar: "၇ ရက်အတွင်း လဲလှယ်နိုင်ပါတယ်",
    label: "Exchange within 7 days",
  },
]

export default function TrustStrip() {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
      {points.map(({ icon: Icon, myanmar, label }) => (
        <div key={label} className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary">
            <Icon className="size-[18px] text-primary" />
          </div>
          <div className="leading-snug">
            <div className="font-body text-sm leading-[1.7] font-medium text-foreground">
              {myanmar}
            </div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
