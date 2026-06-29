import { clearCart, closeCart, $cartState } from '../stores/cart.store';
import { buildCartNotes } from '../../checkout/services/cal.service';
import type { CalBookingModal } from './cart-calbooking';

export function handleCheckout(calBooking: CalBookingModal): void {
  const cart = $cartState.get();
  if (cart.items.length === 0) return;

  const notes = buildCartNotes(
    cart.items.map(function (item) {
      return {
        marca: item.product.marca ?? '',
        modelo: item.product.modelo ?? '',
        almacenamiento: item.product.almacenamiento ?? '',
        color: item.selectedColor,
        quantity: item.quantity,
      };
    }),
  );

  closeCart();
  calBooking.open(notes);
}

export function handleBookingSuccess(): void {
  clearCart();
  closeCart();
}
