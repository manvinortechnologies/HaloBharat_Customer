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
  Image,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  ImageSourcePropType,
} from 'react-native';
import { s, ScaledSheet } from 'react-native-size-matters';
import Header from '../component/Header';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Vendors from '../component/Vendors';
import { useNavigation } from '@react-navigation/native';
import COLORS from '../constants/colors';
import { getCategories } from '../api/categories';
import { getBrands } from '../api/brands';
import { getBestsellers } from '../api/products';
import {
  getWishlist,
  toggleWishlistItem,
  removeWishlistItem,
} from '../api/wishlist';
import { getVendorBanners } from '../api/vendors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Use regular require instead of reanimated carousel for now
// Alternatively, we'll create a simple custom carousel

const { width: screenWidth } = Dimensions.get('window');

interface CategoryItem {
  id: string;
  name: string;
  imageUrl: string | null;
}

interface BrandItem {
  id: string;
  name: string;
  offersLabel: string | null;
  imageUrl: string | null;
}

interface ProductItem {
  id: string;
  name: string;
  originalPrice: number | null;
  discountedPrice: number | null;
  imageUrl: string | null;
}

interface BannerItem {
  id: string;
  imageUrl: string | null;
  title?: string | null;
  type?: string | null;
}

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

const Home = () => {
  const navigation = useNavigation<any>();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [topBrands, setTopBrands] = useState<BrandItem[]>([]);
  const [topBrandsLoading, setTopBrandsLoading] = useState(false);
  const [topBrandsError, setTopBrandsError] = useState<string | null>(null);
  const [bestsellers, setBestsellers] = useState<ProductItem[]>([]);
  const [bestsellersLoading, setBestsellersLoading] = useState(false);
  const [bestsellersError, setBestsellersError] = useState<string | null>(null);
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [bannersLoading, setBannersLoading] = useState(false);
  const [bannersError, setBannersError] = useState<string | null>(null);
  const [wishlistMap, setWishlistMap] = useState<Map<string, string | number>>(
    new Map(),
  );
  const [togglingWishlist, setTogglingWishlist] = useState<Set<string>>(
    new Set(),
  );
  const [refreshing, setRefreshing] = useState(false);
  const fallbackCategoryImage = useMemo(
    () => require('../assets/paints.png'),
    [],
  );
  const fallbackBrandImage = useMemo(() => require('../assets/logo.png'), []);
  const fallbackProductImage = useMemo(
    () => require('../assets/product1.png'),
    [],
  );
  const fallbackBannerImage = useMemo(
    () => require('../assets/banner1.png'),
    [],
  );

  const topBanners = useMemo(
    () =>
      banners.filter(
        banner => banner.type?.toLowerCase() === 'top' && banner.imageUrl,
      ),
    [banners],
  );

  const middleBanners = useMemo(
    () =>
      banners.filter(
        banner => banner.type?.toLowerCase() === 'middle' && banner.imageUrl,
      ),
    [banners],
  );
  const insets = useSafeAreaInsets();
  const normalizeCategory = useCallback(
    (item: any, index: number): CategoryItem => {
      return {
        id: String(item?.id ?? item?.category_id ?? `category-${index}`),
        name: item?.name ?? item?.title ?? 'Category',
        imageUrl: item?.logo ?? null,
      };
    },
    [],
  );

  const normalizeBrand = useCallback((item: any, index: number): BrandItem => {
    return {
      id: String(item?.id ?? item?.brand_id ?? `brand-${index}`),
      name: item?.name ?? item?.title ?? 'Brand',
      offersLabel: item?.offers_label ?? `${item?.offers ?? 0} Offers`,
      imageUrl: item?.logo ?? null,
    };
  }, []);

  const normalizeProduct = useCallback(
    (item: any, index: number): ProductItem => {
      const discountedPrice = Number(item?.price ?? item?.price_including_gst);
      const originalPrice = Number(
        item?.price_including_gst ?? item?.original_price,
      );
      const imageFromArray = Array.isArray(item?.images)
        ? item.images.find((img: any) => img?.is_feature)?.url ||
          item.images[0]?.url
        : undefined;

      return {
        id: String(item?.id ?? item?.product_id ?? `product-${index}`),
        name: item?.name ?? item?.title ?? 'Product',
        originalPrice: Number.isFinite(originalPrice) ? originalPrice : null,
        discountedPrice: Number.isFinite(discountedPrice)
          ? discountedPrice
          : originalPrice ?? null,
        imageUrl: imageFromArray ?? item?.primary_image ?? null,
      };
    },
    [],
  );

  const normalizeBanner = useCallback(
    (item: any, index: number): BannerItem => ({
      id: String(item?.id ?? item?.banner_id ?? `banner-${index}`),
      imageUrl: item?.image ?? item?.imageUrl ?? item?.banner_image ?? null,
      title: item?.title ?? item?.name ?? null,
      type: item?.type ?? item?.type_label ?? null,
    }),
    [],
  );

  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    setCategoriesError(null);
    try {
      const response = await getCategories({
        page_size: 5,
      });
      setCategories(response.results.map(normalizeCategory));
    } catch (error: any) {
      setCategories([]);
      setCategoriesError(error?.message || 'Unable to load categories.');
    } finally {
      setCategoriesLoading(false);
    }
  }, [normalizeCategory]);

  const fetchTopBrands = useCallback(async () => {
    setTopBrandsLoading(true);
    setTopBrandsError(null);
    try {
      const response = await getBrands({
        page_size: 5,
      });
      setTopBrands(response.results.map(normalizeBrand).slice(0, 10));
    } catch (error: any) {
      setTopBrands([]);
      setTopBrandsError(error?.message || 'Unable to load brands.');
    } finally {
      setTopBrandsLoading(false);
    }
  }, [normalizeBrand]);

  const fetchBestsellers = useCallback(async () => {
    setBestsellersLoading(true);
    setBestsellersError(null);
    try {
      const response = await getBestsellers({
        page_size: 5,
      });
      setBestsellers(response.results.map(normalizeProduct));
    } catch (error: any) {
      setBestsellers([]);
      setBestsellersError(error?.message || 'Unable to load bestsellers.');
    } finally {
      setBestsellersLoading(false);
    }
  }, [normalizeProduct]);

  const fetchBanners = useCallback(async () => {
    setBannersLoading(true);
    setBannersError(null);
    try {
      const response = await getVendorBanners();
      const listSource = response.results || [];
      setBanners(listSource.map(normalizeBanner));
    } catch (error: any) {
      setBanners([]);
      setBannersError(error?.message || 'Unable to load banners.');
    } finally {
      setBannersLoading(false);
    }
  }, [normalizeBanner]);

  const checkWishlistStatus = useCallback(async () => {
    try {
      const wishlist = await getWishlist();
      const wishlistArray = Array.isArray(wishlist?.results)
        ? wishlist.results
        : [];
      const newWishlistMap = new Map<string, string | number>();
      wishlistArray.forEach((item: any) => {
        const productId = String(item?.product ?? item?.product_id ?? item?.id);
        if (productId && item?.id) {
          newWishlistMap.set(productId, item.id);
        }
      });
      console.log('newWishlistMap', newWishlistMap);
      setWishlistMap(newWishlistMap);
    } catch (error) {
      // Silently fail - wishlist check is not critical
      setWishlistMap(new Map());
    }
  }, []);

  const handleToggleWishlist = useCallback(
    async (productId: string) => {
      if (togglingWishlist.has(productId)) return;

      try {
        setTogglingWishlist(prev => new Set(prev).add(productId));
        console.log('wishlistMap', wishlistMap);
        const wishlistItemId = wishlistMap.get(productId);
        if (wishlistItemId) {
          // Remove from wishlist
          await removeWishlistItem(wishlistItemId);
        } else {
          // Add to wishlist
          await toggleWishlistItem(productId);
          // Re-check wishlist to get the new wishlist item ID
        }
        await checkWishlistStatus();
      } catch (error: any) {
        // Silently fail or show a toast - user can retry
        console.error('Wishlist toggle failed:', error);
      } finally {
        setTogglingWishlist(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      }
    },
    [wishlistMap, togglingWishlist, checkWishlistStatus],
  );

  useEffect(() => {
    fetchCategories();
    fetchTopBrands();
    fetchBestsellers();
    fetchBanners();
    checkWishlistStatus();
  }, [
    fetchCategories,
    fetchTopBrands,
    fetchBestsellers,
    fetchBanners,
    checkWishlistStatus,
  ]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchCategories(),
        fetchTopBrands(),
        fetchBestsellers(),
        fetchBanners(),
        checkWishlistStatus(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [
    fetchCategories,
    fetchTopBrands,
    fetchBestsellers,
    fetchBanners,
    checkWishlistStatus,
  ]);

  const formatPrice = (value: number | null) =>
    value && !Number.isNaN(value) ? `₹${value.toLocaleString('en-IN')}` : '';

  return (
    <View style={[styles.container]}>
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={() => navigation.navigate('Categories')}
          >
            <Text style={styles.seeAllText}>See all</Text>
            <Icon name="chevron-forward" size={12} />
          </TouchableOpacity>
        </View>
        {categoriesError ? (
          <TouchableOpacity
            style={styles.errorBanner}
            onPress={fetchCategories}
          >
            <Icon name="warning-outline" size={16} color={COLORS.accentRed} />
            <Text style={styles.errorText}>{categoriesError}</Text>
            <Text style={styles.retryText}>Tap to retry</Text>
          </TouchableOpacity>
        ) : null}
        {categoriesLoading && categories.length === 0 ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loaderText}>Loading categories...</Text>
          </View>
        ) : (
          <FlatList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.categoriesContainer}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.categoryItem}
                onPress={() => navigation.navigate('ProductCategoryList')}
              >
                {item.imageUrl ? (
                  <View style={styles.categoryImage}>
                    <Image
                      source={
                        item.imageUrl
                          ? { uri: item.imageUrl }
                          : fallbackCategoryImage
                      }
                      style={styles.catImage}
                    />
                  </View>
                ) : (
                  <View style={styles.categoryImage}>
                    <MaterialIcons
                      name="category"
                      size={s(40)}
                      color={COLORS.primary}
                    />
                  </View>
                )}
                <Text style={styles.categoryText}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        )}

        {/* Banner Carousel - Top type */}
        {bannersError ? (
          <TouchableOpacity style={styles.errorBanner} onPress={fetchBanners}>
            <Icon name="warning-outline" size={16} color={COLORS.accentRed} />
            <Text style={styles.errorText}>{bannersError}</Text>
            <Text style={styles.retryText}>Tap to retry</Text>
          </TouchableOpacity>
        ) : null}
        {bannersLoading && topBanners.length === 0 ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loaderText}>Loading banners...</Text>
          </View>
        ) : (
          <SimpleCarousel
            data={topBanners}
            fallbackImage={fallbackBannerImage}
          />
        )}

        {/* Top Brands */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Brands</Text>
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={() => navigation.navigate('BrandList')}
          >
            <Text style={styles.seeAllText}>See all</Text>
            <Icon name="chevron-forward" size={12} />
          </TouchableOpacity>
        </View>
        {topBrandsError ? (
          <TouchableOpacity style={styles.errorBanner} onPress={fetchTopBrands}>
            <Icon name="warning-outline" size={16} color={COLORS.accentRed} />
            <Text style={styles.errorText}>{topBrandsError}</Text>
            <Text style={styles.retryText}>Tap to retry</Text>
          </TouchableOpacity>
        ) : null}
        {topBrandsLoading && topBrands.length === 0 ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loaderText}>Loading top brands...</Text>
          </View>
        ) : (
          <FlatList
            data={topBrands}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.brandsContainer}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.brandCard}
                activeOpacity={0.8}
                onPress={() =>
                  navigation.navigate('BrandProductsList', {
                    brandId: item.id,
                    brandName: item.name,
                  })
                }
              >
                <View style={styles.brandImageContainer}>
                  <Image
                    source={
                      item.imageUrl
                        ? { uri: item.imageUrl }
                        : fallbackBrandImage
                    }
                    style={styles.brandImage}
                  />
                </View>

                {/* {item.offersLabel ? (
                  <View style={styles.offerBadge}>
                    <Text style={styles.offerText}>{item.offersLabel}</Text>
                  </View>
                ) : null} */}

                <Text style={styles.brandName}>{item.name}</Text>
                <View style={styles.brandNameContainer}></View>
              </TouchableOpacity>
            )}
          />
        )}

        {/* Middle Banners below Top Brands */}
        {middleBanners.length > 0 ? (
          <View style={styles.middleBannerWrapper}>
            <SimpleCarousel
              data={middleBanners}
              fallbackImage={fallbackBannerImage}
            />
          </View>
        ) : null}

        {/* BESTSELLERS Section */}
        {/* Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>BESTSELLERS</Text>
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={() => navigation.navigate('ProductList')}
          >
            <Text style={styles.seeAllText}>See all</Text>
            <Icon name="chevron-forward" size={14} color={COLORS.textStone} />
          </TouchableOpacity>
        </View>

        {/* Product List */}
        {bestsellersError ? (
          <TouchableOpacity
            style={styles.errorBanner}
            onPress={fetchBestsellers}
          >
            <Icon name="warning-outline" size={16} color={COLORS.accentRed} />
            <Text style={styles.errorText}>{bestsellersError}</Text>
            <Text style={styles.retryText}>Tap to retry</Text>
          </TouchableOpacity>
        ) : null}
        {bestsellersLoading && bestsellers.length === 0 ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loaderText}>Loading bestsellers...</Text>
          </View>
        ) : (
          <FlatList
            data={bestsellers}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.productsContainer}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.productCard}
                onPress={() =>
                  navigation.navigate('ProductDetail', { product: item })
                }
              >
                <View style={styles.imageContainer}>
                  {item.imageUrl ? (
                    <Image
                      source={
                        item.imageUrl
                          ? { uri: item.imageUrl }
                          : fallbackProductImage
                      }
                      style={styles.productImage}
                    />
                  ) : (
                    <View style={styles.productImage}>
                      <Icon
                        name="image-outline"
                        size={s(80)}
                        color={COLORS.primary}
                      />
                    </View>
                  )}
                  {/* <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>10% Off</Text>
                  </View> */}
                  <TouchableOpacity
                    style={styles.heartIcon}
                    onPress={() => handleToggleWishlist(item.id)}
                    disabled={togglingWishlist.has(item.id)}
                  >
                    {togglingWishlist.has(item.id) ? (
                      <ActivityIndicator size="small" color={COLORS.white} />
                    ) : (
                      <Icon
                        name={
                          wishlistMap.has(item.id) ? 'heart' : 'heart-outline'
                        }
                        size={18}
                        color={
                          wishlistMap.has(item.id)
                            ? COLORS.accentRuby
                            : COLORS.white
                        }
                      />
                    )}
                  </TouchableOpacity>
                  <View style={styles.priceContainer}>
                    <Text style={styles.originalPrice}>
                      {formatPrice(item.originalPrice)}
                    </Text>
                    <Text style={styles.discountedPrice}>
                      {formatPrice(item.discountedPrice) ||
                        formatPrice(item.originalPrice) ||
                        'Price unavailable'}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailsContainer}>
                  <Text style={styles.productName}>{item.name}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}

        {/* SHOP BY VENDOR Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>SHOP BY VENDOR</Text>
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={() => navigation.navigate('VendorList')}
          >
            <Text style={styles.seeAllText}>See all</Text>
            <Icon name="chevron-forward" size={12} />
          </TouchableOpacity>
        </View>

        {/* {vendors.map(vendor => (
          <TouchableOpacity key={vendor.id} style={styles.vendorCard}>
            <View style={styles.vendorInfo}>
              <Text style={styles.vendorName}>{vendor.name}</Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.rating}>
                  ⭐ {vendor.rating} ({vendor.reviews})
                </Text>
              </View>
              <Text style={styles.pastWeek}>
                {vendor.pastWeekBought}+ bought past week
              </Text>
            </View>
            <TouchableOpacity style={styles.visitStoreButton}>
              <Text style={styles.visitStoreText}>Visit store</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))} */}
        <Vendors showSearchBar={false} page_size={5} scrollEnabled={false} />
      </ScrollView>
    </View>
  );
};

