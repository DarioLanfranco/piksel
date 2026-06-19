/**
 * customer.entity.ts
 * Responsabilidad: Entidad del dominio que representa al comprador. Contiene
 * lógica de validación de datos personales: formato de DNI, CUIT/CUIL,
 * correo electrónico, teléfono. Puede calcular si el cliente es monotributista
 * o responsable inscripto según el CUIT.
 *
 * Tipos de datos: nombre, apellido, DNI, CUIT/CUIL, email, teléfono, provincia,
 * localidad. Depende de CustomerType y DocumentType.
 */