import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Ion from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/Ionicons';
import { s, ScaledSheet } from 'react-native-size-matters';
import NormalHeader from '../component/NormalHeader';
import ProductCard from '../component/Product';
import COLORS from '../constants/colors';
import { getProductDetail } from '../api/products';
import {
  toggleWishlistItem,
  removeWishlistItem,
  getWishlist,
} from '../api/wishlist';
import Toast from 'react-native-toast-message';
import { useCart } from '../context/CartContext';

const { width } = Dimensions.get('window');

const defaultImages = [
  require('../assets/product1.png'),
  require('../assets/product2.png'),
  require('../assets/product3.png'),
];

const defaultProduct = {
  id: '1',
  name: 'Cinder Blocks / Concrete Hollow Blocks',
};

interface ProductDetailData {
  id: string;
  name: string;
  description: string;
  price: number | null;
  originalPrice: number | null;
  is_bestseller: boolean;
  savings: number | null;
  rating: number | null;
  reviews: any[];
  reviewsCount: number | null;
  images: string[];
  vendorName: string | null;
  vendorLogo: string | null;
  subtitle: string | null;
  quantity: number | null;
  min_order_quantity: number | null;
  price_including_gst?: number | null;
  you_may_also_like?: any[];
}

const SkeletonLoader = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const SkeletonBox = ({ style }: { style?: any }) => (
    <Animated.View
      style={[
        {
          backgroundColor: COLORS.gray825,
          opacity,
        },
        style,
      ]}
    />
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Image Skeleton */}
      <View style={styles.imageContainer}>
        <SkeletonBox style={[styles.productImage, { width }]} />
      </View>

      {/* Info Container Skeleton */}
      <View style={styles.infoContainer}>
        {/* Title and Price Row */}
        <View style={styles.titleRow}>
          <SkeletonBox style={skeletonStyles.titleBox} />
          <View>
            <SkeletonBox style={skeletonStyles.priceBox} />
            <SkeletonBox style={skeletonStyles.savingsBox} />
          </View>
        </View>

        {/* Description Lines */}
        <SkeletonBox style={skeletonStyles.descLine1} />
        <SkeletonBox style={skeletonStyles.descLine2} />
        <SkeletonBox style={skeletonStyles.descLine3} />

        {/* Rating Row */}
        <View style={styles.ratingRow}>
          <SkeletonBox style={skeletonStyles.ratingBox} />
          <SkeletonBox style={skeletonStyles.cashbackBox} />
        </View>

        {/* Brand Row */}
        <View style={styles.brandRow}>
          <SkeletonBox style={skeletonStyles.brandLogo} />
          <SkeletonBox style={skeletonStyles.brandName} />
        </View>

        {/* Pack Selection */}
        <SkeletonBox style={skeletonStyles.sectionTitle} />
        <View style={styles.selectRow}>
          <SkeletonBox style={skeletonStyles.packCard} />
          <SkeletonBox style={skeletonStyles.packCard} />
        </View>

        {/* Key Features */}
        <SkeletonBox style={skeletonStyles.sectionTitle} />
        <SkeletonBox style={skeletonStyles.featureLine} />
        <SkeletonBox style={skeletonStyles.featureLine} />
        <SkeletonBox style={skeletonStyles.featureLine} />
        <SkeletonBox style={skeletonStyles.featureLine} />

        {/* Spec Buttons */}
        <SkeletonBox style={skeletonStyles.specButton} />
        <SkeletonBox style={skeletonStyles.specButton} />
        <SkeletonBox style={skeletonStyles.specButton} />
        <SkeletonBox style={skeletonStyles.specButton} />
      </View>
    </ScrollView>
  );
};

