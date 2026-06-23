import { $customer, updateCustomerData } from '../../customer/stores/customer.store';
import type { MetodoEntrega, MetodoPago } from '../../customer/stores/customer.store';
import { $cartState } from '../../cart/stores/cart.store';
import { formatPrice } from '../../cart/utils';
import type { CartItem } from '../../cart/stores/cart.store';

const NS = 'checkout-form';

function gid(id: string): HTMLElement | null {
  return document.getElementById(NS + '-' + id);
}

/* ── Refs ── */

const nombre       = gid('nombre');
const apellido     = gid('apellido');
const telefono     = gid('telefono');
const submitBtn    = gid('submit');
const hint         = gid('hint');
const itemsEl      = gid('items');
const totalEl      = gid('total');
const totalVal     = gid('total-value');

const entregaRadios = document.querySelectorAll('input[name="metodo-entrega"]');
const pagoRadios   = document.querySelectorAll('input[name="metodo-pago"]');

/* ── Helpers ── */

function isInput(el: EventTarget | null): el is HTMLInputElement {
  return el instanceof HTMLInputElement;
}

function inputVal(el: EventTarget | null): string {
  return isInput(el) ? el.value : '';
}

function setVal(el: EventTarget | null, v: string): void {
  if (isInput(el)) el.value = v;
}

function syncRadios(radios: NodeListOf<Element>, val: string): void {
  for (let i = 0; i < radios.length; i++) {
    const r = radios[i];
    if (r instanceof HTMLInputElement) r.checked = r.value === val;
  }
}

function isFormValid(): boolean {
  const nom = inputVal(nombre).trim();
  const ape = inputVal(apellido).trim();
  const tel = inputVal(telefono).replace(/\D/g, '');
  return nom.length >= 2 && ape.length >= 2 && tel.length >= 7;
}

function setSubmit(disabled: boolean): void {
  if (submitBtn instanceof HTMLButtonElement) submitBtn.disabled = disabled;
}

function runValidation(): void {
  const valid = isFormValid();
  setSubmit(!valid);
  if (hint) {
    hint.textContent = valid
      ? 'Todos los campos obligatorios están completos.'
      : 'Completá nombre, apellido y teléfono para continuar.';
  }
}

/* ── Init from store ── */

const seed = $customer.get();
setVal(nombre,   seed.nombre ?? '');
setVal(apellido, seed.apellido ?? '');
setVal(telefono, seed.telefono ?? '');
syncRadios(entregaRadios, seed.metodoEntrega);
syncRadios(pagoRadios,    seed.metodoPago);

/* ── Store → inputs (solo cuando el valor externo difiere del DOM) ── */

$customer.subscribe(data => {
  if (!data) return;
  if (nombre instanceof HTMLInputElement && nombre.value !== data.nombre)
    nombre.value = data.nombre;
  if (apellido instanceof HTMLInputElement && apellido.value !== data.apellido)
    apellido.value = data.apellido;
  if (telefono instanceof HTMLInputElement && telefono.value !== data.telefono)
    telefono.value = data.telefono;
  syncRadios(entregaRadios, data.metodoEntrega);
  syncRadios(pagoRadios,    data.metodoPago);
});

/* ── Inputs → store (con sanitización) ── */

function onInput(e: Event): void {
  const el = e.target;
  if (!isInput(el) || !el.name) return;

  let val = el.value;

  if (el.name === 'telefono') {
    val = val.replace(/\D/g, '');
    if (el.value !== val) el.value = val;
  }

  updateCustomerData({ [el.name]: el.name === 'telefono' ? val : val });
}

nombre?.addEventListener('input', onInput);
apellido?.addEventListener('input', onInput);
telefono?.addEventListener('input', onInput);

/* ── Blur: trim whitespace ── */

function onBlur(e: FocusEvent): void {
  const el = e.target;
  if (!isInput(el) || !el.name) return;
  const trimmed = el.value.trim();
  if (trimmed !== el.value) {
    el.value = trimmed;
    updateCustomerData({ [el.name]: trimmed });
  }
}

nombre?.addEventListener('blur', onBlur);
apellido?.addEventListener('blur', onBlur);

function onTelBlur(e: FocusEvent): void {
  const el = e.target;
  if (!isInput(el)) return;
  const digits = el.value.replace(/\D/g, '');
  if (digits !== el.value) {
    el.value = digits;
    updateCustomerData({ telefono: digits });
  }
}

telefono?.addEventListener('blur', onTelBlur);

/* ── Radios → store ── */

function onRadioChange(e: Event): void {
  const el = e.target;
  if (!isInput(el)) return;
  if (el.name === 'metodo-entrega') {
    updateCustomerData({ metodoEntrega: el.value as MetodoEntrega });
  } else if (el.name === 'metodo-pago') {
    updateCustomerData({ metodoPago: el.value as MetodoPago });
  }
}

for (let i = 0; i < entregaRadios.length; i++)
  entregaRadios[i].addEventListener('change', onRadioChange);
for (let i = 0; i < pagoRadios.length; i++)
  pagoRadios[i].addEventListener('change', onRadioChange);

/* ── Live validation ── */

nombre?.addEventListener('input', runValidation);
apellido?.addEventListener('input', runValidation);
telefono?.addEventListener('input', runValidation);
runValidation();

/* ── Debounced persistence ── */

let persistTimer: ReturnType<typeof setTimeout> | undefined;
const PERSIST_DELAY = 400;

function schedulePersist(): void {
  clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    const snapshot = $customer.get();
    try {
      localStorage.setItem('piksel-customer', JSON.stringify(snapshot));
    } catch {
      /* quota exceeded or SSR — safe to ignore */
    }
  }, PERSIST_DELAY);
}

nombre?.addEventListener('input', schedulePersist);
apellido?.addEventListener('input', schedulePersist);
telefono?.addEventListener('input', schedulePersist);

/* ── Cart subscription ── */

const escDiv = document.createElement('div');

function escHtml(s: string): string {
  escDiv.textContent = s;
  return escDiv.innerHTML;
}

$cartState.subscribe(state => {
  if (!itemsEl) return;
  const { items } = state;

  if (items.length === 0) {
    itemsEl.innerHTML = '<p class="py-6 text-center text-sm text-tech-text-muted">No hay productos en el carrito.</p>';
    totalEl?.classList.add('hidden');
    setSubmit(true);
    return;
  }

  let html = '';
  for (let i = 0; i < items.length; i++)
    html += renderItem(items[i]);

  itemsEl.innerHTML = html;
  totalEl?.classList.remove('hidden');
  if (totalVal) totalVal.textContent = formatPrice(state.total);
});

function renderItem(item: CartItem): string {
  const name = escHtml(`${item.product.marca ?? ''} ${item.product.modelo ?? ''}`);
  const spec = escHtml(`${item.product.almacenamiento ?? ''} · ${item.selectedColor ?? ''}`);
  const sub  = formatPrice(item.product.precio * item.quantity);
  return `<div class="flex items-center gap-3 py-2.5 border-b border-tech-border/50 last:border-b-0">`
    + `<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-tech-bg text-xs font-bold text-tech-text-muted">${item.quantity}</div>`
    + `<div class="min-w-0 flex-1">`
    + `<p class="truncate text-sm font-medium text-tech-text-primary">${name}</p>`
    + `<p class="truncate text-xs text-tech-text-muted">${spec}</p>`
    + `</div>`
    + `<span class="shrink-0 text-sm font-semibold text-tech-text-primary">${sub}</span>`
    + `</div>`;
}
