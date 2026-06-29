import type { CartItem } from '../cart.types';
import { formatPrice } from '../utils';

function buildRefMap(li: HTMLElement): Record<string, HTMLElement | null> {
  const map: Record<string, HTMLElement | null> = {};
  for (const el of li.querySelectorAll<HTMLElement>('[data-ref]')) {
    map[el.getAttribute('data-ref') ?? ''] = el;
  }
  return map;
}

export function renderCartList(
  items: CartItem[],
  itemsEl: HTMLElement | null,
  tpl: HTMLTemplateElement | null,
): void {
  const existingList = itemsEl?.querySelector('ul');
  if (existingList) existingList.remove();
  if (items.length === 0) return;

  if (!(tpl instanceof HTMLTemplateElement)) {
    throw new Error('cart-renderer: template #cart-item-tpl not found');
  }

  const ul = document.createElement('ul');
  ul.className = 'list-none space-y-4';

  for (const item of items) {
    const key = item.product.id + '::' + item.selectedColor;
    const subtotal = item.product.precio * item.quantity;

    const li = (tpl.content.cloneNode(true) as DocumentFragment).firstElementChild as HTMLElement | null;
    if (!li) continue;

    const ref = buildRefMap(li);

    const imgEl = ref['img'] as HTMLImageElement | null;
    if (imgEl) {
      const src = item.product.fotosGaleria?.[0];
      if (src) imgEl.src = src;
      imgEl.alt = item.product.marca + ' ' + item.product.modelo;
    }

    const titleEl = ref['title'];
    if (titleEl) titleEl.textContent = item.product.marca + ' ' + item.product.modelo;

    const specEl = ref['spec'];
    if (specEl) specEl.textContent = item.product.almacenamiento + ' \u00b7 ' + item.selectedColor;

    for (const btnName of ['qty-down', 'qty-up', 'remove'] as const) {
      const btn = ref[btnName];
      if (btn) btn.setAttribute('data-key', key);
    }

    const qtyEl = ref['qty'];
    if (qtyEl) qtyEl.textContent = String(item.quantity);

    const subEl = ref['subtotal'];
    if (subEl) subEl.textContent = formatPrice(subtotal);

    ul.appendChild(li);
  }

  itemsEl?.appendChild(ul);
}
