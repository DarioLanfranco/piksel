/**
 * product.types.ts
 * Responsabilidad: Tipados puros del dominio de producto. Define la interfaz
 * base ProductData (sin conceptos web), los union types Brand y StorageCapacity
 * con el patrón "branded literal" para autocompletado + extensibilidad, y los
 * Domain Errors semánticos que reemplazan al Error genérico.
 *
 * Relaciones:
 *   - ProductData es consumida por Product (entity)
 *   - Domain Errors son lanzados por Product.validate y capturados por la
 *     capa de aplicación para generar respuestas específicas por campo.
 */

export type Brand =
  | 'Apple'
  | 'Samsung'
  | 'Motorola'
  | 'Xiaomi'
  | 'Google'
  | 'OnePlus'
  | 'Nothing'
  | (string & {});

export type StorageCapacity =
  | '128GB'
  | '256GB'
  | '512GB'
  | '1TB'
  | (string & {});

export interface ProductData {
  id: string;
  marca: Brand;
  modelo: string;
  almacenamiento: StorageCapacity;
  camaras: string;
  procesador: string;
  precio: number;
  colorOficial: string;
  fotosGaleria: readonly string[];
  modelo3dUrl: string | null;
  stock: boolean;
  bateriaCondicion: number | null;
  bateriaCiclos: number | null;
  estadoComponente: string | null;
}

export class InvalidProductPriceError extends Error {
  constructor(price: number | string) {
    super(`El precio debe ser mayor a cero. Recibido: ${price}`);
    this.name = 'InvalidProductPriceError';
  }
}

export class EmptyProductBrandError extends Error {
  constructor() {
    super('La marca del producto no puede estar vacía.');
    this.name = 'EmptyProductBrandError';
  }
}

export class EmptyProductModelError extends Error {
  constructor() {
    super('El modelo del producto no puede estar vacío.');
    this.name = 'EmptyProductModelError';
  }
}

export class EmptyProductGalleryError extends Error {
  constructor() {
    super('El producto debe tener al menos una foto en la galería.');
    this.name = 'EmptyProductGalleryError';
  }
}
