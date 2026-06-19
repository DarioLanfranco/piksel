/**
 * sheets.repository.ts
 * Responsabilidad: Implementación concreta del puerto IProductRepository
 * usando Google Sheets como fuente de datos. Se conecta vía fetch a la URL
 * pública de publicación de la hoja de cálculo y parsea el CSV/JSON resultante.
 *
 * Tipos de datos: implementa ProductContract, trabaja con filas crudas (string[][])
 * que luego transforma usando ProductMapper. Retorna Promise<ProductEntity[]>.
 */