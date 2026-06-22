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
import { computed } from 'nanostores';
import type { ProductData } from '../../../domain/product/product.types';
import type { Product } from '../../../domain/product/product.entity';

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

export const $cart = persistentAtom<Record<string, CartItem>>(
  'piksel-cart',
  {},
  { encode: JSON.stringify, decode: JSON.parse },
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

export function addItem(product: Product, color: string): void {
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
        product: extractData(product),
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
 *  Helpers
 * ────────────────────────────────────────────── */

function extractData(product: Product): ProductData {
  return {
    id: product.id,
    marca: product.marca,
    modelo: product.modelo,
    almacenamiento: product.almacenamiento,
    camaras: product.camaras,
    procesador: product.procesador,
    precio: product.precio,
    colorOficial: product.colorOficial,
    fotosGaleria: [...product.fotosGaleria],
    modelo3dUrl: product.modelo3dUrl,
    stock: product.stock,
  };
}
