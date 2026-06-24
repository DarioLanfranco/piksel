import { atom, computed } from 'nanostores';
import type { ProductData } from '../../../domain/product/product.types';

export const $productList = atom<ProductData[]>([]);

export const $searchQuery = atom('');

export const $filteredProducts = computed(
  [$productList, $searchQuery],
  (products, query) => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return products;
    return products.filter(p => {
      const brand = (p.marca ?? '').toLowerCase();
      const model = (p.modelo ?? '').toLowerCase();
      return brand.includes(trimmed) || model.includes(trimmed);
    });
  },
);

export function setProductList(products: ProductData[]): void {
  $productList.set(products);
}

export function setSearchQuery(query: string): void {
  $searchQuery.set(query);
}
