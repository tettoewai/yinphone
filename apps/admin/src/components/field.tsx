import { Eye, EyeOff, Check, CircleExclamationPoint } from "lucide-react"
import { type ReactNode, useState } from "react"
import { cn } from "@workspace/ui/lib/utils"

/**
 * The admin field pattern from the design: a bilingual label, a 48px input
 * well with a 2px border, and a single line underneath reserved for either a
 * hint or an error — errors never shift the layout.
 */

const inputShell =
  "flex min-h-12 items-center gap-2 rounded-md border-2 bg-input px-3.5 transition-colors focus-within:border-primary"

const inputText =
  "w-full flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"

type FieldProps = {
  id: string
  label: string
  labelEn: string
  /** Right-aligned marker in the label row, e.g. the product form's "Required". */
  aside?: ReactNode
  hint?: string
  error?: string
  children: ReactNode
}

export function Field({
  id,
  label,
  labelEn,
  aside,
  hint,
  error,
  children,
}: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="flex items-baseline justify-between gap-2 font-body text-sm leading-[1.7] font-bold text-foreground"
      >
        <span>
          {label}{" "}
          <span className="text-xs font-normal text-muted-foreground">
            • {labelEn}
          </span>
        </span>
        {aside ? (
          <span className="shrink-0 text-xs font-normal text-muted-foreground">
            {aside}
          </span>
        ) : null}
      </label>
      {children}
      {error ? (
        <p
          id={`${id}-message`}
          className="flex items-start gap-1.5 font-body text-xs leading-[1.7] text-accent-foreground"
        >
          <CircleExclamationPoint
            className="mt-0.5 size-[13px] shrink-0"
            strokeWidth={3.7}
          />
          {error}
        </p>
      ) : hint ? (
        <p className="font-body text-xs leading-[1.7] text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

type TextFieldProps = {
  id: string
  label: string
  labelEn: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  type?: "text" | "email"
  autoComplete?: string
  placeholder?: string
  aside?: ReactNode
  hint?: string
  error?: string
  disabled?: boolean
}

export function TextField({
  id,
  label,
  labelEn,
  value,
  onChange,
  onBlur,
  type = "text",
  autoComplete,
  placeholder,
  aside,
  hint,
  error,
  disabled,
}: TextFieldProps) {
  return (
    <Field
      id={id}
      label={label}
      labelEn={labelEn}
      aside={aside}
      hint={hint}
      error={error}
    >
      <div
        className={cn(inputShell, error ? "border-accent" : "border-border")}
      >
        <input
          id={id}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          autoComplete={autoComplete}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-message` : undefined}
          className={inputText}
        />
      </div>
    </Field>
  )
}

type PasswordFieldProps = {
  id: string
  label: string
  labelEn: string
  value: string
  onChange: (value: string) => void
  autoComplete?: string
  hint?: string
  error?: string
  disabled?: boolean
}

export function PasswordField({
  id,
  label,
  labelEn,
  value,
  onChange,
  autoComplete,
  hint,
  error,
  disabled,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)

  return (
    <Field id={id} label={label} labelEn={labelEn} hint={hint} error={error}>
      <div
        className={cn(inputShell, error ? "border-accent" : "border-border")}
      >
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-message` : undefined}
          className={inputText}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-pressed={visible}
          aria-label={visible ? "Hide password" : "Show password"}
          disabled={disabled}
          className="flex min-h-11 shrink-0 items-center gap-1 px-1 text-xs font-semibold text-primary"
        >
          {visible ? (
            <EyeOff className="size-4" strokeWidth={3} />
          ) : (
            <Eye className="size-4" strokeWidth={3} />
          )}
          {visible ? "Hide" : "Show"}
        </button>
      </div>
    </Field>
  )
}

type CheckboxFieldProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  labelEn: string
  disabled?: boolean
}

export function CheckboxField({
  checked,
  onChange,
  label,
  labelEn,
  disabled,
}: CheckboxFieldProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className="flex min-h-11 w-full items-center justify-between gap-3 text-left"
    >
      <span className="flex items-center gap-2.5">
        <span
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-sm border-2 transition-colors",
            checked ? "border-primary bg-primary" : "border-border bg-input"
          )}
        >
          {checked ? (
            <Check
              className="size-[15px] text-primary-foreground"
              strokeWidth={3.2}
            />
          ) : null}
        </span>
        <span className="font-body text-sm leading-[1.7] text-foreground">
          {label}
        </span>
      </span>
      <span className="text-xs text-muted-foreground">{labelEn}</span>
    </button>
  )
}
