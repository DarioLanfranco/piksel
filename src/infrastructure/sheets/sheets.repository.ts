/**
 * sheets.repository.ts
 * Responsabilidad: Implementación concreta de IProductRepository usando el
 * endpoint de exportación CSV de Google Sheets como fuente de datos.
 *
 * El parseo de CSV es propio (zero-dependency) pero robusto:
 *   - Respeta campos entrecomillados con comas internas
 *   - Soporta comillas escapadas ("") dentro de quoted fields
 *   - Maneja saltos de línea dentro de celdas (multi-line RFC 4180)
 *   - Normaliza terminaciones CRLF a LF
 *   - Omite filas vacías al final del documento
 *
 * Si el fetch falla o una fila individual no puede mapearse, se registra
 * el error en consola y se continúa procesando el resto del catálogo.
 *
 * Relaciones:
 *   - Implementa IProductRepository (dominio)
 *   - Consume ProductMapper.toDomain(string[]) para transformación
 *   - Expone findBySlug como método de conveniencia (no parte del contrato)
 */

import type { IProductRepository } from '../../domain/product/product.contract';
import type { Product } from '../../domain/product/product.entity';
import { ProductMapper } from './product.mapper';
import { SHEETS_CSV_URL } from 'astro:env/server';

export class SheetsProductRepository implements IProductRepository {
  private static instance: SheetsProductRepository | null = null;

  static getInstance(): SheetsProductRepository {
    if (!SheetsProductRepository.instance) {
      SheetsProductRepository.instance = new SheetsProductRepository();
    }
    return SheetsProductRepository.instance;
  }

  private productsCache: Product[] | null = null;
  private slugMap: Map<string, Product> = new Map();

  async findAll(): Promise<Product[]> {
    if (this.productsCache) return this.productsCache;

    const csvText = await this.fetchCsv();
    const rows = SheetsProductRepository.parseCsv(csvText);

    const products: Product[] = [];
    const slugMap = new Map<string, Product>();

    for (const row of rows) {
      try {
        const product = ProductMapper.toDomain(row);
        const slug = ProductMapper.generateSlug(product);

        products.push(product);
        slugMap.set(slug, product);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(`[SheetsProductRepository] Fila omitida:`, (error as Error).message);
      }
    }

    this.productsCache = products;
    this.slugMap = slugMap;

    return products;
  }

  async findById(id: string): Promise<Product | null> {
    const products = await this.findAll();
    return products.find(p => p.id === id) ?? null;
  }

  async findManyByBrand(brand: string): Promise<Product[]> {
    const products = await this.findAll();
    return products.filter(
      p => p.marca.toLowerCase() === brand.toLowerCase(),
    );
  }

  /**
   * findBySlug es un método de conveniencia (no exigido por el contrato).
   * El slug es un concepto de infraestructura/URL; el dominio no lo conoce.
   * Internamente llama a findAll() para poblar el slugMap y retorna el
   * producto cuyo slug coincida, o null si no existe.
   */
  async findBySlug(slug: string): Promise<Product | null> {
    await this.findAll();
    return this.slugMap.get(slug) ?? null;
  }

  invalidateCache(): void {
    this.productsCache = null;
    this.slugMap = new Map();
  }

  /* ──────────────────────────────────────────────
   *  Privados: obtención y parseo del CSV
   * ────────────────────────────────────────────── */

  /**
   * Ejecuta el fetch contra el endpoint público de Google Sheets.
   * Si la red falla o el servidor responde con error, lanza una excepción
   * con un mensaje legible para el equipo y preserva la causa original.
   */
  private async fetchCsv(): Promise<string> {
    try {
      const response = await fetch(SHEETS_CSV_URL, {
        signal: AbortSignal.timeout(30_000),
      });

      if (!response.ok) {
        throw new Error(
          `Google Sheets respondió con HTTP ${response.status} ${response.statusText}`,
        );
      }

      return await response.text();
    } catch (cause) {
      throw new Error(
        `No se pudo obtener el catálogo desde Google Sheets. ` +
          `Verifica que el documento sea público y la URL sea correcta.`,
        { cause },
      );
    }
  }

  /**
   * Parsea el texto CSV completo retornando solo las filas de datos
   * (sin la fila de encabezados) como un array de string[].
   *
   * El algoritmo recorre el texto caracter por caracter respetando el
   * estado de entrecomillado para:
   *   a) no separar filas en saltos de línea dentro de quoted fields
   *   b) normalizar \r\n a \n (Windows → Unix)
   */
  private static parseCsv(text: string): string[][] {
    const rawLines = SheetsProductRepository.splitCsvLines(text);
    if (rawLines.length < 2) return [];

    const rows: string[][] = [];

    // Saltamos la primera fila (encabezados)
    for (let i = 1; i < rawLines.length; i++) {
      const values = SheetsProductRepository.parseCsvLine(rawLines[i]);

      if (values.length === 0 || values.every(v => v.trim() === '')) {
        continue;
      }

      rows.push(values);
    }

    return rows;
  }

  /**
   * Divide el texto CSV en líneas sin romper campos entrecomillados
   * que contengan saltos de línea. Normaliza \r\n a \n previamente.
   *
   * Ejemplo de celda multi-línea que NO debe partirse:
   *   "línea 1
   *   línea 2",campo2
   *   → una sola fila con el quoted field intacto.
   */
  private static splitCsvLines(text: string): string[] {
    const normalized = text.replace(/\r\n/g, '\n');
    const lines: string[] = [];
    let current = '';
    let inQuotes = false;

    for (const char of normalized) {
      if (char === '"') {
        inQuotes = !inQuotes;
        current += char;
      } else if (char === '\n' && !inQuotes) {
        lines.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    if (current.length > 0) {
      lines.push(current);
    }

    return lines;
  }

  /**
   * Parsea una línea de CSV devolviendo sus campos como string[].
   * Soporta:
   *   - Campos quoted con comas internas
   *   - Comillas escapadas (""" → ")
   *   - Campos vacíos (retorna string vacío en la posición correcta)
   */
  private static parseCsvLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (inQuotes) {
        if (char === '"') {
          if (i + 1 < line.length && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          current += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === ',') {
          values.push(current);
          current = '';
        } else {
          current += char;
        }
      }
    }

    values.push(current);
    return values;
  }
}
