import { MessageCircle } from "lucide-react"
import type { Metadata } from "next"

import ContactAddressCard from "@/components/contact-address-card"
import { CONTACT, FAQS } from "@/components/contact-data"
import ContactFaq from "@/components/contact-faq"
import ContactHeader from "@/components/contact-header"
import ContactHours from "@/components/contact-hours"
import ContactMap from "@/components/contact-map"
import ContactQuickActions from "@/components/contact-quick-actions"

export const metadata: Metadata = {
  title: "Contact — YinPhone",
  description:
    "YinPhone Boutique Yangon ကို Messenger၊ Viber၊ Telegram သို့မဟုတ် ဖုန်းဖြင့် ဆက်သွယ်မှာယူနိုင်ပါတယ်။ ဖွင့်ချိန်နှင့် မေးလေ့ရှိသော မေးခွန်းများ။",
}

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-md min-w-0 flex-1 bg-background font-body">
      <ContactHeader />

      <section className="flex flex-col gap-2.5 px-4 pt-4">
        <h2 className="text-sm font-bold text-foreground">အမြန်ဆက်သွယ်ရန်</h2>
        <ContactQuickActions />
        <p className="text-center font-body text-xs leading-[1.7] text-muted-foreground">
          ပုံပို့ပြီး မှာယူလိုက်ပါ — ၁ နာရီအတွင်း ပြန်ဖြေပေးပါတယ်
        </p>
      </section>

      <section className="px-4 pt-5">
        <ContactAddressCard />
      </section>

      <section aria-label="Map" className="px-4 pt-3">
        <ContactMap />
      </section>

      <section className="flex flex-col gap-2.5 px-4 pt-5">
        <h2 className="font-heading text-base font-bold text-foreground">
          ဖွင့်ချိန် • Hours
        </h2>
        <ContactHours />
      </section>

      <section className="flex flex-col gap-2.5 px-4 pt-5 pb-6">
        <h2 className="font-heading text-base font-bold text-foreground">
          မေးလေ့ရှိသောမေးခွန်းများ
        </h2>

        <ContactFaq items={FAQS} />

        <a
          href={CONTACT.messengerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-md bg-messenger text-sm font-bold text-primary-foreground"
        >
          <MessageCircle className="size-[17px]" strokeWidth={2.82} />
          <span className="font-body">Messenger တွင် မေးရန်</span>
        </a>
      </section>
    </div>
  )
}
