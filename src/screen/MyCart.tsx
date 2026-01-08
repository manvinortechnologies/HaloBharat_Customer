import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { ScaledSheet, ms, vs, s } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ion from 'react-native-vector-icons/Ionicons';
import NormalHeader from '../component/NormalHeader';
import ProductCard from '../component/Product';
import COLORS from '../constants/colors';
import { checkoutCart, removeCartItem, updateCartItem } from '../api/cart';
import Toast from 'react-native-toast-message';
import { useCart, CartItem } from '../context/CartContext';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BillDetails {
  itemTotal: number;
  deliveryFees: number;
  platformFees: number;
  gst: number;
  totalAmount: number;
}

interface DeliveryAddress {
  id?: string;
  name: string;
  phone?: string | null;
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
}

interface BestsellerItem {
  id: string;
  name: string;
  originalPrice?: number;
  discountedPrice?: number;
  image: any;
}

const MyCart = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { cartItems, loading, refreshing, error, fetchCart, updateQuantity } =
    useCart();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(
    () => new Set(),
  );
  const [billDetails, setBillDetails] = useState<BillDetails>({
    itemTotal: 0,
    deliveryFees: 0,
    platformFees: 0,
    gst: 0,
    totalAmount: 0,
  });
  const [deliveryAddress, setDeliveryAddress] =
    useState<DeliveryAddress | null>(null);
  const [bestsellerProducts, setBestsellerProducts] = useState<
    BestsellerItem[]
  >([]);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);
  const [confirmRemoveVisible, setConfirmRemoveVisible] = useState(false);
  const [pendingRemovalItem, setPendingRemovalItem] = useState<CartItem | null>(
    null,
  );
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const parseAmount = useCallback((value: any) => {
    if (typeof value === 'number') {
      return value;
    }
    const parsed = parseFloat(value ?? '0');
    return Number.isFinite(parsed) ? parsed : 0;
  }, []);

  const normalizeCartItem = useCallback(
    (item: any, index: number): CartItem => {
      const product = item;
      const quantity = Number(item?.quantity ?? product?.quantity ?? 1);
      const unitLabel =
        product?.unit ??
        product?.unit_of_measure ??
        product?.measurement_unit ??
        'Qty';
      const imageCandidate =
        product?.images?.find((img: any) => img?.url)?.url ?? product?.image;

      const priceValue = item?.current_price;
      const oldPriceValue = item?.original_price;
      const productId = String(
        item?.product_id ?? item?.product?.id ?? product?.id ?? '',
      );
      const minimumQuantity = Number(item?.min_order_quantity || 1);

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
    },
    [parseAmount],
  );

  const normalizeAddress = useCallback((address: any): DeliveryAddress => {
    if (!address) {
      return {
        name: 'Add delivery address',
      };
    }

    return {
      id: address?.id ? String(address.id) : undefined,
      name:
        address?.full_name ??
        address?.contact_name ??
        address?.name ??
        'Delivery Address',
      phone:
        address?.phone ?? address?.contact_phone ?? address?.mobile ?? null,
      line1:
        address?.building ??
        address?.address_line_1 ??
        address?.addressLine1 ??
        null,
      line2:
        address?.locality ??
        address?.address_line_2 ??
        address?.addressLine2 ??
        null,
      city: address?.city ?? null,
      state: address?.state ?? null,
      pincode: address?.pincode ?? address?.pin_code ?? null,
    };
  }, []);

  const normalizeBestseller = useCallback(
    (product: any, index: number): BestsellerItem => {
      const imageUrl =
        product?.images?.find((img: any) => img?.url)?.url ?? product?.image;
      const originalPriceRaw = Number(product?.mrp ?? 0);
      const discountedPriceRaw = parseAmount(
        product?.price ?? product?.sale_price,
      );
      const originalPriceValue =
        Number.isFinite(originalPriceRaw) && originalPriceRaw > 0
          ? originalPriceRaw
          : undefined;
      const discountedPriceValue =
        Number.isFinite(discountedPriceRaw) && discountedPriceRaw > 0
          ? discountedPriceRaw
          : undefined;
      return {
        id: String(product?.id ?? `bestseller-${index}`),
        name: product?.name ?? product?.title ?? 'Product',
        originalPrice: originalPriceValue,
        discountedPrice: discountedPriceValue,
        image: { uri: imageUrl },
      };
    },
    [parseAmount],
  );

  const fetchCartWithDetails = useCallback(async () => {
    try {
      const { getCartItems } = await import('../api/cart');
      const payload = await getCartItems();

      if (cartItems.length === 0) {
        setSelectedItems(new Set());
      } else {
        setSelectedItems(prev => {
          const next = new Set<string>();
          if (prev.size === 0) {
            cartItems.forEach((item: CartItem) => next.add(item.id));
          } else {
            cartItems.forEach((item: CartItem) => {
              if (prev.has(item.id)) {
                next.add(item.id);
              }
            });
            if (next.size === 0) {
              cartItems.forEach((item: CartItem) => next.add(item.id));
            }
          }
          return next;
        });
      }

      const apiBill = payload?.bill_details ?? {};
      setBillDetails({
        itemTotal: parseAmount(apiBill?.item_total),
        deliveryFees: parseAmount(apiBill?.delivery_fees),
        platformFees: parseAmount(apiBill?.platform_fees),
        gst: parseAmount(apiBill?.gst),
        totalAmount: parseAmount(apiBill?.total),
      });

      setDeliveryAddress(
        payload?.delivery_address
          ? normalizeAddress(payload.delivery_address)
          : null,
      );

      const bestsellerSource = Array.isArray(payload?.bestsellers)
        ? payload.bestsellers
        : [];
      setBestsellerProducts(
        bestsellerSource.map((product: any, index: number) =>
          normalizeBestseller(product, index),
        ),
      );
    } catch (err: any) {
      // Error handling for bill details
    }
  }, [cartItems, parseAmount, normalizeAddress, normalizeBestseller]);

  useEffect(() => {
    fetchCart();
    fetchCartWithDetails();
  }, []);

  // Refresh cart details when screen comes into focus (e.g., after adding address)
  useFocusEffect(
    useCallback(() => {
      fetchCartWithDetails();
    }, [fetchCartWithDetails]),
  );

  const addressLine = useMemo(() => {
    if (!deliveryAddress) {
      return null;
    }

    const parts = [
      deliveryAddress.line1,
      deliveryAddress.line2,
      deliveryAddress.city,
      deliveryAddress.state,
      deliveryAddress.pincode,
    ].filter(Boolean);

    return parts.join(', ');
  }, [deliveryAddress]);

  const handleRemoveItem = useCallback((item: CartItem) => {
    setPendingRemovalItem(item);
    setConfirmRemoveVisible(true);
  }, []);

  const handleCancelRemove = useCallback(() => {
    setPendingRemovalItem(null);
    setConfirmRemoveVisible(false);
  }, []);

  const handleConfirmRemove = useCallback(async () => {
    if (!pendingRemovalItem) {
      return;
    }
    const targetId = pendingRemovalItem.id;
    try {
      setRemovingItemId(targetId);
      await removeCartItem(targetId);
      await fetchCart('refresh');
      await fetchCartWithDetails();
      setSelectedItems(prevSelected => {
        const next = new Set(prevSelected);
        next.delete(targetId);
        if (next.size === 0 && cartItems.length > 1) {
          cartItems
            .filter(item => item.id !== targetId)
            .forEach(cartItem => next.add(cartItem.id));
        }
        return next;
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Remove Failed',
        text2:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          'Unable to remove item. Please try again.',
      });
    } finally {
      setRemovingItemId(null);
      setConfirmRemoveVisible(false);
      setPendingRemovalItem(null);
    }
  }, [pendingRemovalItem, fetchCart, fetchCartWithDetails, cartItems]);

  const handleUpdateQuantity = useCallback(
    async (item: CartItem, newQuantity: number) => {
      try {
        setUpdatingItemId(item.id);
        await updateQuantity(item, newQuantity);
        await fetchCartWithDetails();
      } catch (error: any) {
        // Error is already handled in context
      } finally {
        setUpdatingItemId(null);
      }
    },
    [updateQuantity, fetchCartWithDetails],
  );

  const handleDecreaseQuantity = useCallback(
    (item: CartItem) => {
      const newQuantity = item.quantity - 1;
      if (newQuantity >= item.minimumQuantity) {
        handleUpdateQuantity(item, newQuantity);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Invalid Quantity',
          text2: `Minimum quantity is ${item.minimumQuantity}`,
        });
      }
    },
    [handleUpdateQuantity],
  );

  const handleIncreaseQuantity = useCallback(
    (item: CartItem) => {
      handleUpdateQuantity(item, item.quantity + 1);
    },
    [handleUpdateQuantity],
  );

  const handleCheckout = useCallback(async () => {
    if (cartItems.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Cart Empty',
        text2: 'Please add items to cart before checkout.',
      });
      return;
    }

    if (!deliveryAddress || !deliveryAddress.id) {
      Toast.show({
        type: 'error',
        text1: 'Delivery Address Required',
        text2: 'Please add a delivery address before checkout.',
      });
      navigation.navigate('AddAddress');
      return;
    }

    try {
      setCheckoutLoading(true);
      const selectedIds =
        selectedItems.size > 0
          ? Array.from(selectedItems)
          : cartItems.map(item => item.id);
      const payload: Record<string, any> = {
        delivery_address_id: deliveryAddress?.id,
        delivery_address_text: addressLine ?? 'Manual address',
        delivery_datetime: new Date().toISOString(),
        contact_phone: deliveryAddress?.phone ?? '+91-0000000000',
        payment_method: 'Cash on Delivery',
        note: '',
        shipping_amount: billDetails.deliveryFees.toFixed(2).toString(),
        cart_item_ids: selectedIds,
      };
      if (!deliveryAddress?.id) {
        delete payload.delivery_address_id;
      }
      const response = await checkoutCart(payload);
      navigation.replace('PaymentConfirmation', {
        order: response,
        deliveryAddress: {
          name: deliveryAddress?.name ?? 'Delivery Address',
          addressLine1: addressLine ?? payload.delivery_address_text ?? '',
          phone: deliveryAddress?.phone ?? payload.contact_phone,
        },
        paymentMethod: payload.payment_method,
      });
      setSelectedItems(new Set());
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Checkout Failed',
        text2:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          'Unable to complete checkout.',
      });
    } finally {
      setCheckoutLoading(false);
    }
  }, [
    cartItems,
    selectedItems,
    deliveryAddress,
    addressLine,
    billDetails.deliveryFees,
  ]);

  const handleToggleSelection = useCallback((itemId: string) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  }, []);

  return (
    <View
      style={[
        styles.safeArea,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      {/* Header Section */}
      <NormalHeader title="Cart" />

      {/* Progress Bar Section */}
      <View style={styles.progressContainer}>
        {/* Shipping Step */}
        <View style={styles.stepContainer}>
          <View style={styles.activeLine} />
          <Text style={styles.activeStep}>Shipping</Text>
        </View>

        {/* Payment Step */}
        <View style={styles.stepContainer}>
          <View style={styles.inactiveLine} />
          <Text style={styles.inactiveStep}>Payment</Text>
        </View>

        {/* Confirmation Step */}
        <View style={styles.stepContainer}>
          <View style={styles.inactiveLine} />
          <Text style={styles.inactiveStep}>Confirmation</Text>
        </View>
      </View>

      {/* Scrollable Cart Items */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: vs(100) }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchCart('refresh')}
            tintColor={COLORS.primary}
          />
        }
      >
        {error ? (
          <TouchableOpacity
            style={styles.errorBanner}
            onPress={() => fetchCart()}
          >
            <Icon name="error-outline" size={ms(18)} color={COLORS.accentRed} />
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.retryText}>Tap to retry</Text>
          </TouchableOpacity>
        ) : null}

        {loading && cartItems.length === 0 ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loaderText}>Loading your cart...</Text>
          </View>
        ) : null}

        {cartItems.length === 0 && !loading && !error ? (
          <View style={styles.emptyContainer}>
            <Icon name="shopping-cart" size={80} color={COLORS.gray700} />
            <Text style={styles.emptyText}>Your cart is empty</Text>
            <Text style={styles.emptySubtext}>
              Add products to view them here.
            </Text>
          </View>
        ) : null}

        {cartItems.map(item => {
          const isSelected = selectedItems.has(item.id);
          return (
            <View key={item.id} style={styles.cartCard}>
              <View style={styles.rowBetween}>
                <View
                  style={{
                    flexDirection: 'row',
                    gap: 8,
                    alignItems: 'flex-start',
                  }}
                >
                  <View style={styles.selectionColumn}>
                    <TouchableOpacity
                      onPress={() => handleToggleSelection(item.id)}
                      style={[
                        styles.checkbox,
                        isSelected && styles.checkboxActive,
                      ]}
                    >
                      {isSelected && (
                        <Icon name="check" size={ms(14)} color={COLORS.white} />
                      )}
                    </TouchableOpacity>
                  </View>
                  <View style={styles.cartImageContainer}>
                    {item.imageUrl ? (
                      <Image
                        source={{ uri: item.imageUrl }}
                        style={styles.cartImage}
                      />
                    ) : (
                      <MaterialIcons
                        name="image"
                        size={s(40)}
                        color={COLORS.primary}
                      />
                    )}
                  </View>
                  <View style={styles.cartDetails}>
                    <Text style={styles.title}>{item.title}</Text>
                    {item.seller ? (
                      <Text style={styles.seller}>Seller - {item.seller}</Text>
                    ) : null}

                    <View style={styles.quantityControlsContainer}>
                      <Text style={styles.qtyLabel}>Quantity:</Text>
                      <View style={styles.quantityControls}>
                        <TouchableOpacity
                          style={[
                            styles.quantityButton,
                            item.quantity <= item.minimumQuantity &&
                              styles.quantityButtonDisabled,
                          ]}
                          onPress={() => handleDecreaseQuantity(item)}
                          disabled={
                            updatingItemId === item.id ||
                            item.quantity <= item.minimumQuantity
                          }
                        >
                          <Icon
                            name="remove"
                            size={ms(18)}
                            color={
                              item.quantity <= item.minimumQuantity
                                ? COLORS.gray700
                                : COLORS.black
                            }
                          />
                        </TouchableOpacity>
                        {updatingItemId === item.id ? (
                          <ActivityIndicator
                            size="small"
                            color={COLORS.primary}
                            style={styles.quantityLoader}
                          />
                        ) : (
                          <Text style={styles.quantityText}>
                            {item.quantity}
                          </Text>
                        )}
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => handleIncreaseQuantity(item)}
                          disabled={updatingItemId === item.id}
                        >
                          <Icon name="add" size={ms(18)} color={COLORS.black} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.qtyContainer}>
                      <Text style={styles.deliveryText}>
                        {item.deliveryDate
                          ? `${item.deliveryDate}`
                          : 'Delivery in 3 days'}
                      </Text>
                    </View>
                    <View style={styles.priceRow}>
                      <Text style={styles.price}>Rs {item.price}</Text>
                      {item.oldPrice && item.oldPrice > item.price ? (
                        <Text style={styles.oldPrice}>Rs {item.oldPrice}</Text>
                      ) : null}
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  disabled={removingItemId === item.id}
                  onPress={() => handleRemoveItem(item)}
                >
                  {removingItemId === item.id ? (
                    <ActivityIndicator size="small" color={COLORS.black} />
                  ) : (
                    <Icon name="close" size={ms(20)} color={COLORS.black} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {/* Delivery Section */}
        <View style={styles.deliveryContainer}>
          {deliveryAddress && deliveryAddress.id ? (
            <>
              <Text style={styles.deliveryTitle}>
                Delivery To -{' '}
                <Text style={styles.deliveryName}>{deliveryAddress.name}</Text>
              </Text>
              {addressLine ? (
                <Text style={styles.deliveryText2}>{addressLine}</Text>
              ) : null}
              {deliveryAddress.phone ? (
                <Text style={styles.deliveryText2}>
                  Mobile - {deliveryAddress.phone}
                </Text>
              ) : null}
              <TouchableOpacity
                style={styles.editIcon}
                onPress={() => navigation.navigate('AddAddress')}
              >
                <Icon name="edit" size={ms(18)} color={COLORS.black} />
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.noAddressContainer}>
              <View style={styles.noAddressContent}>
                <Icon
                  name="location-on"
                  size={ms(24)}
                  color={COLORS.primary}
                  style={styles.addressIcon}
                />
                <View style={styles.noAddressTextContainer}>
                  <Text style={styles.noAddressTitle}>
                    No delivery address found
                  </Text>
                  <Text style={styles.noAddressSubtitle}>
                    Please add a delivery address to continue
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.addAddressButton}
                onPress={() => navigation.navigate('AddAddress')}
              >
                <Text style={styles.addAddressButtonText}>Add Address</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Bill Details */}
        <View style={styles.billContainer}>
          <Text style={styles.billTitle}>BILL DETAILS</Text>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Item Total</Text>
            <Text style={styles.billAmount}>Rs {billDetails.itemTotal}</Text>
          </View>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery Fees</Text>
            <Text style={styles.billAmount}>Rs {billDetails.deliveryFees}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Platform Fees</Text>
            <Text style={styles.billAmount}>Rs {billDetails.platformFees}</Text>
          </View>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>GST</Text>
            <Text style={styles.billAmount}>Rs {billDetails.gst}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.billRow}>
            <Text style={styles.totalLabel}>To Pay</Text>
            <Text style={styles.totalAmount}>Rs {billDetails.totalAmount}</Text>
          </View>
        </View>

        {bestsellerProducts.length > 0 ? (
          <View style={{ marginTop: 10, backgroundColor: COLORS.white }}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>BESTSELLERS FOR YOU</Text>
              <TouchableOpacity
                style={styles.seeAllButton}
                onPress={() => navigation.navigate('ProductList')}
              >
                <Text style={styles.seeAllText}>See all</Text>
                <Ion
                  name="chevron-forward"
                  size={14}
                  color={COLORS.textStone}
                />
              </TouchableOpacity>
            </View>

            <FlatList
              data={bestsellerProducts}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <ProductCard
                  item={item}
                  variant="horizontal"
                  onPress={() =>
                    navigation.navigate('ProductDetail', { productId: item.id })
                  }
                />
              )}
              contentContainerStyle={{ paddingVertical: 10, marginLeft: 10 }}
            />
          </View>
        ) : null}
      </ScrollView>

      {/* Fixed Bottom Checkout Button */}
      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom }]}>
        <TouchableOpacity
          style={[
            styles.checkoutButton,
            (checkoutLoading ||
              cartItems.length === 0 ||
              selectedItems.size === 0 ||
              !deliveryAddress ||
              !deliveryAddress.id) &&
              styles.checkoutButtonDisabled,
          ]}
          onPress={handleCheckout}
          disabled={
            checkoutLoading ||
            cartItems.length === 0 ||
            selectedItems.size === 0 ||
            !deliveryAddress ||
            !deliveryAddress.id
          }
        >
          {checkoutLoading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.checkoutText}>Checkout</Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={confirmRemoveVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCancelRemove}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalContent}>
            <Text style={styles.confirmTitle}>Remove Item</Text>
            <Text style={styles.confirmMessage}>
              {pendingRemovalItem
                ? `Remove "${pendingRemovalItem.title}" from your cart?`
                : 'Remove this item from your cart?'}
            </Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.outlineButton]}
                onPress={handleCancelRemove}
                disabled={removingItemId != null}
              >
                <Text
                  style={[styles.modalButtonText, styles.outlineButtonText]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.destructiveButton]}
                onPress={handleConfirmRemove}
                disabled={removingItemId === pendingRemovalItem?.id}
              >
                {removingItemId === pendingRemovalItem?.id ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.modalButtonText}>Remove</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default MyCart;

