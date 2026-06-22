/**
 * product.mapper.ts
 * Responsabilidad: Adaptador de infraestructura que transforma filas crudas
 * del CSV de Google Sheets en entidades de dominio Product (y genera slugs
 * para búsqueda por URL). Pertenece a la capa de infraestructura y es el
 * único lugar donde se conoce el formato de columnas de la hoja de cálculo.
 *
 * Principio Hexagonal: El dominio no sabe qué es un CSV ni una fila de Sheets.
 * Este mapper "traduce" el mundo externo al lenguaje puro de la entidad Product.
 * Si la hoja de cálculo cambia de estructura, solo se modifica ESTE archivo.
 *
 * Relaciones:
 *   - Consume Product y ProductData del dominio
 *   - Es consumido por SheetsProductRepository
 */

import { Product } from '../../domain/product/product.entity.ts';
import type { ProductData } from '../../domain/product/product.types.ts';

/**
 * Describe las columnas esperadas del CSV exportado de Google Sheets.
 * Sirve como documentación viva del contrato con la fuente de datos externa.
 */
export interface RawProductRow {
  id: string;
  marca: string;
  modelo: string;
  almacenamiento: string;
  precio: string;
  color_oficial: string;
  fotos_galeria: string;
  modelo_3d_url: string;
  stock: string;
}

export class ProductMapper {
  /**
   * Convierte una fila cruda del CSV en una entidad Product del dominio.
   * Cada campo pasa por una rutina de limpieza y transformación de tipos
   * antes de construir la entidad. Si la validación del dominio falla
   * (precio inválido, marca vacía, etc.), la excepción se propaga.
   */
  static toDomain(row: Record<string, string>): Product {
    const productData: ProductData = {
      id: row.id.trim(),
      marca: row.marca.trim(),
      modelo: row.modelo.trim(),
      almacenamiento: row.almacenamiento.trim(),
      precio: ProductMapper.parsePrice(row.precio),
      colorOficial: row.color_oficial.trim(),
      fotosGaleria: ProductMapper.parseGallery(row.fotos_galeria),
      modelo3dUrl: row.modelo_3d_url?.trim() || null,
      stock: ProductMapper.parseStock(row.stock),
    };

    return new Product(productData);
  }

  /**
   * Genera un slug seguro para URL a partir de los datos del producto.
   * NO forma parte de la entidad de dominio (el slug es un concepto de
   * presentación web), pero la infraestructura lo necesita para exponer
   * el catálogo vía rutas tipo /producto/[slug].
   *
   * Ejemplo:  ("Apple", "iPhone 15 Pro Max", "256GB") → "apple-iphone-15-pro-max-256gb"
   */
  static generateSlug(product: {
    marca: string;
    modelo: string;
    almacenamiento: string;
  }): string {
    const raw = `${product.marca} ${product.modelo} ${product.almacenamiento}`;
    return raw
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Parsea un valor de precio desde string a número, manejando formatos
   * argentinos (1.234,56) y formatos internacionales (1,234.56).
   */
  private static parsePrice(value: string): number {
    const cleaned = value.replace(/[^0-9.,-]/g, '').trim();
    if (cleaned.length === 0) return 0;

    const lastComma = cleaned.lastIndexOf(',');
    const lastDot = cleaned.lastIndexOf('.');

    if (lastComma === -1 && lastDot === -1) {
      return parseFloat(cleaned);
    }

    let normalized: string;

    if (lastComma > lastDot) {
      normalized = cleaned.replace(/\./g, '').replace(',', '.');
    } else {
      normalized = cleaned.replace(/,/g, '');
    }

    return parseFloat(normalized);
  }

  /**
   * Convierte el campo fotos_galeria (string separado por comas) en un
   * array de URLs limpias.
   */
  private static parseGallery(value: string): string[] {
    return value
      .split(',')
      .map(url => url.trim())
      .filter(url => url.length > 0);
  }

  /**
   * Convierte el campo stock (string 'SI' o 'NO') a booleano.
   */
  private static parseStock(value: string): boolean {
    return value.trim().toUpperCase() === 'SI';
  }
}
