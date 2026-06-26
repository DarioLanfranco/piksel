import { describe, it, expect } from 'vitest';
import { Product } from '../../../domain/product/product.entity';
import { serializeProduct } from './product.serializer';

function makeProduct(overrides: Partial<ConstructorParameters<typeof Product>[0]> = {}): Product {
  return new Product({
    id: '1',
    marca: 'Apple',
    modelo: 'iPhone 17',
    almacenamiento: '512GB',
    camaras: '48+12MP',
    procesador: 'A19',
    precio: 1899,
    colorOficial: 'Negro',
    fotosGaleria: ['https://img1'],
    modelo3dUrl: null,
    stock: true,
    bateriaCondicion: null,
    bateriaCiclos: null,
    estadoComponente: null,
    ...overrides,
  });
}

describe('serializeProduct', () => {
  it('converts Product to plain ProductJson', () => {
    const p = makeProduct();
    const json = serializeProduct(p);
    expect(json.id).toBe('1');
    expect(json.marca).toBe('Apple');
    expect(json.precio).toBe(1899);
    expect(json.fotosGaleria).toEqual(['https://img1']);
  });

  it('preserves null fields', () => {
    const p = makeProduct({ modelo3dUrl: null, bateriaCondicion: null });
    const json = serializeProduct(p);
    expect(json.modelo3dUrl).toBeNull();
    expect(json.bateriaCondicion).toBeNull();
  });

  it('copies gallery as mutable array', () => {
    const p = makeProduct();
    const json = serializeProduct(p);
    json.fotosGaleria.push('https://img2');
    expect(json.fotosGaleria).toHaveLength(2);
  });
});
