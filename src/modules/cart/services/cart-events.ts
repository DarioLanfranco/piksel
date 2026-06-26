export function initItemEvents(
  itemsEl: HTMLElement | null,
  callbacks: {
    removeItem: (key: string) => void;
    updateQuantity: (key: string, qty: number) => void;
    getCurrentState: () => Array<{ product: { id: string }; selectedColor: string; quantity: number }>;
  },
): void {
  if (!itemsEl) return;

  itemsEl.addEventListener('click', function (e: Event) {
    if (!(e.target instanceof HTMLElement)) return;
    const btn = e.target.closest('[data-key]');
    if (!btn) return;

    const key = btn.getAttribute('data-key');
    if (!key) return;

    if (btn.classList.contains('js-remove-item')) {
      callbacks.removeItem(key);
      return;
    }

    const currentItems = callbacks.getCurrentState();
    const current = currentItems.find(
      item => item.product.id + '::' + item.selectedColor === key,
    );
    if (!current) return;

    let qty: number | null = null;
    if (btn.classList.contains('js-qty-up')) {
      qty = current.quantity + 1;
    } else if (btn.classList.contains('js-qty-down')) {
      qty = current.quantity - 1;
    }

    if (qty !== null) {
      if (qty < 1) {
        callbacks.removeItem(key);
      } else {
        callbacks.updateQuantity(key, qty);
      }
    }
  });
}
