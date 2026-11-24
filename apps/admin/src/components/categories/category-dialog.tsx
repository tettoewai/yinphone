import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Check, Copy } from "lucide-react"
import { useEffect, useState } from "react"

import { TextField } from "@/components/field"
import {
  categoryDraft,
  fieldError,
  missingFields,
  slugifyCategory,
  storefrontUrl,
  type AdminCategory,
  type CategoryDraft,
  type CategoryDraftField,
} from "@/lib/categories"

type CategoryDialogProps = {
  mode: "add" | "edit"
  /** The row being renamed; required when `mode` is `"edit"`. */
  category?: AdminCategory
  onOpenChange: (open: boolean) => void
  onSave: (draft: CategoryDraft) => void
}

/**
 * The add/edit form from the design.
 *
 * Mounted only while it is open, so each opening starts from the row's current
 * values (or an empty form) without an effect to reset them.
 *
 * The slug is read-only in both modes: it is the category's storefront URL.
 * Editing keeps the existing one so links survive a rename, and a new category
 * derives it from the English name as it is typed. The dialog only validates —
 * the page owns the list and the save.
 */
export function CategoryDialog({
  mode,
  category,
  onOpenChange,
  onSave,
}: CategoryDialogProps) {
  const [draft, setDraft] = useState<CategoryDraft>(() =>
    category ? categoryDraft(category) : { nameMy: "", nameEn: "" }
  )
  const [touched, setTouched] = useState<ReadonlySet<CategoryDraftField>>(
    () => new Set<CategoryDraftField>()
  )
  const [attemptedSave, setAttemptedSave] = useState(false)
  const [copied, setCopied] = useState(false)

  const slug = category ? category.slug : slugifyCategory(draft.nameEn)
  const url = storefrontUrl(slug)
  const missing = missingFields(draft)

  // The confirmation ticks back to the copy glyph rather than staying "Copied"
  // for the rest of the dialog's life.
  useEffect(() => {
    if (!copied) return

    const timer = window.setTimeout(() => setCopied(false), 1600)
    return () => window.clearTimeout(timer)
  }, [copied])

  function errorFor(field: CategoryDraftField) {
    return attemptedSave || touched.has(field)
      ? fieldError(draft, field)
      : undefined
  }

  function update(patch: Partial<CategoryDraft>) {
    setDraft((current) => ({ ...current, ...patch }))
  }

  function blurField(field: CategoryDraftField) {
    setTouched((current) => {
      if (current.has(field)) return current
      const next = new Set(current)
      next.add(field)
      return next
    })
  }

  function save() {
    if (missing.length > 0) {
      setAttemptedSave(true)
      setTouched(new Set(missing))
      return
    }

    onSave({ nameMy: draft.nameMy.trim(), nameEn: draft.nameEn.trim() })
  }

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      // Browsers refuse clipboard writes on insecure origins or without the
      // permission; the URL is already on screen, so there is nothing to undo.
    }
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "အမျိုးအစား အသစ်" : "အမျိုးအစား ပြင်ရန်"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Storefront မီနူးတွင် ပေါ်မည့် အမျိုးအစားအသစ် ဖန်တီးသည်။"
              : "အမည် ပြောင်းနိုင်သည်။ လင့်ခ် (slug) မပြောင်းပါ။"}
          </DialogDescription>
        </DialogHeader>

        <TextField
          id="category-name-my"
          label="အမည် (မြန်မာ)"
          value={draft.nameMy}
          onChange={(nameMy) => update({ nameMy })}
          onBlur={() => blurField("nameMy")}
          error={errorFor("nameMy")}
        />

        <TextField
          id="category-name-en"
          label="Name (English)"
          value={draft.nameEn}
          onChange={(nameEn) => update({ nameEn })}
          onBlur={() => blurField("nameEn")}
          error={errorFor("nameEn")}
        />

        <div className="flex flex-col gap-1.5">
          <div className="font-body text-sm leading-[1.7] font-bold text-foreground">
            Slug{" "}
            <span className="text-xs font-normal text-muted-foreground">
              • /{slug || "…"}
            </span>
          </div>

          <div className="flex min-h-12 items-center justify-between gap-2 rounded-md border border-border bg-muted/60 px-3.5">
            <span className="truncate font-body text-sm text-muted-foreground">
              {url}
            </span>
            <button
              type="button"
              onClick={() => void copyUrl()}
              disabled={!slug}
              aria-label="Copy category URL"
              title={copied ? "Copied" : "Copy link"}
              className="flex size-8 shrink-0 items-center justify-center rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
            >
              {copied ? (
                <Check className="size-[14px]" strokeWidth={3.4} />
              ) : (
                <Copy className="size-[14px]" strokeWidth={3.4} />
              )}
            </button>
          </div>

          <p className="font-body text-xs leading-[1.7] text-muted-foreground">
            {mode === "add"
              ? "အင်္ဂလိပ်အမည်မှ အလိုအလျောက် ဖန်တီးသည်။ မြန်မာစာလုံးသာ ဖြစ်ပါက category ဟု သတ်မှတ်သည်။"
              : "အမည် ပြောင်းလည်း ဤလင့်ခ်သည် မပြောင်းပါ။"}
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="min-h-12 flex-1 px-6 text-sm font-bold"
          >
            Cancel
          </Button>
          <Button
            onClick={save}
            className="min-h-12 flex-1 px-6 text-sm font-bold"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