const styles = ScaledSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.gray975,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: '10@vs',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeLine: {
    width: '40@s',
    height: '4@vs',
    backgroundColor: COLORS.black,
    borderRadius: '2@s',
    marginRight: '6@s',
  },

  inactiveLine: {
    width: '30@s',
    height: '3@vs',
    backgroundColor: COLORS.gray700,
    borderRadius: '2@s',
    marginRight: '6@s',
  },

  activeStep: {
    fontSize: '13@ms',
    fontWeight: '500',
    color: COLORS.black,
    marginRight: '6@s',
  },

  inactiveStep: {
    fontSize: '13@ms',
    color: COLORS.black,
    fontWeight: '500',
    marginRight: '6@s',
  },

  scrollView: {
    flex: 1,
  },
  cartCard: {
    backgroundColor: COLORS.white,
    borderWidth: 0.8,
    borderColor: COLORS.gray925,
    borderRadius: '8@s',
    padding: '10@s',
    marginVertical: '8@vs',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  selectionColumn: {
    alignItems: 'center',
    marginRight: '4@s',
    marginTop: '2@vs',
  },
  checkbox: {
    width: '18@s',
    height: '18@s',
    borderRadius: '4@s',
    borderWidth: 1,
    borderColor: COLORS.gray700,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  checkboxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxLabel: {
    marginTop: '4@vs',
    fontSize: '10@ms',
    color: COLORS.textAsh,
  },
  cartImageContainer: {
    width: '80@s',
    height: '80@s',
    borderRadius: '6@s',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray900,
  },
  cartImage: {
    width: '100%',
    height: '100%',
    borderRadius: '6@s',
  },
  cartDetails: {
    marginTop: '2@vs',
    marginLeft: '5@s',
  },
  title: {
    width: '55%',
    fontSize: '12@ms',
    fontWeight: '500',
    color: COLORS.black,
  },
  seller: {
    fontSize: '11@ms',
    color: COLORS.textSubtle,
    marginVertical: '2@vs',
  },
  qtyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: '3@vs',
    gap: '25@s',
  },
  qtyText: {
    // width: '40%',
    fontSize: '12@ms',
    color: COLORS.black,
    backgroundColor: COLORS.gray850,
    paddingHorizontal: '6@s',
    // marginRight: '10@s',
    marginBottom: '2@s',
  },
  quantityControlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: '6@vs',
    gap: '8@s',
  },
  qtyLabel: {
    fontSize: '12@ms',
    color: COLORS.textSemiDark,
    fontWeight: '500',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '12@s',
    borderWidth: 1,
    borderColor: COLORS.gray850,
    borderRadius: '6@s',
    paddingHorizontal: '8@s',
    paddingVertical: '4@vs',
  },
  quantityButton: {
    width: '28@s',
    height: '28@s',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4@s',
    backgroundColor: COLORS.gray900,
  },
  quantityButtonDisabled: {
    opacity: 0.5,
    backgroundColor: COLORS.gray850,
  },
  quantityText: {
    fontSize: '14@ms',
    fontWeight: '600',
    color: COLORS.black,
    minWidth: '30@s',
    textAlign: 'center',
  },
  quantityLoader: {
    marginHorizontal: '8@s',
  },
  deliveryText: {
    fontSize: '10@ms',
    color: COLORS.white,
    backgroundColor: COLORS.accentClay,
    paddingHorizontal: '8@s',
    paddingVertical: '2@vs',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: '13@ms',
    fontWeight: '600',
    color: COLORS.black,
    marginRight: '4@s',
  },
  oldPrice: {
    fontSize: '11@ms',
    color: COLORS.gray400,
    textDecorationLine: 'line-through',
  },
  deliveryContainer: {
    marginTop: '10@vs',
    backgroundColor: COLORS.white,
    padding: '12@s',
    paddingHorizontal: '25@s',
    borderRadius: '8@s',
    borderWidth: 0.8,
    borderColor: COLORS.gray925,
    position: 'relative',
  },
  deliveryTitle: {
    fontSize: '13@ms',
    color: COLORS.black,
    fontWeight: '900',
  },
  deliveryName: {
    fontWeight: '500',
  },
  deliveryText2: {
    fontSize: '12@ms',
    color: COLORS.black,
    fontWeight: '500',
    marginTop: '3@vs',
  },
  editIcon: {
    position: 'absolute',
    right: '10@s',
    top: '10@vs',
  },
  noAddressContainer: {
    paddingVertical: '8@vs',
  },
  noAddressContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '12@vs',
  },
  addressIcon: {
    marginRight: '12@s',
  },
  noAddressTextContainer: {
    flex: 1,
  },
  noAddressTitle: {
    fontSize: '14@ms',
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: '4@vs',
  },
  noAddressSubtitle: {
    fontSize: '12@ms',
    color: COLORS.textSemiDark,
  },
  addAddressButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: '12@vs',
    paddingHorizontal: '20@s',
    borderRadius: '8@s',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addAddressButtonText: {
    fontSize: '14@ms',
    fontWeight: '600',
    color: COLORS.white,
  },
  billContainer: {
    backgroundColor: COLORS.white,
    borderRadius: '10@s',
    paddingHorizontal: '30@s',
    padding: '10@s',
    marginVertical: '10@vs',
  },
  billTitle: {
    fontSize: '13@ms',
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: '10@vs',
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: '5@vs',
  },
  billLabel: {
    fontSize: '12@ms',
    color: COLORS.black,
    fontWeight: '500',
  },
  billAmount: {
    fontSize: '12@ms',
    color: COLORS.black,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.gray825,
    marginVertical: '8@vs',
  },
  totalLabel: {
    fontSize: '13@ms',
    fontWeight: '700',
    color: COLORS.black,
  },
  totalAmount: {
    fontSize: '13@ms',
    fontWeight: '900',
    color: COLORS.black,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: '5@vs',
    paddingHorizontal: '8@s',
  },
  sectionTitle: {
    fontSize: '13@ms',
    fontWeight: '700',
    marginTop: '15@vs',
    color: COLORS.black,
  },
  seeAllButton: {
    flexDirection: 'row',
    gap: '2@s',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: '12@ms',
    color: COLORS.textStone,
    fontWeight: '400',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: '40@vs',
  },
  emptyText: {
    fontSize: '18@ms',
    fontWeight: '600',
    color: COLORS.textSemiDark,
    marginTop: '20@vs',
    marginBottom: '8@vs',
  },
  emptySubtext: {
    fontSize: '14@ms',
    color: COLORS.textAsh,
    textAlign: 'center',
  },
  confirmationCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: '16@s',
    marginVertical: '20@vs',
    borderRadius: '12@s',
    paddingVertical: '20@vs',
    paddingHorizontal: '16@s',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: COLORS.gray900,
  },
  confirmationIcon: {
    width: '48@s',
    height: '48@s',
    borderRadius: '24@s',
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12@vs',
  },
  confirmationTitle: {
    textAlign: 'center',
    fontSize: '14@ms',
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: '8@vs',
  },
  confirmationTime: {
    fontSize: '12@ms',
    color: COLORS.textAsh,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.infoSurface,
    borderRadius: '10@s',
    paddingHorizontal: '12@s',
    paddingVertical: '8@vs',
    marginVertical: '10@vs',
    marginHorizontal: '8@s',
    gap: '8@s',
  },
  errorText: {
    flex: 1,
    fontSize: '12@ms',
    color: COLORS.textDark,
  },
  retryText: {
    fontSize: '12@ms',
    color: COLORS.primary,
    fontWeight: '600',
  },
  loaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8@s',
    paddingVertical: '20@vs',
  },
  loaderText: {
    fontSize: '13@ms',
    color: COLORS.textDark,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: COLORS.white,
    borderTopWidth: 0.5,
    borderColor: COLORS.gray800,
    padding: '10@s',
  },
  checkoutButton: {
    backgroundColor: COLORS.primary,
    borderRadius: '8@s',
    alignItems: 'center',
    paddingVertical: '10@vs',
    marginHorizontal: '20@s',
  },
  checkoutButtonDisabled: {
    opacity: 0.6,
  },
  checkoutText: {
    color: COLORS.white,
    fontSize: '14@ms',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '20@s',
  },
  modalContent: {
    width: '90%',
    backgroundColor: COLORS.white,
    borderRadius: '16@s',
    paddingVertical: '24@vs',
    paddingHorizontal: '20@s',
    alignItems: 'center',
    position: 'relative',
  },
  modalClose: {
    position: 'absolute',
    top: '12@vs',
    right: '12@s',
  },
  modalTitle: {
    fontSize: '18@ms',
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: '8@vs',
  },
  modalSubtitle: {
    fontSize: '13@ms',
    color: COLORS.textAsh,
    textAlign: 'center',
    marginBottom: '20@vs',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: '12@s',
  },
  modalButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: '10@s',
    paddingVertical: '12@vs',
    alignItems: 'center',
  },
  modalButtonText: {
    color: COLORS.white,
    fontSize: '14@ms',
    fontWeight: '600',
  },
  confirmModalContent: {
    width: '90%',
    backgroundColor: COLORS.white,
    borderRadius: '16@s',
    paddingVertical: '24@vs',
    paddingHorizontal: '20@s',
  },
  confirmTitle: {
    fontSize: '18@ms',
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: '8@vs',
    textAlign: 'center',
  },
  confirmMessage: {
    fontSize: '13@ms',
    color: COLORS.textSemiDark,
    textAlign: 'center',
    marginBottom: '20@vs',
  },
  confirmActions: {
    flexDirection: 'row',
    gap: '12@s',
  },
  outlineButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray800,
  },
  outlineButtonText: {
    color: COLORS.textDark,
  },
  destructiveButton: {
    backgroundColor: COLORS.accentRed ?? '#C62828',
  },
  createProjectContent: {
    width: '90%',
    backgroundColor: COLORS.white,
    borderRadius: '16@s',
    paddingVertical: '24@vs',
    paddingHorizontal: '20@s',
    alignItems: 'center',
    position: 'relative',
  },
  projectInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.gray800,
    borderRadius: '10@s',
    paddingHorizontal: '12@s',
    paddingVertical: '10@vs',
    fontSize: '14@ms',
    marginTop: '16@vs',
    marginBottom: '12@vs',
    color: COLORS.black,
  },
  saveProjectButton: {
    width: '100%',
    marginTop: '4@vs',
  },
});
