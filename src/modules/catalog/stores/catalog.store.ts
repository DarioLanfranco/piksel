/**
 * catalog.store.ts
 * Responsabilidad: Store de estado global del catálogo usando nanostores.
 * Mantiene la lista de productos, filtros activos, búsqueda, estado de carga
 * y errores. Es el punto de comunicación entre los componentes de UI y el
 * servicio de catálogo.
 *
 * Tipos de datos: store: { products: ProductEntity[], filters: CatalogFilters,
 * searchTerm: string, loading: boolean, error: string | null }.
 * Acciones: fetchProducts, setFilter, setSearchTerm, reset.
 */