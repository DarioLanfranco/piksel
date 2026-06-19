/**
 * store.provider.ts
 * Responsabilidad: Orquestador / Inyector de dependencias. Coordina qué
 * implementaciones concretas de infraestructura se inyectan en los puertos
 * del dominio. Actúa como el "composition root" de la aplicación.
 *
 * Tipos de datos: instancias de repositorios (IProductRepository, ICustomerRepository, etc.),
 * configuración de store global (nanostores o signals).
 */