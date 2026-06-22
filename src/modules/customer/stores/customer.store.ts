/**
 * customer.store.ts
 * Responsabilidad: Store persistente para los datos del comprador.
 * Los componentes CustomerForm y CheckoutSummary leen y escriben
 * esta store sin compartir props — cada uno se suscribe
 * independientemente y solo recibe notificaciones de los campos
 * que le interesan.
 *
 ═══════════════════════════════════════════════════════════
 *  SSR SAFETY
 *  ──────────
 *  persistentAtom usa try-catch alrededor de localStorage.
 *  En servidor se usa memoria volátil; en cliente se restaura
 *  automáticamente.
 *
 *  Los componentes de formulario deben declarar client:load o
 *  client:visible para evitar hydration mismatch en valores
 *  que vienen de localStorage.
 ═══════════════════════════════════════════════════════════
 */

import { persistentAtom } from '@nanostores/persistent';

/* ──────────────────────────────────────────────
 *  Tipos públicos
 * ────────────────────────────────────────────── */

export type MetodoEntrega = 'envio' | 'retiro';

export type MetodoPago =
  | 'efectivo_usd'
  | 'transferencia_ars'
  | 'financiado';

export interface CustomerFormData {
  nombre: string;
  apellido: string;
  telefono: string;
  metodoEntrega: MetodoEntrega;
  metodoPago: MetodoPago;
}

/* ──────────────────────────────────────────────
 *  Store persistente
 * ────────────────────────────────────────────── */

export const $customer = persistentAtom<CustomerFormData>(
  'piksel-customer',
  {
    nombre: '',
    apellido: '',
    telefono: '',
    metodoEntrega: 'retiro',
    metodoPago: 'efectivo_usd',
  },
  { encode: JSON.stringify, decode: JSON.parse },
);

/* ──────────────────────────────────────────────
 *  Acción
 * ────────────────────────────────────────────── */

export function updateCustomerData(data: Partial<CustomerFormData>): void {
  $customer.set({ ...$customer.get(), ...data });
}
