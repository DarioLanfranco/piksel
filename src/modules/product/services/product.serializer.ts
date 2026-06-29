import type { Product } from '../../../domain/product/product.entity';
import type { ProductData } from '../../../domain/product/product.types';

export type ProductJson = {
  -readonly [K in keyof ProductData]: ProductData[K] extends ReadonlyArray<infer T> ? T[] : ProductData[K];
};

export function serializeProduct(product: Product): ProductJson {
  const json = {
    ...product,
    fotosGaleria: [...product.fotosGaleria],
  } satisfies Record<keyof ProductData, unknown>;

  return json as unknown as ProductJson;
}
