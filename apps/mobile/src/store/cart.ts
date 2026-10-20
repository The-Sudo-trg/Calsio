import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * cart-store — client-side cart (§6.4): guest-friendly, persisted to AsyncStorage,
 * synced up at checkout where the server re-validates everything.
 */
export type CartItem = {
  sku: string;
  productSlug: string;
  name: string;
  size: string;
  colorName: string;
  price: number;
  mrp: number;
  image: string | null;
  isCodEnabled: boolean;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  add: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  setQuantity: (sku: string, quantity: number) => void;
  remove: (sku: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.sku === item.sku);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.sku === item.sku ? { ...i, quantity: Math.min(i.quantity + quantity, 5) } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: Math.min(quantity, 5) }] };
        }),
      setQuantity: (sku, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.sku !== sku)
              : state.items.map((i) => (i.sku === sku ? { ...i, quantity: Math.min(quantity, 5) } : i)),
        })),
      remove: (sku) => set((state) => ({ items: state.items.filter((i) => i.sku !== sku) })),
      clear: () => set({ items: [] }),
    }),
    { name: 'calsio-cart', storage: createJSONStorage(() => AsyncStorage) }
  )
);
