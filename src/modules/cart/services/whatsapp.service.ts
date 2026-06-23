import type { CartItem } from '../stores/cart.store';
import type { CustomerFormData } from '../../customer/stores/customer.store';
import { buildOrderMessage } from '../../../infrastructure/whatsapp/message.builder';
import type { BuildOrderMessageParams } from '../../../infrastructure/whatsapp/message.builder';
import { WhatsAppRepository } from '../../../infrastructure/whatsapp/whatsapp.repository';

const repo = new WhatsAppRepository();

export function generateOrderLink(
  cartItems: CartItem[],
  customerData: CustomerFormData,
  totalUSD: number,
): string {
  /*
   * Guard defensivo: si el carrito está vacío o los datos son
   * inválidos, abortamos con error en lugar de generar un link
   * con datos basura. Esto protege contra llamadas directas
   * desde la consola o desde flujos no controlados.
   */
  if (!isOrderValid(cartItems, customerData)) {
    throw new Error('No se puede generar el pedido: carrito vacío o datos incompletos.');
  }

  /*
   * Convierte los tipos del módulo (CartItem, CustomerFormData)
   * al tipo interno del builder (BuildOrderMessageParams) para
   * mantener la infraestructura desacoplada de los stores.
   */
  const params: BuildOrderMessageParams = {
    customerNombre: customerData.nombre,
    customerApellido: customerData.apellido,
    customerTelefono: customerData.telefono,
    metodoEntrega: customerData.metodoEntrega,
    metodoPago: customerData.metodoPago,
    items: cartItems.map((item) => ({
      quantity: item.quantity,
      productName: (item.product.marca ?? '') + ' ' + (item.product.modelo ?? ''),
      productSpec: (item.product.almacenamiento ?? '') + ' - ' + (item.selectedColor ?? ''),
      subtotal: item.product.precio * item.quantity,
    })),
    totalUSD,
  };

  const message = buildOrderMessage(params);

  /*
   * WhatsAppRepository.generateLink() aplica encodeURIComponent()
   * sobre el mensaje completo para garantizar que caracteres como
   * ñ, tildes, ®, ™, emojis y saltos de línea no rompan la URL.
   * El encode es ÚNICO — no hay concatenaciones parciales ni
   * escapes duplicados.
   */
  return repo.generateLink(message);
}

export function isOrderValid(
  cartItems: CartItem[],
  customerData: CustomerFormData,
): boolean {
  if (!Array.isArray(cartItems) || cartItems.length === 0) return false;

  const nom = customerData.nombre.trim();
  const ape = customerData.apellido.trim();
  const tel = customerData.telefono.replace(/\D/g, '');

  return nom.length >= 2 && ape.length >= 2 && tel.length >= 7;
}
