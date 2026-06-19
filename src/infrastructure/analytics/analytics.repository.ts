/**
 * analytics.repository.ts
 * Responsabilidad: Conexión concreta con el proveedor de analíticas
 * (Google Analytics 4, Pixel de Facebook, etc). Centraliza eventos de
 * tracking como page_view, add_to_cart, purchase, etc.
 *
 * Tipos de datos: métodos trackEvent(event: AnalyticsEvent), trackPageView(page),
 * implementa interfaz definida por el proveedor. Consume AnalyticsConfig.
 */