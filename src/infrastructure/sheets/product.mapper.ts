/**
 * product.mapper.ts
 * Responsabilidad: Transformador / mapper que convierte filas crudas obtenidas
 * de Google Sheets en entidades de dominio ProductEntity. También genera slugs
 * a partir del nombre del producto y normaliza tipos de datos.
 *
 * Tipos de datos: entrada string[][] (filas de Sheets), salida ProductEntity[].
 * Funciones: sheetRowToProduct, generateSlug, normalizePrice, mapColor.
 */