/*
 * Formato E.164 para wa.me
 * ─────────────────────────────
 * WhatsApp exige el número sin signos +, sin guiones, sin paréntesis.
 *
 * Para Argentina:
 *   54      = código de país
 *   9       = prefijo de celular (controvertido — algunos carriers
 *            no lo requieren en wa.me. Probar con y sin él.)
 *   358     = código de área (Río Cuarto, sin el 0)
 *   5123456 = número local
 *
 * fullNumber = "5493585123456" (con 9) o "543585123456" (sin 9).
 * Cambiar mobilePrefix a '' si el número no funciona con 9.
 */
export const WHATSAPP_CONFIG = {
  countryCode: '54',
  mobilePrefix: '9',
  areaCode: '358',
  phoneNumber: '5123456',
  get fullNumber(): string {
    return `${this.countryCode}${this.mobilePrefix}${this.areaCode}${this.phoneNumber}`;
  },
} as const;
