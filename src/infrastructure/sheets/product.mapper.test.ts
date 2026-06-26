import { describe, it, expect } from 'vitest';
import { ProductMapper } from './product.mapper';

function makeRow(overrides: Partial<Record<number, string>> = {}): string[] {
  const defaults: string[] = [
    '1',              // 0 id
    'Apple',          // 1 marca
    'iPhone 17',      // 2 modelo
    '512GB',          // 3 almacenamiento
    '48+12MP',        // 4 camaras
    'A19',            // 5 procesador
    '1899 USD',       // 6 precio
    'Negro',          // 7 colorOficial
    'https://img1',   // 8 fotosGaleria
    '',               // 9 modelo3dUrl
    '5',              // 10 stock
    '95',             // 11 bateriaCondicion
    '50',             // 12 bateriaCiclos
    'Original Verificado', // 13 estadoComponente
  ];
  for (const [idx, val] of Object.entries(overrides)) {
    if (val !== undefined) defaults[Number(idx)] = val;
  }
  return defaults;
}

describe('ProductMapper.toDomain', () => {
  it('parses a valid row with all columns', () => {
    const product = ProductMapper.toDomain(makeRow());
    expect(product.id).toBe('1');
    expect(product.marca).toBe('Apple');
    expect(product.precio).toBe(1899);
    expect(product.stock).toBe(true);
    expect(product.bateriaCondicion).toBe(95);
    expect(product.bateriaCiclos).toBe(50);
    expect(product.estadoComponente).toBe('Original Verificado');
  });

  it('throws on row with fewer than 11 columns', () => {
    expect(() => ProductMapper.toDomain(['1', 'Apple'])).toThrow();
  });

  it('throws on invalid price (empty)', () => {
    expect(() => ProductMapper.toDomain(makeRow({ 6: '' }))).toThrow();
  });

  it('throws on invalid price (garbage)', () => {
    expect(() => ProductMapper.toDomain(makeRow({ 6: 'FREE' }))).toThrow();
  });

  it('parses price with comma decimal', () => {
    const row = makeRow({ 6: '1299,50 USD' });
    const product = ProductMapper.toDomain(row);
    expect(product.precio).toBe(1299.5);
  });

  it('parses price with dot thousands separator (comma decimal)', () => {
    const row = makeRow({ 6: '1.999,50 USD' });
    const product = ProductMapper.toDomain(row);
    expect(product.precio).toBe(1999.5);
  });

  it('sets stock=false when quantity is 0', () => {
    const row = makeRow({ 10: '0' });
    const product = ProductMapper.toDomain(row);
    expect(product.stock).toBe(false);
  });

  it('sets stock=false when quantity is negative', () => {
    const row = makeRow({ 10: '-1' });
    const product = ProductMapper.toDomain(row);
    expect(product.stock).toBe(false);
  });

  it('sets battery fields to null when no optional columns', () => {
    const minRow = makeRow({ 11: '', 12: '', 13: '' });
    const product = ProductMapper.toDomain(minRow);
    expect(product.bateriaCondicion).toBeNull();
    expect(product.bateriaCiclos).toBeNull();
    expect(product.estadoComponente).toBeNull();
  });
});

describe('ProductMapper.generateSlug', () => {
  it('generates slug from marca, modelo, almacenamiento', () => {
    const slug = ProductMapper.generateSlug({
      marca: 'Apple',
      modelo: 'iPhone 17 Pro Max',
      almacenamiento: '512GB',
    });
    expect(slug).toBe('apple-iphone-17-pro-max-512gb');
  });

  it('removes diacritics', () => {
    const slug = ProductMapper.generateSlug({
      marca: 'Mótorola',
      modelo: 'G84',
      almacenamiento: '256GB',
    });
    expect(slug).toBe('motorola-g84-256gb');
  });
});
