import { Leaf } from "lucide-react"
import Image from "next/image"

export default function AboutHero() {
  return (
    <div className="relative">
      <Image
        src="https://storage.googleapis.com/banani-generated-images/generated-images/11a83a0a-929f-4019-8eb9-39abb987e3f8.jpg"
        alt="YinPhone boutique shop front with cotton dresses on display and the owner smiling in morning light"
        width={900}
        height={675}
        sizes="(min-width: 448px) 448px, 100vw"
        priority
        className="aspect-[4/3] w-full object-cover"
      />
      <div className="absolute right-4 bottom-3 left-4 flex items-center gap-3 rounded-md border border-border bg-card/95 px-4 py-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary">
          <Leaf
            className="size-[19px] text-primary-foreground"
            strokeWidth={2.53}
          />
        </span>
        <div className="min-w-0">
          <div className="font-heading text-base leading-tight font-bold text-foreground">
            YinPhone Boutique Yangon
          </div>
          <div className="font-body text-xs text-muted-foreground">
            2019 ကတည်းက • Yangon • Chat-first shop
          </div>
        </div>
      </div>
    </div>
  )
}
