/**
 * product.mapper.ts
 * Responsabilidad: Adaptador de infraestructura que transforma filas crudas
 * del CSV de Google Sheets (representadas como string[]) en entidades de
 * dominio Product. Trabaja por índices de columna, no por nombre, ya que
 * la fuente de datos es un CSV posicional. Es el único punto de contacto
 * con el formato de exportación de la hoja de cálculo.
 *
 * Principio Hexagonal: traduce el mundo externo (CSV posicional) al lenguaje
 * puro de la entidad Product. Si la hoja cambia de orden de columnas, solo
 * se actualizan los índices en ESTE archivo.
 *
 * Columnas esperadas (índice 0-based):
 *  0: id
 *  1: marca
 *  2: modelo
 *  3: almacenamiento
 *  4: camaras
 *  5: procesador
 *  6: precio       (formato: "1899 USD")
 *  7: color_oficial
 *  8: fotos_galeria (URLs separadas por coma)
 *  9: modelo_3d_url (URL .glb o vacía)
 * 10: stock        (número entero: > 0 = true)
 * 11: bateria_condicion  (entero 0-100, o vacío para equipos 0km)
 * 12: bateria_ciclos     (entero, o vacío)
 * 13: estado_componente  (texto: "Original Verificado", "Nuevo / Sellado", o vacío)
 */

import { Product } from '../../domain/product/product.entity';
import type { ProductData } from '../../domain/product/product.types';

/** Indices nominales de cada columna en el CSV exportado */
const IDX = {
  ID: 0,
  MARCA: 1,
  MODELO: 2,
  ALMACENAMIENTO: 3,
  CAMARAS: 4,
  PROCESADOR: 5,
  PRECIO: 6,
  COLOR_OFICIAL: 7,
  FOTOS_GALERIA: 8,
  MODELO_3D_URL: 9,
  STOCK: 10,
  BATERIA_CONDICION: 11,
  BATERIA_CICLOS: 12,
  ESTADO_COMPONENTE: 13,
} as const;

/** Mínimo de columnas requeridas para un producto válido (id → stock) */
const MIN_REQUIRED_COLUMNS = 11;

export class ProductMapper {
  /**
   * Convierte una fila del CSV (string[] posicional) en una entidad Product.
   * Cada campo se limpia y transforma antes de construir la entidad.
   * Las reglas de validación de negocio (precio > 0, marca no vacía, etc.)
   * se delegan al constructor de Product.
   */
  static toDomain(rawRow: string[]): Product {
    if (rawRow.length < MIN_REQUIRED_COLUMNS) {
      throw new Error(
        `Fila con estructura inválida: se esperaban al menos ${MIN_REQUIRED_COLUMNS} columnas, ` +
          `recibidas ${rawRow.length}.`,
      );
    }

    const get = (idx: number): string => (rawRow[idx] ?? '').trim();
    const getOpt = (idx: number): string | null =>
      idx < rawRow.length ? (rawRow[idx] ?? '').trim() || null : null;

    const productData: ProductData = {
      id: get(IDX.ID),
      marca: get(IDX.MARCA),
      modelo: get(IDX.MODELO),
      almacenamiento: get(IDX.ALMACENAMIENTO),
      camaras: get(IDX.CAMARAS),
      procesador: get(IDX.PROCESADOR),
      precio: ProductMapper.parsePrice(get(IDX.PRECIO)),
      colorOficial: get(IDX.COLOR_OFICIAL),
      fotosGaleria: ProductMapper.parseGallery(get(IDX.FOTOS_GALERIA)),
      modelo3dUrl: ProductMapper.parseOptionalUrl(get(IDX.MODELO_3D_URL)),
      stock: ProductMapper.parseStock(get(IDX.STOCK)),
      bateriaCondicion: ProductMapper.parseIntOrNull(getOpt(IDX.BATERIA_CONDICION)),
      bateriaCiclos: ProductMapper.parseIntOrNull(getOpt(IDX.BATERIA_CICLOS)),
      estadoComponente: getOpt(IDX.ESTADO_COMPONENTE),
    };

    return new Product(productData);
  }

  /**
   * Genera un slug seguro para SEO combinando marca, modelo y almacenamiento.
   * Normaliza diacríticos (acentos, eñes) para URLs consistentes.
   *
   * Ejemplo:
   *   "Apple iPhone 17 Pro Max 512GB" → "apple-iphone-17-pro-max-512gb"
   *   "Mótorola G84"                 → "motorola-g84"
   */
  static generateSlug(product: {
    marca: string;
    modelo: string;
    almacenamiento: string;
  }): string {
    const raw = `${product.marca} ${product.modelo} ${product.almacenamiento}`;
    return raw
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Parsea precio en formato "1899 USD": extrae la parte numérica,
   * limpiando cualquier sufijo de moneda y espacios.
   */
  private static parsePrice(value: string): number {
    const cleaned = value.replace(/[^0-9.,-]/g, '').trim();
    if (cleaned.length === 0) return NaN;

    const lastComma = cleaned.lastIndexOf(',');
    const lastDot = cleaned.lastIndexOf('.');

    if (lastComma === -1 && lastDot === -1) {
      return parseFloat(cleaned);
    }

    const normalized =
      lastComma > lastDot
        ? cleaned.replace(/\./g, '').replace(',', '.')
        : cleaned.replace(/,/g, '');

    return parseFloat(normalized);
  }

  /**
   * Convierte el string de URLs separadas por coma en un array de strings.
   */
  private static parseGallery(value: string): string[] {
    return value
      .split(',')
      .map(url => url.trim())
      .filter(url => url.length > 0);
  }

  /**
   * Si el string está vacío o solo contiene espacios, retorna null.
   * De lo contrario retorna la URL limpia.
   */
  private static parseOptionalUrl(value: string): string | null {
    return value.length > 0 ? value : null;
  }

  /**
   * Convierte stock desde número (string) a booleano.
   * > 0 unidades → true (tiene stock); 0 o negativo → false.
   */
  private static parseStock(value: string): boolean {
    const quantity = parseInt(value, 10);
    return !Number.isNaN(quantity) && quantity > 0;
  }

  /**
   * Parsea un string a entero. Retorna null si el valor es
   * null, undefined, vacío o no es numérico.
   */
  private static parseIntOrNull(value: string | null): number | null {
    if (value === null) return null;
    const num = parseInt(value, 10);
    return Number.isNaN(num) ? null : num;
  }
}
