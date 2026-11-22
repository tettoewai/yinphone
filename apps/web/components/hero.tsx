import { ArrowRight, MessageCircle, Sparkles } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { CONTACT } from "@/components/contact-data"

export default function Hero() {
  return (
    <div className="relative">
      <Image
        src="https://storage.googleapis.com/banani-generated-images/generated-images/d7b15390-4c2f-4883-ae89-fbd890b38b4a.jpg"
        alt="Young woman in a light beige cotton summer dress in a bright Yangon shop doorway"
        width={900}
        height={1125}
        sizes="(min-width: 448px) 448px, 100vw"
        priority
        className="aspect-[4/5] max-h-[520px] w-full object-cover"
      />
      <div className="absolute inset-0 flex flex-col justify-end bg-linear-to-t from-black/55 via-black/10 to-transparent p-4">
        <div className="flex flex-col gap-2 rounded-lg bg-card/95 p-4 shadow-sm">
          <div className="inline-flex items-center gap-1 self-start rounded-sm bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
            <Sparkles className="size-3" />
            New Season • ရန်ကုန်
          </div>
          <h1 className="font-body text-2xl leading-[1.7] font-bold text-foreground">
            ရာသီအလိုက် အဝတ်အစား
          </h1>
          <p className="-mt-1 text-sm text-muted-foreground">
            Seasonal fashion, delivered by chat
          </p>
          <div className="mt-1 flex gap-2">
            <Link
              href="/catalog"
              className="flex min-h-[48px] flex-1 items-center justify-center gap-1.5 rounded-md bg-accent text-sm font-bold text-accent-foreground"
            >
              Shop now
              <ArrowRight className="size-4" />
            </Link>
            <a
              href={CONTACT.messengerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[48px] flex-1 items-center justify-center gap-1.5 rounded-md bg-messenger text-sm font-bold text-primary-foreground"
            >
              <MessageCircle className="size-4" />
              <span className="font-body">Messenger</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
