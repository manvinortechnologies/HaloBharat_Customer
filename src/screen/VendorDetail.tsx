import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  Modal,
  Dimensions,
  ImageSourcePropType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { s, ScaledSheet } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import NormalHeader from '../component/NormalHeader';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import COLORS from '../constants/colors';
import { getVendorDetail, getVendorBanners } from '../api/vendors';
import { getCategories } from '../api/categories';
import { getProducts, getBestsellers } from '../api/products';

const { width: screenWidth } = Dimensions.get('window');

// Simple custom carousel component
const SimpleCarousel = ({
  data,
  fallbackImage,
}: {
  data: BannerItem[];
  fallbackImage: ImageSourcePropType;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (data.length <= 1) {
      setCurrentIndex(0);
      return;
    }
    const timer = setInterval(() => {
      const nextIndex = currentIndex === data.length - 1 ? 0 : currentIndex + 1;
      setCurrentIndex(nextIndex);
      scrollRef.current?.scrollTo({
        x: nextIndex * screenWidth,
        animated: true,
      });
    }, 3000);

    return () => clearInterval(timer);
  }, [currentIndex, data.length]);

  if (data.length === 0) {
    return null;
  }

  return (
    <View style={styles.carouselContainer}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={event => {
          const newIndex = Math.round(
            event.nativeEvent.contentOffset.x / screenWidth,
          );
          setCurrentIndex(newIndex);
        }}
      >
        {data.map((banner, index) => (
          <View key={index} style={styles.bannerWrapper}>
            <Image
              source={
                banner.imageUrl ? { uri: banner.imageUrl } : fallbackImage
              }
              style={styles.bannerImage}
            />
          </View>
        ))}
      </ScrollView>

      <View style={styles.indicatorContainer}>
        {data.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              index === currentIndex && styles.activeIndicator,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

interface CategoryItem {
  id: string;
  name: string;
  image?: string | null;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  originalPrice: number | null;
  discount?: string | null;
  image?: string | null;
  rating?: number | null;
  reviews?: number | null;
  soldCount?: string | null;
  deliveryDays?: string | null;
}

interface VendorDetailData {
  id: string;
  name: string;
  logo?: string | null;
  description?: string | null;
  average_rating?: number | null;
  reviews_count?: number | null;
}

interface BannerItem {
  id: string;
  imageUrl: string | null;
  title?: string | null;
  type?: string | null;
}

type VendorDetailRoute = RouteProp<
  { VendorDetail: { businessId: string; businessName?: string } },
  'VendorDetail'
>;

const VendorDetail = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<VendorDetailRoute>();
  const { businessId, businessName } = route.params;

  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [vendorData, setVendorData] = useState<VendorDetailData | null>(null);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [bannersLoading, setBannersLoading] = useState(false);

  const fallbackVendorImage = useMemo(
    () => require('../assets/vendor1.png'),
    [],
  );
  const fallbackProductImage = useMemo(
    () => require('../assets/product1.png'),
    [],
  );
  const fallbackBannerImage = useMemo(
    () => require('../assets/flashBanner.png'),
    [],
  );

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset search when category changes
  useEffect(() => {
    setSearchQuery('');
    setDebouncedQuery('');
  }, [selectedCategory]);

  // Sidebar categories (static + API categories)
  const sidebarCategories = useMemo(() => {
    const staticCategories = [
      { id: 'home', name: 'Home' },
      { id: 'deals', name: 'Deals' },
      { id: 'bestsellers', name: 'Bestsellers' },
    ];
    return [...staticCategories, ...categories];
  }, [categories]);

  const normalizeCategory = useCallback(
    (item: any, index: number): CategoryItem => ({
      id: String(item?.id ?? item?.category_id ?? `category-${index}`),
      name: item?.name ?? item?.title ?? 'Category',
      image: item?.logo ?? null,
    }),
    [],
  );

  const normalizeBanner = useCallback(
    (item: any, index: number): BannerItem => {
      return {
        id: String(item?.id ?? `banner-${index}`),
        imageUrl: item?.image_url ?? item?.image ?? null,
        title: item?.title ?? null,
        type: item?.type ?? null,
      };
    },
    [],
  );

  const normalizeProduct = useCallback((item: any, index: number): Product => {
    const image =
      item?.images?.find((img: any) => img?.url)?.url ?? item?.image ?? null;
    const priceValue =
      typeof item?.price === 'number'
        ? item.price
        : Number(item?.price ?? item?.current_price ?? 0);
    const originalPriceValue =
      typeof item?.original_price === 'number'
        ? item.original_price
        : Number(item?.original_price ?? item?.mrp ?? 0);

    const discount =
      Number.isFinite(priceValue) &&
      Number.isFinite(originalPriceValue) &&
      originalPriceValue > priceValue
        ? `${Math.round(
            ((originalPriceValue - priceValue) / originalPriceValue) * 100,
          )}% Off`
        : item?.discount_label ?? null;

    return {
      id: String(item?.id ?? item?.product_id ?? `product-${index}`),
      name: item?.name ?? item?.title ?? 'Product',
      description: item?.description ?? null,
      price: Number.isFinite(priceValue) ? priceValue : null,
      originalPrice: Number.isFinite(originalPriceValue)
        ? originalPriceValue
        : null,
      discount,
      image,
      rating:
        typeof item?.rating === 'number'
          ? item.rating
          : typeof item?.average_rating === 'number'
          ? item.average_rating
          : null,
      reviews:
        typeof item?.reviews_count === 'number'
          ? item.reviews_count
          : typeof item?.reviews === 'number'
          ? item.reviews
          : null,
      soldCount: item?.sold_count ?? null,
      deliveryDays: item?.delivery_days
        ? `Delivery in ${item.delivery_days} days`
        : 'Delivery in 3 days',
    };
  }, []);

  const fetchVendorDetail = useCallback(async () => {
    if (!businessId) {
      setError('Business ID is missing.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getVendorDetail(businessId);
      setVendorData({
        id: String(data?.id ?? businessId),
        name: data?.name ?? businessName ?? 'Vendor',
        logo: data?.logo ?? null,
        description: data?.description ?? null,
        average_rating:
          typeof data?.average_rating === 'number' ? data.average_rating : null,
        reviews_count:
          typeof data?.reviews_count === 'number' ? data.reviews_count : null,
      });
    } catch (err: any) {
      setError(err?.message || 'Unable to load vendor details.');
    } finally {
      setLoading(false);
    }
  }, [businessId, businessName]);

  const fetchCategories = useCallback(async () => {
    try {
      const payload = await getCategories();
      const listSource = Array.isArray(payload?.results)
        ? payload.results
        : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
        ? payload
        : [];
      setCategories(listSource.map(normalizeCategory));
    } catch (err: any) {
      console.warn('Failed to load categories:', err);
    }
  }, [normalizeCategory]);

  const fetchBanners = useCallback(async () => {
    setBannersLoading(true);
    try {
      const payload = await getVendorBanners();
      const listSource = Array.isArray(payload?.results)
        ? payload.results
        : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
        ? payload
        : [];
      setBanners(listSource.map(normalizeBanner));
    } catch (err: any) {
      console.warn('Failed to load banners:', err);
      setBanners([]);
    } finally {
      setBannersLoading(false);
    }
  }, [normalizeBanner]);

  const storeBanners = useMemo(
    () =>
      banners.filter(
        banner => banner.type?.toLowerCase() === 'store' && banner.imageUrl,
      ),
    [banners],
  );

  const fetchProducts = useCallback(
    async (mode: 'default' | 'refresh' = 'default') => {
      if (mode === 'refresh') {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      try {
        let payload: any;

        if (selectedCategory === 'bestsellers') {
          // Fetch bestsellers
          const bestsellerParams: { search?: string } = {};
          if (debouncedQuery) {
            bestsellerParams.search = debouncedQuery;
          }
          payload = await getBestsellers(bestsellerParams);
        } else {
          // Fetch regular products
          const params: {
            business?: string;
            category?: string;
            search?: string;
          } = {
            business: businessId,
          };

          if (
            selectedCategory &&
            selectedCategory !== 'home' &&
            selectedCategory !== 'deals'
          ) {
            params.category = selectedCategory;
          }

          if (debouncedQuery) {
            params.search = debouncedQuery;
          }

          payload = await getProducts(params);
        }

        const listSource = Array.isArray(payload?.results)
          ? payload.results
          : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
          ? payload
          : [];
        setProducts(listSource.map(normalizeProduct));
      } catch (err: any) {
        setError(err?.message || 'Unable to load products.');
        setProducts([]);
      } finally {
        if (mode === 'refresh') {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [businessId, selectedCategory, debouncedQuery, normalizeProduct],
  );

  useEffect(() => {
    fetchVendorDetail();
    fetchCategories();
    fetchBanners();
  }, [fetchVendorDetail, fetchCategories, fetchBanners]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    setSidebarVisible(false);
  }, []);

  const renderProductCard = ({
    item,
    index,
  }: {
    item: Product;
    index: number;
  }) => {
    const isLeftColumn = index % 2 === 0;

    return (
      <TouchableOpacity
        style={[
          styles.productCard,
          isLeftColumn ? styles.leftCard : styles.rightCard,
        ]}
        onPress={() =>
          navigation.navigate('ProductDetail', { product: { id: item.id } })
        }
      >
        {/* Discount Badge */}
        {item.discount ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{item.discount}</Text>
          </View>
        ) : null}

        {/* Bestseller Badge */}
        {selectedCategory === 'bestsellers' ? (
          <View style={styles.bestsellerBadge}>
            <Text style={styles.bestsellerText}>Bestseller</Text>
          </View>
        ) : null}

        {/* Product Image */}
        {item.image ? (
          <Image
            source={item.image ? { uri: item.image } : fallbackProductImage}
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

        {/* Favorite Icon */}
        <TouchableOpacity style={styles.favoriteButton}>
          <Icon name="favorite-border" size={20} color={COLORS.white} />
        </TouchableOpacity>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          {item.description ? (
            <Text style={styles.productDescription} numberOfLines={1}>
              {item.description}
            </Text>
          ) : null}

          {/* Delivery Badge */}
          <View style={styles.deliveryBadge}>
            <Text style={styles.deliveryText}>
              {item.deliveryDays ?? 'Delivery in 3 days'}
            </Text>
          </View>

          {/* Price Section */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>
              {item.price ? `Rs ${item.price}` : 'Price unavailable'}
            </Text>
            {item.originalPrice &&
            item.price &&
            item.originalPrice > item.price ? (
              <Text style={styles.originalPrice}>Rs {item.originalPrice}</Text>
            ) : null}
          </View>

          {/* Rating and Sold Count */}
          {item.rating != null && item.reviews != null ? (
            <View style={styles.ratingRow}>
              <View style={styles.ratingBadge}>
                <FontAwesome name="star" size={12} color={COLORS.accentGold} />
                <Text style={styles.ratingText}>
                  {item.rating ? item.rating.toFixed(1) : '--'}
                </Text>
              </View>
              <Text style={styles.reviewText}>
                {item.reviews ? `(${item.reviews})` : ''}
              </Text>
            </View>
          ) : null}

          {item.soldCount ? (
            <Text style={styles.soldText}>{item.soldCount}</Text>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  const selectedCategoryName =
    sidebarCategories.find(cat => cat.id === selectedCategory)?.name ??
    'All Products';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Search */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setSidebarVisible(true)}
        >
          <Icon name="menu" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <Ionicons
            name="search-outline"
            size={18}
            color={COLORS.gray500}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search Products from ${
              vendorData?.name ?? businessName ?? 'Vendor'
            }`}
            placeholderTextColor={COLORS.gray500}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.gray500} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Vendor Info Section */}
      {vendorData && (
        <View style={styles.vendorInfoSection}>
          <View style={styles.vendorHeader}>
            {vendorData.logo ? (
              <Image
                source={
                  vendorData.logo
                    ? { uri: vendorData.logo }
                    : fallbackVendorImage
                }
                style={styles.vendorLogo}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.vendorLogo}>
                <Ionicons
                  name="storefront"
                  size={s(30)}
                  color={COLORS.primary}
                />
              </View>
            )}
            <View style={styles.vendorTextContainer}>
              <Text style={styles.vendorName}>{vendorData.name}</Text>
              {vendorData.description ? (
                <Text style={styles.vendorDescription} numberOfLines={2}>
                  {vendorData.description}
                </Text>
              ) : null}
              <View style={styles.vendorRatingRow}>
                {vendorData.average_rating != null ? (
                  <>
                    <FontAwesome
                      name="star"
                      size={14}
                      color={COLORS.accentAmber}
                    />
                    <Text style={styles.vendorRatingText}>
                      {vendorData.average_rating.toFixed(1)}
                    </Text>
                    {vendorData.reviews_count != null ? (
                      <Text style={styles.vendorReviewText}>
                        ({vendorData.reviews_count})
                      </Text>
                    ) : null}
                  </>
                ) : null}
                {/* <Text style={styles.vendorSoldText}>100+ bought past week</Text> */}
              </View>
            </View>
            {/* <TouchableOpacity style={styles.shareButton}>
              <Icon name="share" size={20} color={COLORS.black} />
            </TouchableOpacity> */}
          </View>
        </View>
      )}

      {/* Store Type Banners */}
      {bannersLoading && storeBanners.length === 0 ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loaderText}>Loading banners...</Text>
        </View>
      ) : (
        <SimpleCarousel
          data={storeBanners}
          fallbackImage={fallbackBannerImage}
        />
      )}

      {/* Category Title */}
      <View style={styles.categoryTitleContainer}>
        <Text style={styles.categoryTitle}>
          {selectedCategoryName.toUpperCase()}
        </Text>
      </View>

      {/* Error Banner */}
      {error ? (
        <TouchableOpacity
          style={styles.errorBanner}
          onPress={() => fetchProducts()}
        >
          <Icon name="error-outline" size={18} color={COLORS.accentRed} />
          <View style={{ flex: 1 }}>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.retryText}>Tap to retry</Text>
          </View>
        </TouchableOpacity>
      ) : null}

      {/* Loading State */}
      {loading && products.length === 0 ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loaderText}>Loading products...</Text>
        </View>
      ) : null}

      {/* Product Grid */}
      <FlatList
        data={products}
        renderItem={renderProductCard}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.productList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchProducts('refresh')}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Icon name="category" size={80} color={COLORS.gray700} />
              <Text style={styles.emptyTitle}>No products found</Text>
              <Text style={styles.emptySubtitle}>
                {selectedCategory
                  ? `No products found in ${selectedCategoryName}.`
                  : 'No products available for this vendor.'}
              </Text>
            </View>
          ) : null
        }
      />

      {/* Sidebar Modal */}
      <Modal
        visible={sidebarVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSidebarVisible(false)}
      >
        <View style={styles.sidebarOverlay}>
          <View style={styles.sidebarContainer}>
            <View style={styles.sidebarHeader}>
              <Text style={styles.sidebarTitle}>Categories</Text>
              <TouchableOpacity onPress={() => setSidebarVisible(false)}>
                <Icon name="close" size={24} color={COLORS.black} />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.sidebarContent}
              showsVerticalScrollIndicator={false}
            >
              {sidebarCategories.map(category => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.sidebarItem,
                    selectedCategory === category.id &&
                      styles.sidebarItemActive,
                  ]}
                  onPress={() => handleCategorySelect(category.id)}
                >
                  <Text
                    style={[
                      styles.sidebarItemText,
                      selectedCategory === category.id &&
                        styles.sidebarItemTextActive,
                    ]}
                  >
                    {category.name}
                  </Text>
                  <Icon
                    name="chevron-right"
                    size={20}
                    color={
                      selectedCategory === category.id
                        ? COLORS.primary
                        : COLORS.gray500
                    }
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <TouchableOpacity
            style={styles.sidebarBackdrop}
            activeOpacity={1}
            onPress={() => setSidebarVisible(false)}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default VendorDetail;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: '12@s',
    paddingVertical: '10@vs',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray850,
  },
  menuButton: {
    padding: '5@s',
    marginRight: '10@s',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray975,
    borderRadius: '8@s',
    paddingHorizontal: '12@s',
    paddingVertical: '8@vs',
  },
  searchIcon: {
    marginRight: '8@s',
  },
  searchInput: {
    flex: 1,
    fontSize: '13@ms',
    color: COLORS.black,
  },
  vendorInfoSection: {
    backgroundColor: COLORS.white,
    paddingHorizontal: '16@s',
    paddingVertical: '12@vs',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray850,
  },
  vendorHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  vendorLogo: {
    width: '60@s',
    height: '60@s',
    borderRadius: '30@s',
    marginRight: '12@s',
    backgroundColor: COLORS.gray1025,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vendorTextContainer: {
    flex: 1,
  },
  vendorName: {
    fontSize: '16@ms',
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: '4@vs',
  },
  vendorDescription: {
    fontSize: '12@ms',
    color: COLORS.textAsh,
    marginBottom: '6@vs',
    lineHeight: '16@vs',
  },
  vendorRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '4@s',
  },
  vendorRatingText: {
    fontSize: '12@ms',
    color: COLORS.black,
    fontWeight: '600',
    marginLeft: '2@s',
  },
  vendorReviewText: {
    fontSize: '12@ms',
    color: COLORS.textCool,
  },
  vendorSoldText: {
    fontSize: '11@ms',
    color: COLORS.textAsh,
    marginLeft: '8@s',
  },
  shareButton: {
    padding: '5@s',
  },
  bannerContainer: {
    height: '80@vs',
    backgroundColor: COLORS.accentRed,
    marginVertical: '10@vs',
  },
  bannerImage: {
    width: screenWidth - 20,
    height: '180@vs',
    borderRadius: '10@s',
    resizeMode: 'contain',
  },
  carouselContainer: {
    position: 'relative',
    marginVertical: '10@vs',
  },
  bannerWrapper: {
    width: screenWidth,
    alignItems: 'center',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: '8@vs',
    width: '100%',
  },
  indicator: {
    width: '6@s',
    height: '6@s',
    borderRadius: '3@s',
    backgroundColor: COLORS.gray700,
    marginHorizontal: '3@s',
  },
  activeIndicator: {
    backgroundColor: COLORS.black,
  },
  categoryTitleContainer: {
    paddingHorizontal: '16@s',
    paddingVertical: '10@vs',
    backgroundColor: COLORS.white,
  },
  categoryTitle: {
    fontSize: '14@ms',
    fontWeight: '700',
    color: COLORS.black,
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
  discountBadge: {
    position: 'absolute',
    top: '8@vs',
    backgroundColor: COLORS.primary,
    paddingHorizontal: '4@s',
    paddingVertical: '2@vs',
    borderRadius: '4@s',
    zIndex: 2,
  },
  discountText: {
    color: COLORS.white,
    fontSize: '10@ms',
    fontWeight: '400',
  },
  bestsellerBadge: {
    position: 'absolute',
    top: '30@vs',
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
    height: '160@vs',
    backgroundColor: COLORS.gray1025,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    top: '130@vs',
    right: '8@s',
    backgroundColor: COLORS.overlayStrong,
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
    padding: '10@s',
  },
  productName: {
    width: '60%',
    fontSize: '13@ms',
    fontWeight: '500',
    color: COLORS.black,
    marginBottom: '2@vs',
  },
  productDescription: {
    fontSize: '10@ms',
    color: COLORS.textAsh,
    marginBottom: '4@vs',
  },
  deliveryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accentClay,
    paddingHorizontal: '4@s',
    paddingVertical: '2@vs',
    marginBottom: '4@vs',
  },
  deliveryText: {
    fontSize: '10@ms',
    color: COLORS.white,
    fontWeight: '400',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '2@vs',
  },
  price: {
    fontSize: '14@ms',
    fontWeight: '700',
    color: COLORS.black,
    marginRight: '8@s',
  },
  originalPrice: {
    fontSize: '13@ms',
    color: COLORS.textAsh,
    textDecorationLine: 'line-through',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '2@vs',
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
    fontSize: '11@ms',
    color: COLORS.black,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.infoSurface,
    borderRadius: '10@s',
    paddingHorizontal: '12@s',
    paddingVertical: '8@vs',
    marginHorizontal: '16@s',
    marginTop: '16@vs',
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
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: '40@vs',
    gap: '8@vs',
  },
  emptyTitle: {
    fontSize: '16@ms',
    fontWeight: '600',
    color: COLORS.textSemiDark,
  },
  emptySubtitle: {
    fontSize: '13@ms',
    color: COLORS.textAsh,
    textAlign: 'center',
  },
  sidebarOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebarBackdrop: {
    flex: 1,
    backgroundColor: COLORS.overlayStrong,
  },
  sidebarContainer: {
    width: '70%',
    backgroundColor: COLORS.white,
    elevation: 5,
    shadowColor: COLORS.black,
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '16@s',
    paddingVertical: '16@vs',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray850,
  },
  sidebarTitle: {
    fontSize: '18@ms',
    fontWeight: '700',
    color: COLORS.black,
  },
  sidebarContent: {
    flex: 1,
  },
  sidebarItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '16@s',
    paddingVertical: '14@vs',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray850,
  },
  sidebarItemActive: {
    backgroundColor: COLORS.infoSurface,
  },
  sidebarItemText: {
    fontSize: '14@ms',
    color: COLORS.black,
  },
  sidebarItemTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
