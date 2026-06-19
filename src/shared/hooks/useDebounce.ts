/**
 * useDebounce.ts
 * Responsabilidad: Hook de utilidad que retrasa la actualización de un valor
 * hasta que haya pasado un período de inactividad. Usado en búsqueda para
 * evitar llamadas excesivas mientras el usuario escribe.
 *
 * Tipos de datos: función useDebounce<T>(value: T, delay: number): T.
 * Genérica: funciona con cualquier tipo de dato (string, number, object).
 */