import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  useMemo,
} from 'react';
import { getCartItems, updateCartItem, addCartItem } from '../api/cart';
import Toast from 'react-native-toast-message';

export interface CartItem {
  id: string;
  title: string;
  seller: string | null;
  qtyLabel: string;
  price: number;
  oldPrice?: number | null;
  deliveryDate?: string | null;
  imageUrl?: string | null;
  productId: string;
  quantity: number;
  minimumQuantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  fetchCart: (mode?: 'default' | 'refresh') => Promise<void>;
  updateQuantity: (item: CartItem, newQuantity: number) => Promise<void>;
  addToCart: (productId: string | number, quantity: number) => Promise<void>;
  getCartItemByProductId: (productId: string | number) => CartItem | null;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

const parseAmount = (value: any): number => {
  if (typeof value === 'number') {
    return value;
  }
  const parsed = parseFloat(value ?? '0');
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeCartItem = (item: any, index: number): CartItem => {
  const product = item;
  const quantity = Number(item?.quantity ?? product?.quantity ?? 1);
  const unitLabel =
    product?.unit ??
    product?.unit_of_measure ??
    product?.measurement_unit ??
    'Qty';
  const priceValue = item?.current_price;
  const oldPriceValue = item?.original_price;
  const productId = String(
    item?.product_id ?? item?.product?.id ?? product?.id ?? '',
  );
  const minimumQuantity = Number(
    item?.minimum_quantity ??
      item?.min_order_quantity ??
      product?.minimum_quantity ??
      product?.min_order_quantity ??
      1,
  );

  return {
    id: String(item?.id ?? item?.cart_item_id ?? `cart-item-${index}`),
    title: item?.product_name ?? 'Product',
    seller: item?.seller ?? product?.seller ?? product?.vendor_name ?? null,
    qtyLabel: `${quantity} ${unitLabel}`,
    price: priceValue,
    oldPrice: oldPriceValue,
    deliveryDate: item?.delivery_date ?? item?.deliveryDate ?? null,
    imageUrl: product?.product_image,
    productId: productId,
    quantity: quantity,
    minimumQuantity: minimumQuantity,
  };
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = useCallback(
    async (mode: 'default' | 'refresh' = 'default') => {
      if (mode === 'refresh') {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      try {
        setError(null);
        const payload = await getCartItems();
        const listSource = Array.isArray(payload?.items) ? payload.items : [];
        const normalized = listSource.map(normalizeCartItem);
        setCartItems(normalized);
      } catch (err: any) {
        setError(err?.message || 'Unable to load cart.');
        setCartItems([]);
      } finally {
        if (mode === 'refresh') {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [],
  );

  const updateQuantity = useCallback(
    async (item: CartItem, newQuantity: number) => {
      if (newQuantity < item.minimumQuantity) {
        Toast.show({
          type: 'error',
          text1: 'Invalid Quantity',
          text2: `Minimum quantity is ${item.minimumQuantity}`,
        });
        return;
      }

      if (!item.productId) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Product identifier not found.',
        });
        return;
      }

      try {
        await updateCartItem(item.id, {
          product: item.productId,
          quantity: newQuantity,
        });
        await fetchCart('refresh');
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1: 'Update Failed',
          text2:
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message ||
            'Unable to update quantity. Please try again.',
        });
        throw error;
      }
    },
    [fetchCart],
  );

  const addToCart = useCallback(
    async (productId: string | number, quantity: number) => {
      try {
        await addCartItem(productId, quantity);
        await fetchCart('refresh');
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1: 'Add to cart failed',
          text2: error?.message || 'Unable to add this product to cart.',
        });
        throw error;
      }
    },
    [fetchCart],
  );

  const getCartItemByProductId = useCallback(
    (productId: string | number): CartItem | null => {
      const productIdStr = String(productId);
      return cartItems.find(item => item.productId === productIdStr) ?? null;
    },
    [cartItems],
  );

  const clearCart = useCallback(() => {
    setCartItems([]);
    setError(null);
  }, []);

  const value = useMemo(
    () => ({
      cartItems,
      loading,
      refreshing,
      error,
      fetchCart,
      updateQuantity,
      addToCart,
      getCartItemByProductId,
      clearCart,
    }),
    [
      cartItems,
      loading,
      refreshing,
      error,
      fetchCart,
      updateQuantity,
      addToCart,
      getCartItemByProductId,
      clearCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
