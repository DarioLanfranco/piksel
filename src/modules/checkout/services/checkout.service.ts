/**
 * checkout.service.ts
 * Responsabilidad: Servicio de aplicación que orquesta el caso de uso final
 * del checkout. Consolida datos del carrito, cliente, financiación y plan
 * canje, construye el mensaje de WhatsApp y ejecuta el envío.
 *
 * Tipos de datos: método placeOrder(): Promise<CheckoutResult>.
 * Consume CartService, CustomerService, FinancingService, TradeInService,
 * WhatsAppRepository, AnalyticsRepository.
 */