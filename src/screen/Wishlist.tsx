import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { s, ScaledSheet } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import NormalHeader from '../component/NormalHeader';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import COLORS from '../constants/colors';
import { getWishlist, removeWishlistItem } from '../api/wishlist';
import { addCartItem, getCartItems } from '../api/cart';
import Toast from 'react-native-toast-message';
import { CartItem, useCart } from '../context/CartContext';

interface WishlistProduct {
  id: string;
  name: string;
  price?: number | null;
  originalPrice?: number | null;
  discountLabel?: string | null;
  imageUrl?: string | null;
  rating?: number | null;
  reviews?: number | null;
  soldCount?: string | null;
  deliveryText?: string | null;
  isBestseller?: boolean;
  productId?: string;
  minOrderQuantity?: number;
}

const Wishlist = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { getCartItemByProductId, cartItems, fetchCart } = useCart();
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [priceSort, setPriceSort] = useState<
    'low-to-high' | 'high-to-low' | null
  >(null);
  const [nameSort, setNameSort] = useState<'a-to-z' | 'z-to-a' | null>(null);
  const [wishlistItems, setWishlistItems] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);
  const [addingToCartId, setAddingToCartId] = useState<string | null>(null);

  const toggleWishlist = async (wishlistItemId: string) => {
    setRemovingItemId(wishlistItemId);
    try {
      await removeWishlistItem(wishlistItemId);
      // Remove from local state only after successful API call
      setWishlistItems(prev => prev.filter(item => item.id !== wishlistItemId));
    } catch (err: any) {
      setError(err?.message || 'Failed to remove item from wishlist');
      // Optionally show an alert or toast here
      console.error('Error removing wishlist item:', err);
    } finally {
      setRemovingItemId(null);
    }
  };

  const normalizeWishlistItem = useCallback((item: any, index: number) => {
    // Handle nested product structure: item.product_detail contains product data
    // item.id is the wishlist item ID (needed for removal)
    const product = item?.product_detail ?? item?.product ?? item;
    const wishlistItemId = item?.id; // This is the wishlist item ID, not product ID

    // Use price_including_gst if available, otherwise use price
    const priceValue =
      typeof product?.price_including_gst === 'number'
        ? product.price_including_gst
        : typeof product?.price === 'number'
        ? product.price
        : Number(product?.price ?? product?.current_price ?? 0);

    const originalPriceValue = Number(product?.mrp ?? 0);

    // Get first image from images array if available
    const imageUrl =
      Array.isArray(product?.images) && product.images.length > 0
        ? product.images[0]?.url ?? product.images[0]
        : product?.image ??
          product?.thumbnail ??
          product?.featured_image ??
          product?.primary_image ??
          null;

    // Calculate discount if original price exists and is higher
    const discountLabel =
      product?.discount_label ??
      (Number.isFinite(priceValue) &&
      Number.isFinite(originalPriceValue) &&
      originalPriceValue &&
      priceValue &&
      originalPriceValue > priceValue
        ? `${Math.round(
            ((originalPriceValue - priceValue) / originalPriceValue) * 100,
          )}% Off`
        : null);

    const minOrderQuantity =
      typeof product?.min_order_quantity === 'number'
        ? product.min_order_quantity
        : Number(product?.min_order_quantity ?? 1);

    return {
      id: String(wishlistItemId ?? product?.id ?? `wishlist-${index}`), // Use wishlist item ID for removal
      name: product?.name ?? product?.title ?? 'Product',
      price: Number.isFinite(priceValue) ? priceValue : null,
      originalPrice: originalPriceValue,
      discountLabel,
      imageUrl,
      rating: product.average_rating,
      reviews: product.reviews_count || product.reviews.length || 0,
      soldCount: product.sold_count,
      deliveryText: product.delivery_days,
      isBestseller: Boolean(product?.best_seller),
      productId: String(product?.id ?? item?.product ?? ''),
      minOrderQuantity: Number.isFinite(minOrderQuantity)
        ? minOrderQuantity
        : 1,
    };
  }, []);

  const fetchWishlist = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      try {
        const payload = await getWishlist();
        const listSource = Array.isArray(payload?.results)
          ? payload.results
          : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
          ? payload
          : [];
        const normalized = listSource.map(normalizeWishlistItem);
        setWishlistItems(normalized);
      } catch (err: any) {
        setError(err?.message || 'Unable to load wishlist.');
        setWishlistItems([]);
      } finally {
        if (isRefresh) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [normalizeWishlistItem],
  );

  const handleRefresh = useCallback(() => {
    fetchWishlist(true);
  }, [fetchWishlist]);

  useEffect(() => {
    fetchWishlist();
    fetchCart();
  }, [fetchWishlist, fetchCart]);

  // Apply filters and sorting to wishlist items
  const sortedWishlistItems = useMemo(() => {
    let sorted = [...wishlistItems];

    // Apply price sorting
    if (priceSort === 'low-to-high') {
      sorted.sort((a, b) => {
        const priceA = a.price ?? 0;
        const priceB = b.price ?? 0;
        return priceA - priceB;
      });
    } else if (priceSort === 'high-to-low') {
      sorted.sort((a, b) => {
        const priceA = a.price ?? 0;
        const priceB = b.price ?? 0;
        return priceB - priceA;
      });
    }

    // Apply name sorting
    if (nameSort === 'a-to-z') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (nameSort === 'z-to-a') {
      sorted.sort((a, b) => b.name.localeCompare(a.name));
    }

    return sorted;
  }, [wishlistItems, priceSort, nameSort]);

  // Get selected filter labels for display
  const selectedFilters = useMemo(() => {
    const filters: string[] = [];
    if (priceSort === 'low-to-high') filters.push('Price: Low to High');
    if (priceSort === 'high-to-low') filters.push('Price: High to Low');
    if (nameSort === 'a-to-z') filters.push('A to Z');
    if (nameSort === 'z-to-a') filters.push('Z to A');
    return filters;
  }, [priceSort, nameSort]);

  const handleFilterSelect = (type: 'price' | 'name', value: string | null) => {
    if (type === 'price') {
      setPriceSort(value as 'low-to-high' | 'high-to-low' | null);
    } else {
      setNameSort(value as 'a-to-z' | 'z-to-a' | null);
    }
  };

  const handleClearFilters = () => {
    setPriceSort(null);
    setNameSort(null);
  };

  const handleAddToCart = async (product: WishlistProduct) => {
    const productId = product.productId;
    if (!productId) {
      Toast.show({
        type: 'error',
        text1: 'Unable to add to cart',
        text2: 'Missing product identifier.',
      });
      return;
    }

    try {
      setAddingToCartId(product.id);
      await addCartItem(productId, product.minOrderQuantity ?? 1);
      // Refresh cart to update the UI
      await fetchCart();
      Alert.alert('Added to cart', 'Product added to your cart.', [
        { text: 'View Cart', onPress: () => navigation.navigate('MyCart') },
        { text: 'OK' },
      ]);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Add to cart failed',
        text2:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          'Unable to add this product to cart.',
      });
    } finally {
      setAddingToCartId(null);
    }
  };

  const renderProductCard = ({
    item,
    index,
  }: {
    item: WishlistProduct;
    index: number;
  }) => {
    const isLeftColumn = index % 2 === 0;
    const cartItem = item.productId
      ? getCartItemByProductId(item.productId)
      : null;
    const isProductInCart = cartItem !== null;

    return (
      <TouchableOpacity
        style={[
          styles.productCard,
          isLeftColumn ? styles.leftCard : styles.rightCard,
        ]}
        onPress={() => {
          if (item.productId) {
            navigation.navigate('ProductDetail', { productId: item.productId });
          }
        }}
      >
        <View style={styles.badgeContainer}>
          {/* Discount Badge */}
          {item.discountLabel ? (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{item.discountLabel}</Text>
            </View>
          ) : null}

          {/* Bestseller Badge */}
          {item.isBestseller && (
            <View style={styles.bestsellerBadge}>
              <Text style={styles.bestsellerText}>Bestseller</Text>
            </View>
          )}
        </View>

        {/* Product Image */}
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.productImage}>
            <Ionicons
              name="image-outline"
              size={s(80)}
              color={COLORS.primary}
            />
          </View>
        )}

        {/* Favorite Icon (Filled) */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleWishlist(item.id)}
          disabled={removingItemId === item.id}
        >
          {removingItemId === item.id ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Icon name="favorite" size={18} color={COLORS.white} />
          )}
        </TouchableOpacity>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <Text style={styles.productName} numberOfLines={2}>
              {item.name}
            </Text>
            {/* Rating Section */}
            <View style={styles.ratingRow}>
              <View style={styles.ratingBadge}>
                <Icon name="star" size={12} color={COLORS.accentGold} />
                <Text style={styles.ratingText}>{item.rating?.toFixed(1)}</Text>
              </View>
              <Text style={styles.reviewText}>
                {item.reviews ? `(${item.reviews})` : ''}
              </Text>
            </View>
          </View>
          {/* <Text style={styles.soldText}>{item.soldCount}</Text> */}

          {/* Price Section */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{item.price}</Text>
            <Text style={styles.originalPrice}>₹{item.originalPrice}</Text>
          </View>

          {/* Delivery/Bestseller Badge */}
          {/* <View style={styles.deliveryBadge}>
            <Text style={styles.deliveryText}>
              Delivery in {item.deliveryText ?? '3'} days
            </Text>
          </View> */}

          {/* Add to Cart / My Cart Button */}
          {isProductInCart ? (
            <TouchableOpacity
              style={styles.myCartButton}
              onPress={() => navigation.navigate('MyCart')}
              activeOpacity={0.8}
            >
              <Icon name="shopping-cart" size={s(16)} color={COLORS.white} />
              <Text style={styles.myCartText}>My Cart</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.addToCartButton,
                addingToCartId === item.id && styles.addToCartButtonDisabled,
              ]}
              onPress={() => handleAddToCart(item)}
              disabled={addingToCartId === item.id}
            >
              {addingToCartId === item.id ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.addToCartText}>Add to Cart</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <NormalHeader title="Wishlist" />
      {/* Delivery Address Bar */}
      {/* <View style={styles.deliveryBar}>
        <Icon name="location-on" size={16} color={COLORS.white} />
        <Text style={styles.deliveryText} numberOfLines={1}>
          Delivery To - {deliveryAddress}
        </Text>
      </View> */}

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}
          >
            <Icon name="tune" size={18} color={COLORS.black} />
            <Text style={styles.filterButtonText}>Filters</Text>
          </TouchableOpacity>

          {/* Show selected filters */}
          {selectedFilters.map((filter, index) => (
            <View key={index} style={styles.selectedFilterChip}>
              <Text style={styles.selectedFilterText}>{filter}</Text>
              <TouchableOpacity
                onPress={() => {
                  if (filter.includes('Low to High')) {
                    setPriceSort(null);
                  } else if (filter.includes('High to Low')) {
                    setPriceSort(null);
                  } else if (filter === 'A to Z') {
                    setNameSort(null);
                  } else if (filter === 'Z to A') {
                    setNameSort(null);
                  }
                }}
                style={styles.removeFilterButton}
              >
                <Icon name="close" size={14} color={COLORS.black} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
      {/* Product Grid */}
      {error ? (
        <TouchableOpacity
          style={styles.errorBanner}
          onPress={() => fetchWishlist(false)}
        >
          <Icon name="error-outline" size={18} color={COLORS.accentRed} />
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.retryText}>Tap to retry</Text>
        </TouchableOpacity>
      ) : null}

      {loading && wishlistItems.length === 0 ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loaderText}>Loading wishlist...</Text>
        </View>
      ) : wishlistItems.length > 0 ? (
        <FlatList
          data={sortedWishlistItems}
          renderItem={renderProductCard}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.productList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="favorite-border" size={80} color={COLORS.gray700} />
          <Text style={styles.emptyText}>Your wishlist is empty</Text>
          <Text style={styles.emptySubtext}>
            Add products you love to your wishlist
          </Text>
        </View>
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity
                onPress={() => setShowFilterModal(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color={COLORS.black} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Price Sort Section */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Sort by Price</Text>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    priceSort === 'low-to-high' && styles.filterOptionActive,
                  ]}
                  onPress={() => handleFilterSelect('price', 'low-to-high')}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      priceSort === 'low-to-high' &&
                        styles.filterOptionTextActive,
                    ]}
                  >
                    Low to High
                  </Text>
                  {priceSort === 'low-to-high' && (
                    <Icon name="check" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    priceSort === 'high-to-low' && styles.filterOptionActive,
                  ]}
                  onPress={() => handleFilterSelect('price', 'high-to-low')}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      priceSort === 'high-to-low' &&
                        styles.filterOptionTextActive,
                    ]}
                  >
                    High to Low
                  </Text>
                  {priceSort === 'high-to-low' && (
                    <Icon name="check" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              </View>

              {/* Name Sort Section */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Sort by Name</Text>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    nameSort === 'a-to-z' && styles.filterOptionActive,
                  ]}
                  onPress={() => handleFilterSelect('name', 'a-to-z')}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      nameSort === 'a-to-z' && styles.filterOptionTextActive,
                    ]}
                  >
                    A to Z
                  </Text>
                  {nameSort === 'a-to-z' && (
                    <Icon name="check" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    nameSort === 'z-to-a' && styles.filterOptionActive,
                  ]}
                  onPress={() => handleFilterSelect('name', 'z-to-a')}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      nameSort === 'z-to-a' && styles.filterOptionTextActive,
                    ]}
                  >
                    Z to A
                  </Text>
                  {nameSort === 'z-to-a' && (
                    <Icon name="check" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearFilters}
              >
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setShowFilterModal(false)}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Wishlist;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '16@s',
    paddingVertical: '12@vs',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray900,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: '12@s',
    padding: '4@s',
  },
  headerTitle: {
    fontSize: '18@ms',
    fontWeight: '600',
    color: COLORS.black,
  },
  productCount: {
    fontSize: '12@ms',
    color: COLORS.textSubtle,
    marginTop: '2@vs',
  },
  searchButton: {
    padding: '4@s',
  },
  deliveryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: '10@vs',
    paddingHorizontal: '16@s',
  },
  filterContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: '10@vs',
  },
  filterContent: {
    paddingHorizontal: '16@s',
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: '12@s',
    paddingVertical: '6@vs',
    backgroundColor: COLORS.white,
    borderRadius: '6@s',
    marginRight: '8@s',
    borderWidth: 1,
    borderColor: COLORS.gray900,
    height: '32@vs',
  },
  filterButtonText: {
    fontSize: '12@ms',
    color: COLORS.black,
    marginLeft: '6@s',
    fontWeight: '500',
  },
  selectedFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: '10@s',
    paddingVertical: '4@vs',
    backgroundColor: COLORS.infoSurface,
    borderRadius: '16@s',
    marginRight: '6@s',
    borderWidth: 1,
    borderColor: COLORS.primary,
    height: '28@vs',
  },
  selectedFilterText: {
    fontSize: '11@ms',
    color: COLORS.primary,
    fontWeight: '500',
    marginRight: '4@s',
  },
  removeFilterButton: {
    padding: '2@s',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: '20@s',
    borderTopRightRadius: '20@s',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '20@s',
    paddingVertical: '16@vs',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray925,
  },
  modalTitle: {
    fontSize: '18@ms',
    fontWeight: '600',
    color: COLORS.black,
  },
  closeButton: {
    padding: '4@s',
  },
  modalBody: {
    paddingHorizontal: '20@s',
    paddingVertical: '16@vs',
  },
  filterSection: {
    marginBottom: '24@vs',
  },
  filterSectionTitle: {
    fontSize: '16@ms',
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: '12@vs',
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '16@s',
    paddingVertical: '12@vs',
    backgroundColor: COLORS.gray975,
    borderRadius: '8@s',
    marginBottom: '8@vs',
    borderWidth: 1,
    borderColor: COLORS.gray925,
  },
  filterOptionActive: {
    backgroundColor: COLORS.infoSurface,
    borderColor: COLORS.primary,
  },
  filterOptionText: {
    fontSize: '14@ms',
    color: COLORS.black,
  },
  filterOptionTextActive: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: '20@s',
    paddingVertical: '16@vs',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray925,
    gap: '12@s',
  },
  clearButton: {
    flex: 1,
    paddingVertical: '12@vs',
    borderRadius: '8@s',
    borderWidth: 1,
    borderColor: COLORS.gray900,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    fontSize: '14@ms',
    color: COLORS.black,
    fontWeight: '500',
  },
  applyButton: {
    flex: 1,
    paddingVertical: '12@vs',
    borderRadius: '8@s',
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: '14@ms',
    color: COLORS.white,
    fontWeight: '600',
  },
  productList: {
    paddingHorizontal: '8@s',
    paddingTop: '12@vs',
    paddingBottom: '20@vs',
  },
  productCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: '12@s',
    marginBottom: '12@vs',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  leftCard: {
    marginRight: '4@s',
    marginLeft: '8@s',
  },
  rightCard: {
    marginLeft: '4@s',
    marginRight: '8@s',
  },
  badgeContainer: {
    position: 'absolute',
    top: '8@vs',
  },
  discountBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: '4@s',
    paddingVertical: '2@vs',
    borderRadius: '4@s',
    marginBottom: '4@s',
    zIndex: 2,
  },
  discountText: {
    color: COLORS.white,
    fontSize: '10@ms',
    fontWeight: '400',
  },
  bestsellerBadge: {
    backgroundColor: COLORS.accentBronze,
    paddingHorizontal: '4@s',
    paddingVertical: '2@vs',
    borderRadius: '4@s',
    zIndex: 2,
  },
  bestsellerText: {
    color: COLORS.white,
    fontSize: '10@ms',
    fontWeight: '400',
  },
  productImage: {
    width: '100%',
    height: '150@s',
    backgroundColor: COLORS.gray1025,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    top: '120@s',
    right: '8@s',
    backgroundColor: COLORS.textAsh,
    borderRadius: '20@s',
    padding: '3@s',
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    zIndex: 2,
  },
  productInfo: {
    padding: '12@s',
  },
  productName: {
    width: '60%',
    fontSize: '13@ms',
    fontWeight: '500',
    color: COLORS.black,
    marginBottom: '4@vs',
  },
  deliveryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary,
    paddingHorizontal: '4@s',
    paddingVertical: '4@vs',
    borderRadius: '4@s',
    marginBottom: '8@vs',
  },
  deliveryText: {
    fontSize: '10@ms',
    color: COLORS.white,
    fontWeight: '400',
    marginLeft: '4@s',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '6@vs',
  },
  price: {
    fontSize: '16@ms',
    fontWeight: '700',
    color: COLORS.black,
    marginRight: '8@s',
  },
  originalPrice: {
    fontSize: '13@ms',
    color: COLORS.textAsh,
    textDecorationLine: 'line-through',
  },
  priceUnavailable: {
    fontSize: '12@ms',
    color: COLORS.textAsh,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '4@vs',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: '2@s',
    paddingVertical: '2@vs',
    borderRadius: '4@s',
    marginRight: '2@s',
  },
  ratingText: {
    color: COLORS.black,
    fontSize: '10@ms',
    fontWeight: '600',
    marginLeft: '2@s',
  },
  reviewText: {
    fontSize: '10@ms',
    color: COLORS.textAsh,
  },
  soldText: {
    fontSize: '10@ms',
    color: COLORS.black,
    // marginBottom: '4@vs',
  },
  addToCartButton: {
    width: '65%',
    backgroundColor: COLORS.primary,
    paddingVertical: '4@s',
    paddingHorizontal: '10@s',
    borderRadius: '6@s',
    alignItems: 'center',
    justifyContent: 'center',
    // minHeight: '32@vs',
  },
  addToCartButtonDisabled: {
    opacity: 0.6,
  },
  addToCartText: {
    color: COLORS.white,
    fontSize: '12@ms',
    fontWeight: '500',
  },
  myCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryDeep,
    borderRadius: '8@s',
    paddingVertical: '4@s',
    paddingHorizontal: '16@s',
    // marginTop: '8@vs',
    gap: '8@s',
    width: '65%',
  },
  myCartText: {
    color: COLORS.white,
    fontSize: '12@ms',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '40@s',
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
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.infoSurface,
    marginHorizontal: '16@s',
    marginTop: '16@vs',
    borderRadius: '10@s',
    paddingHorizontal: '12@s',
    paddingVertical: '8@vs',
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
  loadingMore: {
    paddingVertical: '16@vs',
  },
});
