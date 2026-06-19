/**
 * cart.contract.ts
 * Responsabilidad: Puerto que define el contrato para el manejo del estado
 * del carrito. La infraestructura (localStorage, store global) implementa
 * esta interfaz para persistir y recuperar el carrito entre sesiones.
 *
 * Tipos de datos: métodos load(), save(cart), subscribe(callback),
 * clear(). Retorna CartEntity o null.
 */