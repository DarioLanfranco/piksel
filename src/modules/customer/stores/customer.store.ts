/**
 * customer.store.ts
 * Responsabilidad: Store de estado del cliente. Persiste los datos del
 * formulario en el store global y sincroniza con localStorage para
 * recordar al cliente entre sesiones.
 *
 * Tipos de datos: store: { data: CustomerData | null, isDirty: boolean,
 * errors: ValidationErrors }.
 * Acciones: setField(name, value), validate(), save(), load(), clear().
 */