const skeletonStyles = ScaledSheet.create({
  titleBox: {
    width: '50%',
    height: '20@vs',
    borderRadius: '4@s',
  },
  priceBox: {
    width: '80@s',
    height: '18@vs',
    borderRadius: '4@s',
    marginBottom: '5@vs',
  },
  savingsBox: {
    width: '60@s',
    height: '14@vs',
    borderRadius: '4@s',
  },
  descLine1: {
    width: '100%',
    height: '12@vs',
    borderRadius: '4@s',
    marginBottom: '8@vs',
  },
  descLine2: {
    width: '90%',
    height: '12@vs',
    borderRadius: '4@s',
    marginBottom: '8@vs',
  },
  descLine3: {
    width: '75%',
    height: '12@vs',
    borderRadius: '4@s',
    marginBottom: '15@vs',
  },
  ratingBox: {
    width: '80@s',
    height: '16@vs',
    borderRadius: '4@s',
  },
  cashbackBox: {
    width: '60%',
    height: '40@vs',
    borderRadius: '6@s',
  },
  brandLogo: {
    width: '30@s',
    height: '30@s',
    borderRadius: '15@s',
    marginRight: '6@s',
  },
  brandName: {
    width: '100@s',
    height: '16@vs',
    borderRadius: '4@s',
  },
  sectionTitle: {
    width: '120@s',
    height: '18@vs',
    borderRadius: '4@s',
    marginTop: '15@vs',
    marginBottom: '10@vs',
  },
  packCard: {
    width: '35%',
    height: '100@vs',
    borderRadius: '8@s',
  },
  featureLine: {
    width: '95%',
    height: '12@vs',
    borderRadius: '4@s',
    marginBottom: '6@vs',
  },
  specButton: {
    width: '100%',
    height: '40@vs',
    borderRadius: '6@s',
    marginTop: '8@vs',
  },
});

