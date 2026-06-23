import { $cartState } from '../../cart/stores/cart.store';
import { $customer } from '../../customer/stores/customer.store';
import { generateOrderLink, isOrderValid } from '../../cart/services/whatsapp.service';

const ID = 'submit-order';

const btn    = document.getElementById(ID + '-btn');
const label  = document.getElementById(ID + '-label');
const spinner = document.getElementById(ID + '-spinner');

function setLoading(loading: boolean): void {
  if (!(btn instanceof HTMLButtonElement) || !label || !spinner) return;
  btn.disabled = loading;
  label.style.display = loading ? 'none' : '';
  spinner.style.display = loading ? '' : 'none';
}

function setEnabled(enabled: boolean): void {
  if (!(btn instanceof HTMLButtonElement)) return;
  btn.disabled = !enabled;
}

function handleClick(): void {
  const cart = $cartState.get();
  const customer = $customer.get();

  if (!isOrderValid(cart.items, customer)) {
    console.warn('[SubmitOrderButton] Pedido inválido — carrito vacío o datos incompletos.');
    return;
  }

  let url: string;

  try {
    url = generateOrderLink(cart.items, customer, cart.total);
  } catch (err) {
    console.error('[SubmitOrderButton] Error al generar el link:', err);
    return;
  }

  /*
   * Estrategia de apertura en dos fases:
   *
   * 1. window.open() se ejecuta INMEDIATAMENTE, antes de cualquier
   *    mutación del DOM (setLoading). Esto maximiza la probabilidad
   *    de que el navegador lo considere un gesto de usuario directo
   *    y NO lo bloquee como popup.
   *
   * 2. Si window.open() retorna null (bloqueado por Safari iOS,
   *    Chrome Android, o extensiones), caemos a location.href como
   *    plan B. El usuario abandona la página de piksel pero el
   *    pedido se envía igual — los datos sobreviven en localStorage.
   */
  const win = window.open(url, '_blank');

  if (!win) {
    /* Fallback: navegación directa si el popup fue bloqueado */
    window.location.href = url;
    return;
  }

  setLoading(true);
  setTimeout(() => setLoading(false), 5000);
}

btn?.addEventListener('click', handleClick);

/* ── Suscripciones reactivas ── */

$cartState.subscribe(cart => {
  const customer = $customer.get();
  setEnabled(isOrderValid(cart.items, customer));
});

$customer.subscribe(customer => {
  const cart = $cartState.get();
  setEnabled(isOrderValid(cart.items, customer));
});
