import { create } from 'zustand'

interface ProductStore {
  selectedProduct: any | null;
  setSelectedProduct: (product: any) => void;
}

export const useProductStore = create<ProductStore>((set) => ({
  selectedProduct: null, // الحالة الابتدائية
  setSelectedProduct: (product) => set({ selectedProduct: product }),
}));
