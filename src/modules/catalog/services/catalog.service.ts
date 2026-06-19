/**
 * catalog.service.ts
 * Responsabilidad: Servicio de aplicación que orquesta los casos de uso del
 * catálogo. Coordina entre el store, el repositorio de productos (dominio) y
 * los filtros. Implementa la lógica de filtrado, búsqueda y ordenamiento.
 *
 * Tipos de datos: métodos getProducts(filters?), searchProducts(term),
 * getProductsByCategory(category). Consume IProductRepository.
 */