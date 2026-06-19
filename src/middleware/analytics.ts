/**
 * analytics.ts
 * Responsabilidad: Middleware de Astro para tracking de analíticas en cada
 * petición de página. Dispara eventos de page_view al proveedor de analíticas
 * configurado. Puede interceptar rutas para enriquecer datos de navegación.
 *
 * Tipos de datos: función onRequest(context: AstroContext): Promise<Response>.
 * Lee analytics.config.ts para determinar qué proveedor usar.
 * Dispara AnalyticsRepository.trackPageView.
 */