/**
 * sheets.repository.ts
 * Responsabilidad: Implementación concreta del puerto IProductRepository
 * usando Google Sheets como fuente de datos. Es un "Adaptador de
 * Infraestructura" en términos de Arquitectura Hexagonal: cumple sumisamente
 * el contrato definido por el dominio, sin que el dominio sepa cómo se
 * obtienen los datos (CSV, fetch, Google Sheets, etc.).
 *
 * Si el endpoint de Sheets cambia, se modifica SOLO este archivo.
 * Si la lógica de negocio cambia, se modifica la entidad Product en dominio.
 *
 * Relaciones:
 *   - Implementa IProductRepository (dominio)
 *   - Consume ProductMapper para transformar filas CSV en entidades Product
 *   - Expone findBySlug como método de conveniencia (no parte del contrato)
 */

import type { IProductRepository } from '../../domain/product/product.contract.ts';
import type { Product } from '../../domain/product/product.entity.ts';
import { ProductMapper } from './product.mapper.ts';

const SHEETS_CSV_URL =
  'https://docs.google.com/spreadsheets/d/1rSrTvSHJ9L31HNwQOQHUuHmjsP6hjOc82EkT8o9SUQk/gviz/tq?tqx=out:csv&sheet=Productos';

export class SheetsProductRepository implements IProductRepository {
  private productsCache: Product[] | null = null;
  private slugMap: Map<string, Product> = new Map();

  async findAll(): Promise<Product[]> {
    if (this.productsCache) return this.productsCache;

    let csvText: string;

    try {
      const response = await fetch(SHEETS_CSV_URL);

      if (!response.ok) {
        throw new Error(
          `Google Sheets respondió con estado ${response.status} ${response.statusText}`,
        );
      }

      csvText = await response.text();
    } catch (cause) {
      throw new Error(
        `No se pudo obtener el catálogo desde Google Sheets. ` +
          `Verifica que el documento sea público y la URL sea correcta.`,
        { cause },
      );
    }

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
        console.warn(
          `[SheetsProductRepository] Fila omitida por error de validación:`,
          (error as Error).message,
          `— Fila:`, row,
        );
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
   * findBySlug NO forma parte del contrato IProductRepository (el slug es
   * un concepto de infraestructura/URL). Se expone como método público de
   * conveniencia para que los servicios de aplicación puedan resolver
   * rápidamente un producto desde un slug de ruta sin filtrar en memoria.
   *
   * Internamente llama a findAll() para poblar el slugMap y retorna el
   * producto correspondiente o null si no existe.
   */
  async findBySlug(slug: string): Promise<Product | null> {
    await this.findAll();
    return this.slugMap.get(slug) ?? null;
  }

  /**
   * Invalida la caché interna para forzar una recarga en la próxima llamada.
   * Útil si en el futuro se agrega un mecanismo de revalidación periódica.
   */
  invalidateCache(): void {
    this.productsCache = null;
    this.slugMap = new Map();
  }

  /**
   * Parsea texto CSV plano a un array de objetos clave-valor.
   * La primera fila se usa como encabezados.
   * Soporta valores entrecomillados con comillas escapadas ("").
   * Es autocontenido: no depende de librerías externas de parseo.
   */
  private static parseCsv(text: string): Record<string, string>[] {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = SheetsProductRepository.parseCsvLine(lines[0]);
    const rows: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = SheetsProductRepository.parseCsvLine(lines[i]);
      if (values.length === 0 || values.every(v => v.trim() === '')) continue;

      const row: Record<string, string> = {};
      headers.forEach((header, idx) => {
        row[header.trim()] = idx < values.length ? values[idx].trim() : '';
      });

      rows.push(row);
    }

    return rows;
  }

  /**
   * Parsea una línea individual de CSV respetando campos entrecomillados
   * (que pueden contener comas internas) y comillas escapadas ("").
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
