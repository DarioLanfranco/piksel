/**
 * cart.service.ts
 * Responsabilidad: Servicio de aplicación que orquesta los casos de uso del
 * carrito. Coordina entre el store y las entidades de dominio. Calcula
 * totales, aplica descuentos y verifica reglas de negocio antes de mutar.
 *
 * Tipos de datos: métodos addProduct(product, accessories?), removeProduct(id),
 * updateQuantity(id, qty), calculateTotal(), applyTradeIn(device?),
 * getCheckoutData(). Consume CartEntity, CustomerEntity.
 */