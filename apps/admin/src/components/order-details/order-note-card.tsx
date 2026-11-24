import { channelName, type ChannelSlug } from "@/lib/orders"

type OrderNoteCardProps = {
  note: string
  /** The note arrived with the checkout form of this channel. */
  channel: ChannelSlug
}

/** The customer's checkout note, quoted and read-only. */
export function OrderNoteCard({ note, channel }: OrderNoteCardProps) {
  return (
    <section className="rounded-lg border border-border bg-card px-5 py-4">
      <h2 className="font-body text-sm leading-[1.7] font-bold text-foreground">
        ဝယ်သူ မှတ်ချက်{" "}
        <span className="font-normal text-muted-foreground">• Order note</span>
      </h2>
      <blockquote className="mt-2 rounded-sm border-l-4 border-accent bg-background px-4 py-3 font-body text-sm leading-[1.7] text-foreground italic">
        {note}
      </blockquote>
      <p className="pt-1.5 text-xs text-muted-foreground">
        Read-only • from {channelName(channel)} checkout form
      </p>
    </section>
  )
}
