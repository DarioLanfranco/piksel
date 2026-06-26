import { addItem, openCart } from '../stores/cart.store';

let initialized = false;

export function initAddToCart(): void {
  if (initialized) return;
  initialized = true;

  document.addEventListener('click', function (e: Event) {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;

    const heroBtn = target.closest('.js-hero-add-to-cart');
    const cartBtn = target.closest('.js-add-to-cart');
    const btn = heroBtn ?? cartBtn;
    if (!btn) return;

    const raw = btn.getAttribute('data-product');
    if (!raw) return;

    try {
      const product = JSON.parse(raw);
      addItem(product, product.colorOficial);
      const shouldOpen = heroBtn !== null || btn.getAttribute('data-cart-open') === 'true';
      if (shouldOpen) openCart();
    } catch {
      return;
    }
  });
}
