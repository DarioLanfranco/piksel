import { describe, it, expect, beforeEach } from 'vitest';
import {
  $cart,
  $cartTotal,
  $cartCount,
  $cartState,
  addItem,
  removeItem,
  updateQuantity,
  clearCart,
} from './cart.store';
import type { ProductData } from '../../../domain/product/product.types';

const testProduct: ProductData = {
  id: 'iphone-15',
  marca: 'Apple',
  modelo: 'iPhone 15',
  almacenamiento: '256GB',
  camaras: 'Dual 48MP',
  procesador: 'A16 Bionic',
  precio: 799,
  colorOficial: 'Black',
  fotosGaleria: ['https://example.com/photo.jpg'],
  modelo3dUrl: null,
  stock: true,
  bateriaCondicion: null,
  bateriaCiclos: null,
  estadoComponente: null,
};

const testProduct2: ProductData = {
  id: 'galaxy-s24',
  marca: 'Samsung',
  modelo: 'Galaxy S24',
  almacenamiento: '512GB',
  camaras: 'Triple 50MP',
  procesador: 'Exynos 2400',
  precio: 899,
  colorOficial: 'White',
  fotosGaleria: ['https://example.com/photo2.jpg'],
  modelo3dUrl: null,
  stock: true,
  bateriaCondicion: null,
  bateriaCiclos: null,
  estadoComponente: null,
};

beforeEach(() => {
  clearCart();
});

describe('addItem', () => {
  it('creates a new cart entry when key does not exist', () => {
    addItem(testProduct, 'Black');
    const cart = $cart.get();
    expect(Object.keys(cart)).toHaveLength(1);
    expect(cart['iphone-15::Black'].quantity).toBe(1);
    expect(cart['iphone-15::Black'].product.id).toBe('iphone-15');
  });

  it('increments quantity when the same key already exists', () => {
    addItem(testProduct, 'Black');
    addItem(testProduct, 'Black');
    const cart = $cart.get();
    expect(cart['iphone-15::Black'].quantity).toBe(2);
  });

  it('creates separate entries for different colors', () => {
    addItem(testProduct, 'Black');
    addItem(testProduct, 'White');
    const cart = $cart.get();
    expect(Object.keys(cart)).toHaveLength(2);
    expect(cart['iphone-15::Black'].quantity).toBe(1);
    expect(cart['iphone-15::White'].quantity).toBe(1);
  });

  it('stores different products independently', () => {
    addItem(testProduct, 'Black');
    addItem(testProduct2, 'White');
    const cart = $cart.get();
    expect(Object.keys(cart)).toHaveLength(2);
    expect(cart['iphone-15::Black'].product.marca).toBe('Apple');
    expect(cart['galaxy-s24::White'].product.marca).toBe('Samsung');
  });
});

describe('removeItem', () => {
  it('removes an existing item', () => {
    addItem(testProduct, 'Black');
    addItem(testProduct2, 'White');
    removeItem('iphone-15::Black');
    const cart = $cart.get();
    expect(Object.keys(cart)).toHaveLength(1);
    expect(cart['galaxy-s24::White']).toBeDefined();
    expect(cart['iphone-15::Black']).toBeUndefined();
  });

  it('does nothing when key does not exist', () => {
    addItem(testProduct, 'Black');
    removeItem('nonexistent::key');
    const cart = $cart.get();
    expect(Object.keys(cart)).toHaveLength(1);
  });
});

describe('updateQuantity', () => {
  it('updates the quantity of an existing item', () => {
    addItem(testProduct, 'Black');
    updateQuantity('iphone-15::Black', 5);
    expect($cart.get()['iphone-15::Black'].quantity).toBe(5);
  });

  it('clamps quantity to minimum 1 when given 0', () => {
    addItem(testProduct, 'Black');
    updateQuantity('iphone-15::Black', 0);
    expect($cart.get()['iphone-15::Black'].quantity).toBe(1);
  });

  it('clamps quantity to minimum 1 when given a negative number', () => {
    addItem(testProduct, 'Black');
    updateQuantity('iphone-15::Black', -3);
    expect($cart.get()['iphone-15::Black'].quantity).toBe(1);
  });

  it('floors decimal quantities', () => {
    addItem(testProduct, 'Black');
    updateQuantity('iphone-15::Black', 3.7);
    expect($cart.get()['iphone-15::Black'].quantity).toBe(3);
  });

  it('does nothing when key does not exist', () => {
    updateQuantity('nonexistent::key', 5);
    expect(Object.keys($cart.get())).toHaveLength(0);
  });
});

describe('clearCart', () => {
  it('removes all items', () => {
    addItem(testProduct, 'Black');
    addItem(testProduct2, 'White');
    clearCart();
    expect($cart.get()).toEqual({});
  });
});

describe('computed stores', () => {
  it('$cartTotal reflects sum of price * quantity', () => {
    addItem(testProduct, 'Black');
    addItem(testProduct2, 'White');
    expect($cartTotal.get()).toBe(799 + 899);
  });

  it('$cartTotal updates after quantity change', () => {
    addItem(testProduct, 'Black');
    updateQuantity('iphone-15::Black', 3);
    expect($cartTotal.get()).toBe(799 * 3);
  });

  it('$cartTotal is 0 when cart is empty', () => {
    expect($cartTotal.get()).toBe(0);
  });

  it('$cartCount reflects total item quantity', () => {
    addItem(testProduct, 'Black');
    addItem(testProduct, 'Black');
    addItem(testProduct2, 'White');
    expect($cartCount.get()).toBe(3);
  });

  it('$cartCount is 0 when cart is empty', () => {
    expect($cartCount.get()).toBe(0);
  });

  it('$cartState contains items, total, and count', () => {
    addItem(testProduct, 'Black');
    addItem(testProduct2, 'White');
    const state = $cartState.get();
    expect(state.items).toHaveLength(2);
    expect(state.total).toBe(799 + 899);
    expect(state.count).toBe(2);
  });

  it('$cartState returns empty arrays and 0 values when cart is empty', () => {
    const state = $cartState.get();
    expect(state.items).toEqual([]);
    expect(state.total).toBe(0);
    expect(state.count).toBe(0);
  });
});
