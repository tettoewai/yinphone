# Local fonts

Self-hosted font files for this app. Paths are resolved relative to the file
that calls `localFont`, so `app/layout.tsx` uses `"./fonts/<file>"`.

- `font-body.ttf` → `--font-font-body` → mapped to `--font-body`
- `font-heading.ttf` → `--font-font-heading` → mapped to `--font-heading`

The `font-body` and `font-heading` utilities are defined in
`packages/ui/src/styles/globals.css`:

```css
@theme inline {
  --font-heading:
    var(--font-font-heading), var(--font-font-body), var(--font-sans);
  --font-body: var(--font-font-body), var(--font-sans);
}
```

`font-body` is applied to `<body>` and `font-heading` to `h1`–`h6` in the base
layer, so components get the right family without extra classes.

`font-heading.ttf` (“Jaguar”) is Latin-only and single-weight, so Myanmar text
inside headings falls back to `font-body.ttf` (“KoZ 009 Uni”), which covers both
Myanmar and Latin. Both files ship a single 400 weight — `font-bold` on them is
synthesized by the browser.

Both `*.variable` class names must be applied on `<html>` in `app/layout.tsx`
(`cn(..., myanmarBody.variable, myanmarHeading.variable)`) so the variables are
available to every component.
