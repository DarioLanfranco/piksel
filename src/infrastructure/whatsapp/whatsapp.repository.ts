import { WHATSAPP_CONFIG } from '../../app/config/whatsapp.config';

const WA_ME_TEXT_MAX = 2048;

export class WhatsAppRepository {
  private readonly baseUrl = 'https://wa.me';

  generateLink(message: string): string {
    const phone = WHATSAPP_CONFIG.fullNumber;

    /*
     * encodeURIComponent transforma cualquier carácter especial
     * (saltos de línea \n, tildes, ñ, emojis, asteriscos, etc.)
     * en percent-encoding seguro para URL.
     *
     * Sin esto, un producto "iPhone 15 Pro Max®" con un cliente
     * "José Pérez" inyectaría caracteres que rompen el query string
     * y WhatsApp recibe el mensaje truncado en el primer carácter
     * no-ASCII.
     */
    const encoded = encodeURIComponent(message);

    /*
     * wa.me trunca silenciosamente el parámetro text después de
     * aproximadamente 2048 caracteres. Si el carrito tiene muchos
     * items, cortamos el mensaje antes de ese límite para evitar
     * que se pierda el total.
     */
    const safe = encoded.length > WA_ME_TEXT_MAX
      ? encoded.slice(0, WA_ME_TEXT_MAX)
      : encoded;

    return this.baseUrl + '/' + phone + '?text=' + safe;
  }
}
