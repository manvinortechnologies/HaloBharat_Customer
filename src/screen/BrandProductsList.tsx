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
  Modal,
  Dimensions,
  ImageSourcePropType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { s, ScaledSheet } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/MaterialIcons';
import NormalHeader from '../component/NormalHeader';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import COLORS from '../constants/colors';
import { getProducts } from '../api/products';
import { getVendorBanners } from '../api/vendors';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width: screenWidth } = Dimensions.get('window');

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

interface BannerItem {
  id: string;
  imageUrl: string;
  title?: string | null;
  type?: string | null;
}

type BrandRoute = RouteProp<
  { BrandProductsList: { brandId?: string; brandName?: string } },
  'BrandProductsList'
>;

// Simple custom carousel component
const SimpleCarousel = ({ data }: { data: BannerItem[] }) => {
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
              source={{ uri: banner.imageUrl }}
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

const BrandProductsList = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<BrandRoute>();
  const brandId = route.params?.brandId ?? null;
  const brandName = route.params?.brandName ?? 'Brand';
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [priceSort, setPriceSort] = useState<
    'low-to-high' | 'high-to-low' | null
  >(null);
  const [nameSort, setNameSort] = useState<'a-to-z' | 'z-to-a' | null>(null);

  const fallbackProductImage = useMemo(
    () => require('../assets/product1.png'),
    [],
  );

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [bannersLoading, setBannersLoading] = useState(false);

  const normalizeBanner = useCallback(
    (item: any, index: number): BannerItem => {
      return {
        id: String(item?.id ?? `banner-${index}`),
        imageUrl: item?.image_url ?? item?.image,
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
    const originalPriceValue = Number(item?.mrp ?? 0);

    const discountLabel =
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
      discount: discountLabel,
      image,
      rating: item.average_rating,
      reviews: item.reviews_count || item.reviews.length || 0,
      soldCount: item.sold_count,
      deliveryDays: item.delivery_days,
    };
  }, []);

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

  const topBanners = useMemo(
    () =>
      banners.filter(
        banner => banner.type?.toLowerCase() === 'top' && banner.imageUrl,
      ),
    [banners],
  );

  const fetchBrandProducts = useCallback(
    async (mode: 'default' | 'refresh' = 'default') => {
      if (!brandId) {
        setProducts([]);
        return;
      }
      if (mode === 'refresh') {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      try {
        const payload = await getProducts({ brand: brandId });
        const listSource = Array.isArray(payload?.results)
          ? payload.results
          : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
          ? payload
          : [];
        setProducts(listSource.map(normalizeProduct));
      } catch (err: any) {
        setProducts([]);
        setError(err?.message || 'Unable to load brand products.');
      } finally {
        if (mode === 'refresh') {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [brandId, normalizeProduct],
  );

  useEffect(() => {
    fetchBrandProducts();
    fetchBanners();
  }, [fetchBrandProducts, fetchBanners]);

  // Apply filters and sorting to products
  const sortedProducts = useMemo(() => {
    let sorted = [...products];

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
  }, [products, priceSort, nameSort]);

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
        onPress={() => navigation.navigate('ProductDetail', { product: item })}
      >
        {item.discount ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{item.discount}</Text>
          </View>
        ) : null}

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

        <TouchableOpacity style={styles.favoriteButton}>
          <Icon name="favorite-border" size={20} color={COLORS.white} />
        </TouchableOpacity>

        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.productDescription} numberOfLines={1}>
            {item.description}
          </Text>

          {item.deliveryDays ? (
            <View style={styles.deliveryBadge}>
              <Text style={styles.deliveryText}>{item.deliveryDays}</Text>
            </View>
          ) : null}

          <View style={styles.priceRow}>
            <Text style={styles.price}>
              {item.price != null ? `Rs ${item.price}` : 'Price on request'}
            </Text>
            <Text style={styles.originalPrice}>Rs {item.originalPrice}</Text>
          </View>

          {item.rating ? (
            <View style={styles.ratingRow}>
              <View style={styles.ratingBadge}>
                <Icon name="star" size={12} color={COLORS.accentGold} />
                <Text style={styles.ratingText}>{item.rating}</Text>
              </View>
              {item.reviews ? (
                <Text style={styles.reviewText}>({item.reviews})</Text>
              ) : null}
            </View>
          ) : null}

          {item.soldCount ? (
            <Text style={styles.soldText}>{item.soldCount}</Text>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <>
      {/* Top Type Banners */}
      {bannersLoading && topBanners.length === 0 ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loaderText}>Loading banners...</Text>
        </View>
      ) : (
        <SimpleCarousel data={topBanners} />
      )}

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

      {/* Filter Modal */}

      {loading && products.length === 0 ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loaderText}>Loading products...</Text>
        </View>
      ) : null}

      {error ? (
        <TouchableOpacity
          style={styles.errorBanner}
          onPress={() => fetchBrandProducts()}
        >
          <Icon name="error-outline" size={18} color={COLORS.accentRed} />
          <View style={{ flex: 1 }}>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.retryText}>Tap to retry</Text>
          </View>
        </TouchableOpacity>
      ) : null}
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <NormalHeader title={brandName} />

      <FlatList
        data={sortedProducts}
        renderItem={renderProductCard}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.productList}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={() => fetchBrandProducts('refresh')}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Icon name="inventory-2" size={32} color={COLORS.gray700} />
              <Text style={styles.emptyTitle}>No products found</Text>
              <Text style={styles.emptySubtitle}>
                Products for this brand will appear here.
              </Text>
            </View>
          ) : null
        }
      />
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

export default BrandProductsList;

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
  deliveryText: {
    fontSize: '10@ms',
    color: COLORS.white,
    fontWeight: '400',
    marginLeft: '4@s',
  },
  flashSaleBanner: {
    height: '50@vs',
    backgroundColor: COLORS.accentRed,
    position: 'relative',
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
  deliveryToButton: {
    position: 'absolute',
    right: '16@s',
    top: '50%',
    marginTop: '-15@vs',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.overlayStrong,
    paddingHorizontal: '12@s',
    paddingVertical: '6@vs',
    borderRadius: '6@s',
  },
  deliveryToText: {
    color: COLORS.white,
    fontSize: '12@ms',
    marginLeft: '4@s',
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
  loaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8@s',
    paddingVertical: '16@vs',
  },
  loaderText: {
    fontSize: '12@ms',
    color: COLORS.textDark,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.infoSurface,
    borderRadius: '10@s',
    paddingHorizontal: '12@s',
    paddingVertical: '8@vs',
    marginHorizontal: '12@s',
    marginBottom: '12@vs',
    gap: '8@s',
  },
  errorText: {
    fontSize: '12@ms',
    color: COLORS.textDark,
  },
  retryText: {
    fontSize: '11@ms',
    color: COLORS.primary,
    marginTop: '2@vs',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: '60@vs',
    gap: '6@vs',
  },
  emptyTitle: {
    fontSize: '15@ms',
    fontWeight: '600',
    color: COLORS.textSemiDark,
  },
  emptySubtitle: {
    fontSize: '12@ms',
    color: COLORS.textAsh,
    textAlign: 'center',
  },
});
