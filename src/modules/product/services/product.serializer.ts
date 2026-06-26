import type { Product } from '../../../domain/product/product.entity';

export interface ProductJson {
  id: string;
  marca: string;
  modelo: string;
  almacenamiento: string;
  camaras: string;
  procesador: string;
  precio: number;
  colorOficial: string;
  fotosGaleria: string[];
  modelo3dUrl: string | null;
  stock: boolean;
  bateriaCondicion: number | null;
  bateriaCiclos: number | null;
  estadoComponente: string | null;
}

export function serializeProduct(product: Product): ProductJson {
  return {
    id: product.id,
    marca: product.marca,
    modelo: product.modelo,
    almacenamiento: product.almacenamiento,
    camaras: product.camaras,
    procesador: product.procesador,
    precio: product.precio,
    colorOficial: product.colorOficial,
    fotosGaleria: [...product.fotosGaleria],
    modelo3dUrl: product.modelo3dUrl,
    stock: product.stock,
    bateriaCondicion: product.bateriaCondicion,
    bateriaCiclos: product.bateriaCiclos,
    estadoComponente: product.estadoComponente,
  };
}
