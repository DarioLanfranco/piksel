import { z } from 'zod';

export const CartProductSchema = z.object({
  id: z.string(),
  marca: z.string(),
  modelo: z.string(),
  almacenamiento: z.string(),
  precio: z.number(),
  fotosGaleria: z.array(z.string()).readonly(),
});

export type CartProduct = z.infer<typeof CartProductSchema>;

export const CartItemSchema = z.object({
  product: CartProductSchema,
  quantity: z.number().min(1),
  selectedColor: z.string(),
});

export type CartItem = z.infer<typeof CartItemSchema>;
