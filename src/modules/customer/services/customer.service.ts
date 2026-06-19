/**
 * customer.service.ts
 * Responsabilidad: Servicio de aplicación que orquesta los casos de uso del
 * cliente. Coordina validaciones de dominio (CUIT, email), persistencia y
 * recuperación de datos. Actúa como puente entre el store y el repositorio.
 *
 * Tipos de datos: métodos validateCustomer(data): ValidationResult,
 * saveCustomer(data), getCustomer(): CustomerData | null,
 * formatCUIT(cuit): string. Consume CustomerContract.
 */