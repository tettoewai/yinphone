import { ArrowRight, Quote } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import AboutHeader from "@/components/about-header"
import AboutHero from "@/components/about-hero"
import AboutValues from "@/components/about-values"

export const metadata: Metadata = {
  title: "About — YinPhone",
  description:
    "YinPhone ဆိုင်ရဲ့ ဇာတ်လမ်း — ၂၀၁၉ ကတည်းက ရန်ကုန်မှာ ချည်သားအဝတ်အစားတွေကို ဈေးမှန်မှန်နဲ့ ချုပ်လုပ်ပြီး တစ်နိုင်ငံလုံးကို ပို့ပေးနေပါတယ်။",
}

const stats = [
  { value: "5k+", label: "ဝယ်သူများ" },
  { value: "300+", label: "ဒီဇိုင်းများ" },
  { value: "4.9", label: "Rating" },
]

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-md min-w-0 flex-1 bg-background font-body">
      <AboutHeader />
      <AboutHero />

      <section className="flex flex-col gap-3 px-4 pt-4">
        <h2 className="font-body text-xl leading-[1.7] font-bold text-foreground">
          ချည်သားကို ချစ်တဲ့ဆိုင်လေး
        </h2>
        <p className="font-body text-sm leading-[1.9] text-foreground">
          YinPhone ကို ၂၀၁၉ မှာ ဗိုလ်ချုပ်ဈေးအနီးက ဆိုင်ခန်းသေးသေးလေးကနေ
          စခဲ့တာပါ။ ရန်ကုန်ရာသီဥတုနဲ့ ကိုက်ညီတဲ့ ပေါ့ပါးတဲ့ ချည်ထည်လေးတွေကို
          ဈေးမှန်မှန်နဲ့ ဝတ်စေချင်တဲ့ စိတ်ကူးကနေ စတင်ခဲ့တာဖြစ်ပါတယ်။
        </p>
        <p className="font-body text-sm leading-[1.9] text-foreground">
          အခုတော့ တစ်နိုင်ငံလုံးက ညီမလေးတွေကို Messenger, Viber, Telegram ကနေ
          ပုံပို့မှာယူစနစ်နဲ့ ပို့ပေးနေပါပြီ။ အထည်တိုင်းကို ဆိုင်မှာကိုယ်တိုင်
          စစ်ဆေးပြီး သေချာထုပ်ပိုးပေးပါတယ်။
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-secondary">
            <Quote className="size-[13px] text-primary" strokeWidth={3.7} />
          </span>
          <span className="font-body">— Ma Yin, founder</span>
        </div>
      </section>

      <section aria-label="Why shop with YinPhone" className="px-4 pt-5">
        <AboutValues />
      </section>

      <section aria-label="Shop highlights" className="px-4 pt-3">
        <div className="flex items-center justify-between rounded-md bg-primary px-4 py-3.5">
          {stats.map(({ value, label }) => (
            <div key={label} className="flex-1 text-center">
              <div className="font-heading text-lg font-bold text-primary-foreground">
                {value}
              </div>
              <div className="font-body text-xs text-primary-foreground/80">
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 pt-5 pb-6">
        <Link
          href="/catalog"
          className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-md bg-accent text-[15px] font-bold text-accent-foreground"
        >
          Browse the collection
          <ArrowRight className="size-[17px]" strokeWidth={2.82} />
        </Link>
        <p className="pt-2 text-center font-body text-xs leading-[1.7] text-muted-foreground">
          စုဆောင်းမှုအသစ်များ ကြည့်ရန် catalog သို့ သွားပါ
        </p>
      </section>
    </div>
  )
}