export default Home;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray975,
  },
  categoriesContainer: {
    paddingHorizontal: '10@s',
    paddingVertical: '5@vs',
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: '5@s',
  },
  categoryImage: {
    width: '60@s',
    height: '60@s',
    borderRadius: '60@s',
    marginBottom: '2@vs',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray950,
    overflow: 'hidden',
  },
  catImage: {
    height: '100%',
    width: '100%',
    resizeMode: 'cover',
  },
  categoryText: {
    fontSize: '12@ms',
    fontWeight: '500',
    textAlign: 'center',
  },
  carouselContainer: {
    position: 'relative',
  },
  bannerWrapper: {
    width: screenWidth,
    alignItems: 'center',
  },
  bannerImage: {
    width: screenWidth - 20,
    height: '180@vs',
    borderRadius: '10@s',
    resizeMode: 'contain',
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
  sectionTitle: {
    fontSize: '18@ms',
    fontWeight: '700',
    marginVertical: '5@vs',
    paddingHorizontal: '5@s',
  },
  brandsContainer: {
    paddingHorizontal: '10@s',
    paddingVertical: '5@vs',
  },
  middleBannerWrapper: {
    marginVertical: '10@vs',
  },
  brandCard: {
    marginRight: '10@s',
    // borderRadius: '12@s',
  },
  brandImageContainer: {
    width: '120@s',
    height: '120@s',
    borderRadius: '12@s',
    overflow: 'hidden', // ensures image and overlay stay within rounded corners
    borderWidth: 1,
    borderColor: COLORS.gray850,
    backgroundColor: COLORS.gray950,
  },
  brandImage: {
    width: '100%',
    height: '100%',
    borderRadius: '12@s',
  },
  offerBadge: {
    position: 'absolute',
    top: '8@vs',
    left: '1@s',
    backgroundColor: COLORS.primaryDeep,
    borderRadius: '2@s',
    paddingVertical: '3@vs',
    paddingHorizontal: '8@s',
  },
  offerText: {
    color: COLORS.white,
    fontSize: '10@ms',
    fontWeight: '500',
  },
  brandNameContainer: {
    // position: 'absolute',
    // bottom: '8@vs',
    // left: '8@s',
  },
  brandName: {
    color: COLORS.black,
    fontSize: '13@ms',
    fontWeight: '700',
    alignSelf: 'center',
  },
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
  productsContainer: {
    paddingHorizontal: '10@s',
    paddingVertical: '10@vs',
    // backgroundColor: COLORS.white,
  },
  productCard: {
    width: 150,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    marginRight: 15,
    overflow: 'hidden',
    elevation: 3,
    marginBottom: '10@vs',
  },
  imageContainer: {
    position: 'relative',
    height: 110,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountBadge: {
    position: 'absolute',
    top: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '600',
  },
  heartIcon: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: COLORS.overlayStrong,
    padding: 4,
    borderRadius: 50,
  },
  detailsContainer: {
    paddingHorizontal: '8@s',
    paddingVertical: '4@vs',
    backgroundColor: COLORS.gray950,
  },
  priceContainer: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  originalPrice: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: '500',
    textDecorationLine: 'line-through',
    marginRight: 5,
  },
  discountedPrice: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.white,
  },
  productName: {
    fontSize: 12,
    fontWeight: '500',

    color: COLORS.black,
  },
  vendorCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.gray1050,
    borderRadius: '10@s',
    padding: '15@s',
    marginHorizontal: '10@s',
    marginBottom: '10@vs',
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    fontSize: '16@ms',
    fontWeight: '700',
    marginBottom: '4@vs',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '2@vs',
  },
  rating: {
    fontSize: '12@ms',
    color: COLORS.textSubtle,
  },
  pastWeek: {
    fontSize: '11@ms',
    color: COLORS.textSubtle,
  },
  visitStoreButton: {
    backgroundColor: COLORS.brandBlue,
    paddingHorizontal: '15@s',
    paddingVertical: '8@vs',
    borderRadius: '6@s',
  },
  visitStoreText: {
    color: COLORS.white,
    fontSize: '12@ms',
    fontWeight: '600',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.infoSurface,
    borderRadius: '10@s',
    marginHorizontal: '12@s',
    marginBottom: '8@vs',
    paddingHorizontal: '10@s',
    paddingVertical: '8@vs',
    gap: '6@s',
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
    paddingVertical: '12@vs',
  },
  loaderText: {
    fontSize: '13@ms',
    color: COLORS.textDark,
  },
});
