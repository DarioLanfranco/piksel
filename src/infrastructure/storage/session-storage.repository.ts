/**
 * session-storage.repository.ts
 * Responsabilidad: Implementación alternativa de persistencia usando
 * sessionStorage para datos temporales que no deben sobrevivir al cierre
 * del navegador (estado de filtros, sesión de búsqueda, etc.).
 *
 * Tipos de datos: misma interfaz que LocalStorageRepository pero con
 * ciclo de vida limitado a la sesión del navegador.
 */