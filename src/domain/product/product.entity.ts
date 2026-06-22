/**
 * product.entity.ts
 * Responsabilidad: Entidad del dominio que representa un celular del catálogo.
 * Usa validación estática con Domain Errors semánticos (definidos en types)
 * para que la capa de aplicación pueda capturar errores específicos.
 * No contiene slug → ese es un concepto de infraestructura que se resuelve
 * en el mapper o en el servicio de aplicación.
 *
 * Relaciones:
 *   - Consume ProductData y Domain Errors de product.types.ts
 *   - Es retornada por IProductRepository (product.contract.ts)
 */

import type { ProductData } from './product.types';
import {
  InvalidProductPriceError,
  EmptyProductBrandError,
  EmptyProductModelError,
  EmptyProductGalleryError,
} from './product.types';

export class Product {
  readonly id: string;
  readonly marca: string;
  readonly modelo: string;
  readonly almacenamiento: string;
  readonly camaras: string;
  readonly procesador: string;
  readonly precio: number;
  readonly colorOficial: string;
  readonly fotosGaleria: ReadonlyArray<string>;
  readonly modelo3dUrl: string | null;
  readonly stock: boolean;

  constructor(data: ProductData) {
    Product.validate(data);

    this.id = data.id;
    this.marca = data.marca;
    this.modelo = data.modelo;
    this.almacenamiento = data.almacenamiento;
    this.camaras = data.camaras;
    this.procesador = data.procesador;
    this.precio = data.precio;
    this.colorOficial = data.colorOficial;
    this.fotosGaleria = Object.freeze([...data.fotosGaleria]);
    this.modelo3dUrl = data.modelo3dUrl;
    this.stock = data.stock;
  }

  private static validate(data: ProductData): void {
    if (data.precio <= 0) {
      throw new InvalidProductPriceError(data.precio);
    }

    if (!data.marca || data.marca.trim().length === 0) {
      throw new EmptyProductBrandError();
    }

    if (!data.modelo || data.modelo.trim().length === 0) {
      throw new EmptyProductModelError();
    }

    if (data.fotosGaleria.length === 0) {
      throw new EmptyProductGalleryError();
    }
  }

  has3DViewer(): boolean {
    return this.modelo3dUrl !== null && this.modelo3dUrl.trim().length > 0;
  }
}
