/**
 * product.contract.ts
 * Responsabilidad: Puerto del dominio para el repositorio de productos.
 * Incluye findBySlug como método de consulta por slug de URL, que es una
 * necesidad transversal del sistema (páginas de detalle, SEO, sitemaps).
 * El slug se genera desde el mapper de infraestructura usando marca+modelo+almacenamiento.
 *
 * Relaciones:
 *   - Depende de Product (entity)
 *   - Es implementada por sheets.repository.ts en infraestructura
 *   - Es consumida por catalog.service.ts y product.service.ts en modules/
 */

import type { Product } from './product.entity';

export interface IProductRepository {
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  findManyByBrand(brand: string): Promise<Product[]>;
  findBySlug(slug: string): Promise<Product | null>;
}
