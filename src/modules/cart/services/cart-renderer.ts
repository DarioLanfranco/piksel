import type { CartItem } from '../stores/cart.store';
import { formatPrice } from '../utils';

export function renderCartList(
  items: CartItem[],
  itemsEl: HTMLElement | null,
  tpl: HTMLTemplateElement | null,
): void {
  const existingList = itemsEl?.querySelector('ul');
  if (existingList) existingList.remove();
  if (items.length === 0) return;

  const ul = document.createElement('ul');
  ul.className = 'list-none space-y-4';

  for (const item of items) {
    const key = item.product.id + '::' + item.selectedColor;
    const subtotal = item.product.precio * item.quantity;
    const img = item.product.fotosGaleria?.[0] ?? '';

    const li = tpl instanceof HTMLTemplateElement
      ? (tpl.content.cloneNode(true) as DocumentFragment).firstElementChild as HTMLElement
      : (() => {
          const el = document.createElement('li');
          el.className = 'flex gap-3 rounded-premium bg-tech-bg p-3';
          return el;
        })();

    if (!li) continue;

    const imgEl = li.querySelector('img');
    if (imgEl) {
      if (img) imgEl.setAttribute('src', img);
      imgEl.alt = item.product.marca + ' ' + item.product.modelo;
    }

    const titleEl = li.querySelector('.js-cart-title');
    if (titleEl) titleEl.textContent = item.product.marca + ' ' + item.product.modelo;

    const specEl = li.querySelector('.js-cart-spec');
    if (specEl) specEl.textContent = item.product.almacenamiento + ' \u00b7 ' + item.selectedColor;

    const qtyDown = li.querySelector('.js-qty-down');
    if (qtyDown) qtyDown.setAttribute('data-key', key);

    const qtyUp = li.querySelector('.js-qty-up');
    if (qtyUp) qtyUp.setAttribute('data-key', key);

    const qtySpan = li.querySelector('.js-cart-qty');
    if (qtySpan) qtySpan.textContent = String(item.quantity);

    const subSpan = li.querySelector('.js-cart-subtotal');
    if (subSpan) subSpan.textContent = formatPrice(subtotal);

    const rmBtn = li.querySelector('.js-remove-item');
    if (rmBtn) rmBtn.setAttribute('data-key', key);

    ul.appendChild(li);
  }

  itemsEl?.appendChild(ul);
}