const ProductDetail = ({ navigation, route }: any) => {
  const deliveryAddress = 'Rahul Sharma, #1234, Sector 6, Mumbai';
  const productId =
    route?.params?.productId ?? route?.params?.product?.id ?? defaultProduct.id;
  const {
    cartItems,
    addToCart,
    updateQuantity,
    getCartItemByProductId,
    fetchCart,
  } = useCart();
  const [productData, setProductData] = useState<ProductDetailData | null>(
    null,
  );
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [productImages, setProductImages] = useState<
    Array<number | { uri: string }>
  >([]);
  const [addingToCart, setAddingToCart] = useState(false);
  const [updatingQuantity, setUpdatingQuantity] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistItemId, setWishlistItemId] = useState<string | number | null>(
    null,
  );
  const [togglingWishlist, setTogglingWishlist] = useState(false);
  const [youMayAlsoLike, setYouMayAlsoLike] = useState<any[]>([]);

  const cartItem = useMemo(
    () => getCartItemByProductId(productId),
    [getCartItemByProductId, productId, cartItems],
  );
  const isProductInCart = cartItem !== null;

  const normalizeProductDetail = useCallback(
    (item: any): ProductDetailData => {
      // Use price_including_gst if available, otherwise use price
      const priceValue =
        typeof item?.price_including_gst === 'number'
          ? item.price_including_gst
          : Number(item.price) || null;
      const originalValue = item?.original_price;
      const imageList = Array.isArray(item?.images)
        ? item.images
            .map((img: any) => (typeof img === 'string' ? img : img?.url))
            .filter((url: any) => typeof url === 'string' && url?.length)
        : [item?.image, item?.featured_image, item?.thumbnail].filter(
            (url: any) => typeof url === 'string' && url?.length,
          );
      return {
        id: String(item?.id ?? item?.product_id ?? productId),
        name: item?.name ?? item?.title ?? 'Product',
        description:
          item?.description ??
          item?.short_description ??
          'Product description not available at the moment.',
        price: priceValue,
        originalPrice: originalValue ? originalValue : null,
        is_bestseller: item?.best_seller || false,
        savings:
          priceValue && originalValue && originalValue > priceValue
            ? originalValue - priceValue
            : null,
        rating: item.average_rating || 0,
        reviews: item.reviews || [],
        reviewsCount: item.reviews_count || item.reviews.length || 0,
        images: imageList as string[],
        vendorName: item?.business?.name ?? null,
        vendorLogo: item?.business?.logo ?? null,
        subtitle: item?.business?.description ?? null,
        quantity: item?.min_order_quantity ?? null,
        min_order_quantity: item?.min_order_quantity ?? null,
        price_including_gst:
          typeof item?.price_including_gst === 'number'
            ? item.price_including_gst
            : null,
        you_may_also_like: Array.isArray(item?.you_may_also_like)
          ? item.you_may_also_like
          : [],
      };
    },
    [productId],
  );

  const fetchProductDetail = useCallback(async () => {
    if (!productId) {
      setDetailError('Missing product identifier.');
      return;
    }
    setDetailLoading(true);
    setDetailError(null);
    try {
      const payload = await getProductDetail(productId);
      const normalized = normalizeProductDetail(payload);
      setProductData(normalized);
      // Store you_may_also_like products
      if (
        normalized.you_may_also_like &&
        normalized.you_may_also_like.length > 0
      ) {
        setYouMayAlsoLike(normalized.you_may_also_like);
      }
      const imageSources =
        normalized.images.length > 0
          ? normalized.images.map((uri: any) => ({ uri }))
          : [];
      setProductImages(imageSources);
    } catch (error: any) {
      setDetailError(error?.message || 'Unable to load product details.');
      setProductData(null);
      // setProductImages(defaultImages);
    } finally {
      setDetailLoading(false);
    }
  }, [normalizeProductDetail, productId]);

  const checkWishlistStatus = useCallback(async () => {
    if (!productId) return;
    try {
      const wishlist = await getWishlist();
      const wishlistArray = wishlist?.results ?? [];
      const wishlistItem = wishlistArray.find(
        (item: any) => String(item?.product) === String(productId),
      );
      if (wishlistItem) {
        setIsInWishlist(true);
        setWishlistItemId(wishlistItem.id);
      } else {
        setIsInWishlist(false);
        setWishlistItemId(null);
      }
    } catch (error) {
      // Silently fail - wishlist check is not critical
      setIsInWishlist(false);
      setWishlistItemId(null);
    }
  }, [productId]);

  useEffect(() => {
    fetchProductDetail();
    checkWishlistStatus();
  }, [fetchProductDetail, checkWishlistStatus]);

  const handleToggleWishlist = async () => {
    const selectedProductId = productData?.id ?? productId;
    if (!selectedProductId) {
      Toast.show({
        type: 'error',
        text1: 'Unable to update wishlist',
        text2: 'Missing product identifier.',
      });
      return;
    }
    try {
      setTogglingWishlist(true);
      if (isInWishlist && wishlistItemId) {
        // Remove from wishlist using DELETE API
        await removeWishlistItem(wishlistItemId);
        setIsInWishlist(false);
        setWishlistItemId(null);
      } else {
        // Add to wishlist using POST API
        await toggleWishlistItem(selectedProductId);
        setIsInWishlist(true);
        // Re-check wishlist to get the new wishlist item ID
        await checkWishlistStatus();
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Wishlist update failed',
        text2: error?.message || 'Unable to update wishlist.',
      });
    } finally {
      setTogglingWishlist(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleAddToCart = async () => {
    const selectedProductId = productData?.id ?? productId;
    if (!selectedProductId) {
      Toast.show({
        type: 'error',
        text1: 'Unable to add to cart',
        text2: 'Missing product identifier.',
      });
      return;
    }
    try {
      setAddingToCart(true);
      await addToCart(selectedProductId, productData?.min_order_quantity ?? 1);
      Toast.show({
        type: 'success',
        text1: 'Added to cart',
        text2: 'Product added to your cart.',
      });
    } catch (error: any) {
      // Error is already handled in context
    } finally {
      setAddingToCart(false);
    }
  };

  const handleDecreaseQuantity = async () => {
    if (!cartItem) return;
    const newQuantity = cartItem.quantity - 1;
    if (newQuantity >= cartItem.minimumQuantity) {
      try {
        setUpdatingQuantity(true);
        await updateQuantity(cartItem, newQuantity);
      } catch (error) {
        // Error is already handled in context
      } finally {
        setUpdatingQuantity(false);
      }
    } else {
      Toast.show({
        type: 'error',
        text1: 'Invalid Quantity',
        text2: `Minimum quantity is ${cartItem.minimumQuantity}`,
      });
    }
  };

  const handleIncreaseQuantity = async () => {
    if (!cartItem) return;
    try {
      setUpdatingQuantity(true);
      await updateQuantity(cartItem, cartItem.quantity + 1);
    } catch (error) {
      // Error is already handled in context
    } finally {
      setUpdatingQuantity(false);
    }
  };

  const activeProductName = productData?.name ?? defaultProduct.name;
  const activePrice = productData?.price ?? null;
  const activeOriginalPrice = productData?.originalPrice || 0;
  const activeSavings = productData?.savings ?? null;
  const activeDescription =
    productData?.description ??
    'Product description not available at the moment.';
  const activeRating = productData?.rating ?? null;
  const activeReviews = Array.isArray(productData?.reviews)
    ? productData.reviews
    : [];
  const activeSubtitle = productData?.subtitle || null;
  const vendorName = productData?.vendorName || null;

  const formatCurrency = (value: number | null) =>
    typeof value === 'number' && !Number.isNaN(value)
      ? `Rs ${value}`
      : 'Price unavailable';

  if (detailLoading && !productData) {
    return (
      <SafeAreaView style={styles.container}>
        <NormalHeader title="Product Details" />
        {/* Delivery Address Bar */}
        {/* <View style={styles.deliveryBar}>
          <Ion name="location-on" size={16} color={COLORS.white} />
          <Text style={styles.deliveryHeaderText} numberOfLines={1}>
            Delivery To - {deliveryAddress}
          </Text>
        </View> */}
        <SkeletonLoader />
        {/* Bottom Fixed Buttons */}
        <View style={styles.bottomContainer}>
          <View
            style={[styles.addToCartButton, styles.addToCartButtonDisabled]}
          >
            <ActivityIndicator size="small" color={COLORS.white} />
          </View>
          <View style={styles.deliveryBox}>
            <Text style={styles.deliveryText}>Delivery in 3 days</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <NormalHeader title="Product Details" />
      {/* Delivery Address Bar */}
      {/* <View style={styles.deliveryBar}>
        <Ion name="location-on" size={16} color={COLORS.white} />
        <Text style={styles.deliveryHeaderText} numberOfLines={1}>
          Delivery To - {deliveryAddress}
        </Text>
      </View> */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image Carousel */}
        <View style={styles.imageContainer}>
          <FlatList
            data={productImages}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={[
              productImages.length <= 0 && {
                justifyContent: 'center',
                alignItems: 'center',
              },
              {
                width: '100%',
              },
            ]}
            renderItem={({ item }) => (
              <Image source={item} style={[styles.productImage, { width }]} />
            )}
            ListEmptyComponent={() => (
              <View style={styles.productImageContainer}>
                <Icon
                  name="image-outline"
                  size={s(120)}
                  color={COLORS.primary}
                />
              </View>
            )}
          />

          {/* Left Badges */}
          <View style={styles.badgeContainer}>
            <View
              style={[styles.badge, { backgroundColor: COLORS.accentBronze }]}
            >
              {productData?.is_bestseller && (
                <Text style={styles.badgeText}>Bestsellers</Text>
              )}
            </View>
            {/* <View
              style={[styles.badge, { backgroundColor: COLORS.primaryDeep }]}
            >
              <Text style={styles.badgeText}>22% Off</Text>
            </View> */}
          </View>

          {/* Right Bottom Icons */}
          <View style={styles.iconContainer}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleToggleWishlist}
              disabled={togglingWishlist}
            >
              {togglingWishlist ? (
                <ActivityIndicator size="small" color={COLORS.black} />
              ) : (
                <Icon
                  name={isInWishlist ? 'heart' : 'heart-outline'}
                  size={18}
                  color={isInWishlist ? COLORS.accentRuby : COLORS.black}
                />
              )}
            </TouchableOpacity>
            {/* <TouchableOpacity style={styles.iconButton}>
              <Icon
                name="share-social-outline"
                size={18}
                color={COLORS.black}
              />
            </TouchableOpacity> */}
          </View>
        </View>

        {detailError ? (
          <TouchableOpacity
            style={styles.errorBanner}
            onPress={fetchProductDetail}
          >
            <Icon name="warning-outline" size={18} color={COLORS.accentRed} />
            <Text style={styles.errorText}>{detailError}</Text>
            <Text style={styles.retryText}>Tap to retry</Text>
          </TouchableOpacity>
        ) : null}

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.productName}>{activeProductName}</Text>
            <View>
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
              >
                <Text style={styles.discountedPrice}>
                  {formatCurrency(activePrice)}
                </Text>

                <Text style={styles.originalPrice}>
                  Rs {activeOriginalPrice}
                </Text>
              </View>
              {activeSavings ? (
                <View style={styles.saveBox}>
                  <Text style={styles.saveText}>Save Rs {activeSavings}</Text>
                </View>
              ) : null}
            </View>
          </View>

          <Text style={styles.descText}>{activeDescription}</Text>

          {/* Rating & Cashback */}
          <View style={styles.ratingRow}>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={14} color={COLORS.accentGoldBright} />
              <Text style={styles.ratingText}>
                {activeRating?.toFixed(1) ?? '--'} ({activeReviews.length ?? 0})
              </Text>
            </View>

            {/* <LinearGradient
              colors={[COLORS.accentBronzeTransparent, COLORS.skyBlue]}
              style={styles.cashbackContainer}
            >
              <Text style={styles.cashbackText}>
                Buy this and get 10% cashback on another purchase
              </Text>
            </LinearGradient> */}
          </View>
          <Text style={styles.salesText}>{activeSubtitle}</Text>

          {/* Brand Info */}
          {vendorName && (
            <View style={styles.brandRow}>
              {productData?.vendorLogo ? (
                <Image
                  source={{ uri: productData.vendorLogo }}
                  style={styles.brandLogo}
                />
              ) : null}
              <Text style={styles.brandName}>{vendorName}</Text>
            </View>
          )}

          {/* Select Pack */}
          {/* <Text style={styles.sectionTitle}>Select Pack</Text>
          <View style={styles.selectRow}>
            <TouchableOpacity
              style={[styles.packCard, { backgroundColor: COLORS.infoSurface }]}
            >
              <Text style={styles.packTitle}>Pack of 2</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Text style={styles.packPrice}>Rs 5998</Text>
                <Text style={styles.packOriginal}>Rs 9998</Text>
              </View>
              <Text style={styles.packTax}>Inc of taxes</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.packCard}>
              <Text style={styles.packTitle}>Pack of 3</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Text style={styles.packPrice}>Rs 9998</Text>
                <Text style={styles.packOriginal}>Rs 12998</Text>
              </View>
              <Text style={styles.packTax}>Inc of taxes</Text>
            </TouchableOpacity>
          </View> */}

          {/* Key Features */}
          {/* <Text style={styles.sectionTitle}>Key Features</Text>
          <View style={styles.featuresContainer}>
            <Text style={styles.featureText}>
              Made from premium-grade cement and aggregates
            </Text>
            <Text style={styles.featureText}>
              Uniform size and shape for easy construction
            </Text>
            <Text style={styles.featureText}>
              Provides thermal and sound insulation
            </Text>
            <Text style={styles.featureText}>Strong load-bearing capacity</Text>
            <Text style={styles.featureText}>
              Available in multiple sizes (4", 6", 8")
            </Text>
          </View> */}

          {/* Specification Buttons */}
          {/* <TouchableOpacity style={styles.specButton}>
            <Text style={styles.specText}>Material</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.specButton}>
            <Text style={styles.specText}>Block Type</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.specButton}>
            <Text style={styles.specText}>Density</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.specButton}>
            <Text style={styles.specText}>Dimensions</Text>
          </TouchableOpacity> */}
        </View>

        {/* Reviews Section */}
        {activeReviews.length > 0 && (
          <View style={{ marginTop: 30 }}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Ratings & Reviews</Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('RatingReview', {
                    productId: productData?.id ?? productId,
                    productSnapshot: {
                      name: activeProductName,
                      vendorName,
                      rating: activeRating,
                      reviews: activeReviews,
                      subtitle: activeSubtitle,
                    },
                  })
                }
              >
                <Text style={styles.seeAllText}>
                  View all {productData?.reviewsCount ?? activeReviews.length}
                </Text>
              </TouchableOpacity>
            </View>

            {activeReviews.slice(0, 2).map((item: any) => {
              const userName =
                typeof item?.user?.name === 'string'
                  ? item.user.name
                  : 'Anonymous';
              const reviewText =
                typeof item?.review_text === 'string' ? item.review_text : '';
              const reviewRating =
                typeof item?.rating === 'number'
                  ? item.rating
                  : typeof item?.rating === 'string'
                  ? Number(item.rating) || 0
                  : 0;
              const reviewImages = Array.isArray(item?.images)
                ? item.images
                    .map((img: any) =>
                      typeof img === 'string' ? img : img?.url,
                    )
                    .filter((url: any) => url && typeof url === 'string')
                : [];

              return (
                <View key={item?.id ?? Math.random()} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarText}>
                        {userName[0]?.toUpperCase() ?? 'A'}
                      </Text>
                    </View>
                    <View style={{ flex: 1, flexDirection: 'row', gap: 10 }}>
                      <Text style={styles.reviewName}>{userName}</Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginTop: 2,
                        }}
                      >
                        <Icon
                          name="star"
                          size={14}
                          color={COLORS.accentGoldBright}
                        />
                        <Text style={styles.reviewRating}>
                          {reviewRating.toFixed(1)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {reviewText ? (
                    <Text style={styles.reviewComment}>{reviewText}</Text>
                  ) : null}

                  {reviewImages.length > 0 && (
                    <View style={styles.reviewImagesRow}>
                      {reviewImages.map((imgUrl: string, index: number) => (
                        <Image
                          key={index}
                          source={{ uri: imgUrl }}
                          style={styles.reviewImage}
                        />
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* You May Also Like Section */}
        {youMayAlsoLike.length > 0 && (
          <View style={{ marginTop: 30, marginBottom: 20 }}>
            <Text style={styles.sectionTitle}>You May Also Like</Text>
            <FlatList
              data={youMayAlsoLike}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) =>
                item?.id?.toString() ?? `related-${index}`
              }
              contentContainerStyle={{
                paddingHorizontal: 15,
                paddingVertical: 10,
              }}
              renderItem={({ item }) => {
                const productImage =
                  Array.isArray(item?.images) && item.images.length > 0
                    ? item.images[0]?.url || item.images[0]
                    : null;
                const productPrice =
                  typeof item?.price_including_gst === 'number'
                    ? item.price_including_gst
                    : Number(item?.price) || null;

                return (
                  <TouchableOpacity
                    style={styles.recommendCard}
                    onPress={() =>
                      navigation.navigate('ProductDetail', {
                        productId: item.id,
                      })
                    }
                  >
                    {productImage ? (
                      <Image
                        source={{ uri: productImage }}
                        style={styles.recommendImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View
                        style={[
                          styles.recommendImage,
                          { backgroundColor: COLORS.gray925 },
                        ]}
                      >
                        <Icon
                          name="image-outline"
                          size={s(100)}
                          color={COLORS.textAsh}
                        />
                      </View>
                    )}
                    <Text style={styles.recommendTitle} numberOfLines={2}>
                      {item?.name || 'Product'}
                    </Text>
                    {productPrice && (
                      <Text style={styles.recommendPrice}>
                        Rs {productPrice.toFixed(2)}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        )}
      </ScrollView>

      {/* Bottom Fixed Buttons */}
      <View style={styles.bottomContainer}>
        {isProductInCart ? (
          <View style={styles.bottomContainerRow}>
            <TouchableOpacity
              style={styles.myCartButton}
              onPress={() => navigation.navigate('MyCart')}
            >
              <Icon name="bag-outline" size={s(20)} color={COLORS.white} />
              <Text style={styles.myCartText}>My Cart</Text>
            </TouchableOpacity>
            <View style={styles.quantityControlsContainer}>
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    cartItem &&
                      cartItem.quantity <= cartItem.minimumQuantity &&
                      styles.quantityButtonDisabled,
                  ]}
                  onPress={handleDecreaseQuantity}
                  disabled={
                    updatingQuantity ||
                    (cartItem && cartItem.quantity <= cartItem.minimumQuantity)
                  }
                >
                  <Ion
                    name="remove"
                    size={s(16)}
                    color={
                      cartItem && cartItem.quantity <= cartItem.minimumQuantity
                        ? COLORS.gray700
                        : COLORS.black
                    }
                  />
                </TouchableOpacity>
                {updatingQuantity ? (
                  <ActivityIndicator
                    size="small"
                    color={COLORS.primary}
                    style={styles.quantityLoader}
                  />
                ) : (
                  <Text style={styles.quantityText}>
                    {cartItem?.quantity ?? 0}
                  </Text>
                )}
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={handleIncreaseQuantity}
                  disabled={updatingQuantity}
                >
                  <Ion name="add" size={s(16)} color={COLORS.black} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.addToCartButton,
              addingToCart && styles.addToCartButtonDisabled,
            ]}
            onPress={handleAddToCart}
            disabled={addingToCart || detailLoading}
          >
            {addingToCart || (detailLoading && !productData) ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.addToCartText}>Add to Cart</Text>
            )}
          </TouchableOpacity>
        )}
        <View style={styles.deliveryBox}>
          <Text style={styles.deliveryText}>Delivery in 3 days</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ProductDetail;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  deliveryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: '10@vs',
    paddingHorizontal: '16@s',
  },
  deliveryHeaderText: {
    fontSize: '10@ms',
    color: COLORS.white,
    fontWeight: '400',
    marginLeft: '4@s',
  },
  imageContainer: {
    padding: '6@s',
    height: '200@vs',
    position: 'relative',
    marginTop: '10@vs',
    backgroundColor: COLORS.gray975,
  },
  productImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: '20@s',
    resizeMode: 'cover',
  },
  badgeContainer: {
    position: 'absolute',
    top: '10@vs',
    left: '10@s',
    gap: '5@vs',
  },
  badge: {
    paddingHorizontal: '8@s',
    paddingVertical: '3@vs',
    borderRadius: '5@s',
  },
  badgeText: {
    color: COLORS.white,
    fontSize: '10@ms',
    fontWeight: '600',
  },
  iconContainer: {
    position: 'absolute',
    right: '10@s',
    bottom: '10@vs',
    gap: '8@s',
  },
  iconButton: {
    backgroundColor: COLORS.white,
    padding: '6@s',
    borderRadius: '20@s',
    elevation: 2,
  },
  infoContainer: {
    padding: '15@s',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: '10@vs',
  },
  productName: {
    width: '50%',
    fontSize: '14@ms',
    fontWeight: '700',
    color: COLORS.black,
    marginRight: '10@s',
  },
  discountedPrice: {
    color: COLORS.black,
    fontSize: '14@ms',
    fontWeight: '700',
  },
  originalPrice: {
    color: COLORS.textAsh,
    fontSize: '11@ms',
    textDecorationLine: 'line-through',
  },
  saveBox: {
    width: '80%',
    backgroundColor: COLORS.primaryDeep,
    padding: '4@s',
    borderRadius: '5@s',
  },
  saveText: {
    color: COLORS.white,
    fontSize: '10@ms',
    textAlign: 'center',
  },
  descText: {
    fontSize: '12@ms',
    color: COLORS.textMedium,
    marginBottom: '12@vs',
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2@vs',
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  ratingText: {
    fontSize: '12@ms',
    fontWeight: '500',
    color: COLORS.black,
  },
  salesText: {
    fontSize: '9@ms',
    color: COLORS.black,
    marginBottom: '8@vs',
  },
  cashbackContainer: {
    width: '68%',
    paddingHorizontal: '8@s',
    paddingVertical: '8@vs',
    borderRadius: '6@s',
    marginLeft: '8@s',
  },
  cashbackText: {
    fontSize: '9@ms',
    color: COLORS.black,
    fontWeight: '500',
    textAlign: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: '8@vs',
  },
  brandLogo: {
    width: '30@s',
    height: '30@s',
    borderRadius: '15@s',
    resizeMode: 'cover',
    marginRight: '6@s',
  },
  brandName: {
    fontSize: '12@ms',
    fontWeight: '500',
    color: COLORS.black,
  },
  sectionTitle: {
    fontSize: '13@ms',
    fontWeight: '700',
    marginTop: '15@vs',
    color: COLORS.black,
  },
  selectRow: { flexDirection: 'row', gap: '10@s', marginTop: '10@vs' },
  packCard: {
    width: '35%',
    borderWidth: 1,
    borderColor: COLORS.gray825,
    borderRadius: '8@s',
    padding: '8@s',
  },
  packTitle: { fontSize: '11@ms', fontWeight: '600', color: COLORS.black },
  packPrice: {
    fontSize: '13@ms',
    fontWeight: '700',
    color: COLORS.black,
  },
  packOriginal: {
    fontSize: '11@ms',
    color: COLORS.textAsh,
    textDecorationLine: 'line-through',
  },
  packTax: {
    fontSize: '10@ms',
    color: COLORS.danger,
  },
  featuresContainer: {
    marginTop: '10@vs',
  },
  featureText: {
    fontSize: '11@ms',
    color: COLORS.textMedium,
    marginBottom: '4@vs',
  },
  specButton: {
    backgroundColor: COLORS.gray975,
    borderRadius: '6@s',
    padding: '10@s',
    marginTop: '8@vs',
  },
  specText: { fontSize: '12@ms', color: COLORS.black, fontWeight: '500' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: '5@vs',
    paddingHorizontal: '8@s',
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
  reviewCard: {
    backgroundColor: COLORS.white,
    borderRadius: '10@ms',
    padding: '10@ms',
    marginVertical: '8@ms',
    marginHorizontal: '10@ms',
    shadowColor: COLORS.black,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '6@ms',
  },
  avatarCircle: {
    backgroundColor: COLORS.primary,
    width: '36@ms',
    height: '36@ms',
    borderRadius: '18@ms',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '10@ms',
  },
  avatarText: {
    color: COLORS.white,
    fontWeight: '400',
    fontSize: '14@ms',
  },
  reviewName: {
    fontWeight: '600',
    fontSize: '16@ms',
    color: COLORS.black,
  },
  reviewRating: {
    fontSize: '14@ms',
    color: COLORS.black,
    marginLeft: '4@ms',
  },
  reviewComment: {
    fontSize: '12@ms',
    color: COLORS.textAsh,
    marginVertical: '2@ms',
    marginLeft: '10@ms',
  },
  reviewImagesRow: {
    flexDirection: 'row',
    marginTop: '6@ms',
    gap: '8@ms',
    marginLeft: '10@ms',
  },
  reviewImage: {
    width: '60@ms',
    height: '60@ms',
    borderRadius: '8@ms',
  },
  recommendCard: {
    width: width * 0.45,
    backgroundColor: COLORS.white,
    borderRadius: '12@ms',
    marginHorizontal: '6@ms',
    shadowColor: COLORS.black,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  recommendImage: {
    width: '100%',
    height: '120@ms',
    borderTopLeftRadius: '12@ms',
    borderTopRightRadius: '12@ms',
    justifyContent: 'center',
    alignItems: 'center',
  },
  offerBadge: {
    position: 'absolute',
    top: '6@ms',
    right: '6@ms',
    backgroundColor: COLORS.primaryDeep,
    paddingHorizontal: '6@ms',
    paddingVertical: '2@ms',
    borderRadius: '6@ms',
  },
  offerText: {
    color: COLORS.white,
    fontSize: '10@ms',
  },
  recommendTitle: {
    fontSize: '12@ms',
    fontWeight: '600',
    color: COLORS.black,
    padding: '8@ms',
  },
  recommendPrice: {
    fontSize: '13@ms',
    fontWeight: '700',
    color: COLORS.primaryDeep,
    paddingHorizontal: '8@ms',
    paddingBottom: '8@ms',
  },

  bottomContainer: {
    flexDirection: 'column',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray925,
    backgroundColor: COLORS.white,
    paddingVertical: '10@vs',
    alignItems: 'center',
  },
  addToCartButton: {
    backgroundColor: COLORS.primaryDeep,
    borderRadius: '8@s',
    paddingVertical: '10@vs',
    paddingHorizontal: '100@s',
    marginBottom: '5@vs',
  },
  addToCartButtonDisabled: {
    opacity: 0.7,
  },
  addToCartText: {
    color: COLORS.white,
    fontSize: '14@ms',
    fontWeight: '700',
  },
  deliveryBox: {
    backgroundColor: COLORS.accentCoral,
    paddingHorizontal: '20@s',
    paddingVertical: '4@vs',
  },
  deliveryText: {
    color: COLORS.white,
    fontSize: '11@ms',
    fontWeight: '600',
  },
  quantityControlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // marginBottom: '10@vs',
    gap: '12@s',
  },
  quantityLabel: {
    fontSize: '14@ms',
    color: COLORS.black,
    fontWeight: '600',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '12@s',
    borderWidth: 1,
    borderColor: COLORS.gray850,
    borderRadius: '8@s',
    paddingHorizontal: '12@s',
    paddingVertical: '6@vs',
  },
  quantityButton: {
    width: '28@s',
    height: '28@s',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6@s',
    backgroundColor: COLORS.gray900,
  },
  quantityButtonDisabled: {
    opacity: 0.5,
    backgroundColor: COLORS.gray850,
  },
  quantityText: {
    fontSize: '16@ms',
    fontWeight: '600',
    color: COLORS.black,
    minWidth: '30@s',
    textAlign: 'center',
  },
  quantityLoader: {
    marginHorizontal: '8@s',
  },
  bottomContainerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: '10@vs',
  },
  myCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryDeep,
    borderRadius: '8@s',
    paddingVertical: '10@vs',
    paddingHorizontal: '20@s',
    // marginBottom: '5@vs',
    gap: '8@s',
  },
  myCartText: {
    color: COLORS.white,
    fontSize: '14@ms',
    fontWeight: '700',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.infoSurface,
    borderRadius: '10@s',
    marginHorizontal: '16@s',
    marginTop: '10@vs',
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
});
