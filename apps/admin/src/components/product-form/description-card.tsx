import { Textarea } from "@workspace/ui/components/textarea"

import { FormCard } from "@/components/product-form/form-card"
import { DESCRIPTION_LIMIT, type ProductDraft } from "@/lib/product-form"

type DescriptionCardProps = {
  draft: ProductDraft
  onChange: (patch: Partial<ProductDraft>) => void
}

/** Card 3: the bilingual copy, each capped at the design's 500 characters. */
export function DescriptionCard({ draft, onChange }: DescriptionCardProps) {
  return (
    <FormCard step={3} title="ဖော်ပြချက် • Description" className="gap-3.5">
      <DescriptionField
        id="product-description-my"
        label="မြန်မာ"
        labelEn="Burmese"
        value={draft.descriptionMy}
        onChange={(descriptionMy) => onChange({ descriptionMy })}
      />
      <DescriptionField
        id="product-description-en"
        label="အင်္ဂလိပ်"
        labelEn="English"
        value={draft.descriptionEn}
        onChange={(descriptionEn) => onChange({ descriptionEn })}
      />
    </FormCard>
  )
}

type DescriptionFieldProps = {
  id: string
  label: string
  labelEn: string
  value: string
  onChange: (value: string) => void
}

function DescriptionField({
  id,
  label,
  labelEn,
  value,
  onChange,
}: DescriptionFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="font-body text-sm font-semibold text-foreground"
      >
        {label}{" "}
        <span className="text-xs font-normal text-muted-foreground">
          • {labelEn}
        </span>
      </label>
      <Textarea
        id={id}
        value={value}
        maxLength={DESCRIPTION_LIMIT}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-[84px] rounded-md border-border bg-background px-3.5 py-3 font-body text-sm leading-[1.7] text-foreground focus-visible:border-primary"
      />
      <div className="text-right text-xs text-muted-foreground tabular-nums">
        {value.length} / {DESCRIPTION_LIMIT}
      </div>
    </div>
  )
}
