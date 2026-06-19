/**
 * cart.store.ts
 * Responsabilidad: Store de estado global del carrito usando nanostores.
 * Mantiene la lista de items, totales y estado de UI. Las acciones del
 * carrito modifican este store que notifica a los componentes suscritos.
 *
 * Tipos de datos: store: { items: CartItem[], total: number,
 * itemCount: number, isOpen: boolean }.
 * Acciones: addItem, removeItem, updateQuantity, clear, toggle, open, close.
 */