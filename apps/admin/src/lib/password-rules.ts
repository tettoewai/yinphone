/**
 * Password policy for the two screens that set a password: the forced change
 * after first sign-in and the email-OTP reset.
 *
 * Stricter than the API's 8-character floor on purpose — these are the only
 * places a password is chosen, so they ask for 10 plus a digit.
 */

export type PasswordRule = {
  id: string
  label: string
  test: (value: string) => boolean
}

export function passwordRules(email: string): PasswordRule[] {
  return [
    {
      id: "length",
      label: "At least 10 characters • အနည်းဆုံး ၁၀ လုံး",
      test: (value) => value.length >= 10,
    },
    {
      id: "number",
      label: "One number • ဂဏန်း တစ်လုံးပါရမည်",
      test: (value) => /\d/.test(value),
    },
    {
      id: "letter",
      label: "One letter • အက္ခရာ တစ်လုံးပါရမည်",
      test: (value) => /\p{L}/u.test(value),
    },
    {
      id: "distinct",
      label: "Not the same as the email • အီးမေးလ်နဲ့ မတူရပါ",
      test: (value) =>
        value.length > 0 && value.toLowerCase() !== email.toLowerCase(),
    },
  ]
}

export function isNewPasswordValid(
  email: string,
  password: string,
  confirm: string
) {
  return (
    password.length > 0 &&
    confirm === password &&
    passwordRules(email).every((rule) => rule.test(password))
  )
}
