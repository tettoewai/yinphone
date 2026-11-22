import type { Metadata } from "next"

import SavedView from "@/components/saved-view"

export const metadata: Metadata = {
  title: "Saved items — YinPhone",
  description:
    "YinPhone တွင် သိမ်းထားသော အထည်များ — မှာယူရန် ပြန်ဖွင့်ကြည့်နိုင်ပါတယ်။",
}

export default function SavedPage() {
  return (
    <div className="mx-auto w-full max-w-md min-w-0 flex-1 bg-background font-body">
      <SavedView />
    </div>
  )
}
