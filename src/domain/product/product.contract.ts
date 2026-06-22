/**
 * product.contract.ts
 * Responsabilidad: Puerto del dominio para el repositorio de productos.
 * NO incluye findBySlug: el slug es un concepto de presentación (URL) que
 * debe ser resuelto por el servicio de aplicación o el mapper de infraestructura.
 * El dominio habla el lenguaje del negocio: "dame todos los productos",
 * "búscame por ID", "búscame por marca".
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
}
