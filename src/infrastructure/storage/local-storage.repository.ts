/**
 * local-storage.repository.ts
 * Responsabilidad: Implementación concreta de los contratos de persistencia
 * usando localStorage del navegador. Almacena y recupera datos del cliente,
 * carrito y preferencias de forma persistente entre sesiones.
 *
 * Tipos de datos: implementa CustomerContract, CartContract.
 * Métodos: get<T>(key), set<T>(key, data), remove(key), clear().
 * Serializa/deserializa JSON.
 */