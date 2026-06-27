/**
 * cart.store.ts
 * Responsabilidad: Store atómica y persistente del carrito de compras usando
 * nanostores + @nanostores/persistent. El estado sobrevive a recargas gracias
 * a localStorage en el navegador.
 *
 ═══════════════════════════════════════════════════════════
 *  SSR SAFETY (IMPORTANTE)
 *  ────────────────────
 *  @nanostores/persistent envuelve el acceso a localStorage
 *  en un try-catch. En Node.js (SSR de Astro), localStorage
 *  no existe, la excepción se atrapa, y la store usa memoria
 *  volátil con el valor default. Al hidratar en el cliente,
 *  la store se reinicializa con los datos reales de localStorage.
 *
 *  El carrito NO se renderiza en SSR (no es contenido SEO),
 *  por lo que este mismatch no genera flickering ni roturas.
 ═══════════════════════════════════════════════════════════
 */

import { persistentAtom } from '@nanostores/persistent';
import { computed, atom } from 'nanostores';
import type { ProductData } from '../../../domain/product/product.types';

/* ──────────────────────────────────────────────
 *  Tipos públicos exportados
 * ────────────────────────────────────────────── */

export interface CartItem {
  product: ProductData;
  quantity: number;
  selectedColor: string;
}

export type CartItemKey = string;

export interface CartState {
  items: CartItem[];
  total: number;
  count: number;
}

/* ──────────────────────────────────────────────
 *  Store persistente
 *  persistentAtom serializa el estado completo como JSON
 *  en localStorage bajo la clave "piksel-cart".
 *  A diferencia de persistentMap, permite valores complejos
 *  (objetos anidados, arrays) sin restricciones de tipo.
 * ────────────────────────────────────────────── */

function isValidCartItem(value: unknown): boolean {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.product === 'object' &&
    item.product !== null &&
    typeof (item.product as Record<string, unknown>).id === 'string' &&
    typeof (item.product as Record<string, unknown>).precio === 'number' &&
    typeof item.quantity === 'number' &&
    item.quantity > 0 &&
    typeof item.selectedColor === 'string'
  );
}

export const $cart = persistentAtom<Record<string, CartItem>>(
  'piksel-cart',
  {},
  {
    encode: JSON.stringify,
    decode: function (raw: string): Record<string, CartItem> {
      try {
        const parsed = JSON.parse(raw);
        if (typeof parsed !== 'object' || parsed === null) return {};
        const valid: Record<string, CartItem> = {};
        for (const key of Object.keys(parsed)) {
          const item = (parsed as Record<string, unknown>)[key];
          if (isValidCartItem(item)) {
            valid[key] = item as CartItem;
          }
        }
        return valid;
      } catch {
        return {};
      }
    },
  },
);

/* ──────────────────────────────────────────────
 *  Valores derivados (computed)
 * ────────────────────────────────────────────── */

export const $cartTotal = computed($cart, (cart) =>
  Object.values(cart).reduce(
    (total, item) => total + item.product.precio * item.quantity,
    0,
  ),
);

export const $cartCount = computed($cart, (cart) =>
  Object.values(cart).reduce((count, item) => count + item.quantity, 0),
);

export const $cartState = computed($cart, (cart): CartState => {
  const items = Object.values(cart);
  let total = 0;
  let count = 0;

  for (const item of items) {
    total += item.product.precio * item.quantity;
    count += item.quantity;
  }

  return { items, total, count };
});

/* ──────────────────────────────────────────────
 *  Acciones puras
 *  persistentAtom no tiene setKey; toda mutación
 *  reemplaza el estado completo con un nuevo objeto.
 * ────────────────────────────────────────────── */

export function addItem(product: ProductData, color: string): void {
  const key = `${product.id}::${color}`;
  const current = $cart.get();

  if (current[key]) {
    $cart.set({
      ...current,
      [key]: { ...current[key], quantity: current[key].quantity + 1 },
    });
  } else {
    $cart.set({
      ...current,
      [key]: {
        product,
        quantity: 1,
        selectedColor: color,
      },
    });
  }
}

export function removeItem(itemId: CartItemKey): void {
  const current = $cart.get();
  const { [itemId]: _removed, ...rest } = current;
  $cart.set(rest);
}

export function updateQuantity(itemId: CartItemKey, quantity: number): void {
  const clamped = Math.max(1, Math.floor(quantity));
  const current = $cart.get();

  if (current[itemId]) {
    $cart.set({
      ...current,
      [itemId]: { ...current[itemId], quantity: clamped },
    });
  }
}

export function clearCart(): void {
  $cart.set({});
}

/* ──────────────────────────────────────────────
 *  UI: estado de apertura del drawer
 *  Store no persistente (átomo en memoria).
 *  Se cierra al navegar o al hacer checkout.
 * ────────────────────────────────────────────── */

export const $cartOpen = atom(false);

export function openCart(): void {
  $cartOpen.set(true);
}

export function closeCart(): void {
  $cartOpen.set(false);
}

export function toggleCart(): void {
  $cartOpen.set(!$cartOpen.get());
}
