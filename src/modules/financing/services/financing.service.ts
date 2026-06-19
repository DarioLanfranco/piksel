/**
 * financing.service.ts
 * Responsabilidad: Servicio de aplicación que calcula las opciones de
 * financiación disponibles según el monto total. Aplica tasas de interés
 * definidas en business.config.ts y genera el detalle por cuota.
 *
 * Tipos de datos: métodos calculateOptions(total): FinancingOption[],
 * getSelectedDetail(option): CuotaDetail[].
 * Consume BusinessConfig para tasas y plazos.
 */