import { $cartState } from '../../cart/stores/cart.store';
import { openCalModalWithFallback, buildCartNotes } from '../services/cal.service';

const ID = 'submit-order';

const btn = document.getElementById(ID + '-btn');

function setEnabled(enabled: boolean): void {
  if (!(btn instanceof HTMLButtonElement)) return;
  btn.disabled = !enabled;
}

function handleClick(): void {
  const cart = $cartState.get();

  if (cart.items.length === 0) {
    console.warn('[SubmitOrderButton] Carrito vacío — no se puede agendar.');
    return;
  }

  const notes = buildCartNotes(
    cart.items.map(item => ({
      marca: item.product.marca ?? '',
      modelo: item.product.modelo ?? '',
      almacenamiento: item.product.almacenamiento ?? '',
      color: item.selectedColor,
      quantity: item.quantity,
    })),
  );

  openCalModalWithFallback(notes);
}

btn?.addEventListener('click', handleClick);

$cartState.subscribe(cart => {
  setEnabled(cart.items.length > 0);
});
