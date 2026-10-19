// `User.phone` puede traer datos viejos en texto libre (de antes de que los
// forms de registro usaran `react-phone-number-input`, ver CLAUDE.md) — esa
// librería tira error si se le pasa un `value` que no sea E.164, así que
// cualquier `user.phone` que se use como valor inicial de un <PhoneInput>
// tiene que pasar por acá primero.
const E164_RE = /^\+[1-9]\d{6,14}$/;

export function sanitizePhone(phone: string | null | undefined): string {
  return phone && E164_RE.test(phone) ? phone : "";
}
