import {
  BadgeCheck,
  HeartHandshake,
  Truck,
  type LucideIcon,
} from "lucide-react"

type Value = {
  icon: LucideIcon
  myanmar: string
  label: string
}

const values: Value[] = [
  {
    icon: HeartHandshake,
    myanmar: "ပြည်တွင်းချုပ်",
    label: "Locally made",
  },
  {
    icon: Truck,
    myanmar: "တစ်နိုင်ငံလုံးပို့ပေး",
    label: "Ships across Myanmar",
  },
  {
    icon: BadgeCheck,
    myanmar: "ဈေးမှန်မှန်",
    label: "Fair prices",
  },
]

export default function AboutValues() {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {values.map(({ icon: Icon, myanmar, label }) => (
        <div
          key={label}
          className="flex flex-col items-center gap-2 rounded-md border border-border bg-card px-2 py-4 text-center"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary">
            <Icon className="size-5 text-primary" strokeWidth={2.4} />
          </span>
          <div className="font-body text-[13px] leading-[1.6] font-bold text-foreground">
            {myanmar}
          </div>
          <div className="-mt-1 text-[11px] leading-tight text-muted-foreground">
            {label}
          </div>
        </div>
      ))}
    </div>
  )
}
