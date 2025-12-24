import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Header from '../component/Header';
import COLORS from '../constants/colors';
import { getBestsellers } from '../api/products';
import { getCategories } from '../api/categories';
import { getBrands, getMostSearchedBrands } from '../api/brands';
import { s } from 'react-native-size-matters';

interface CategoryItem {
  id: string;
  name: string;
  imageUrl: string | null;
}

interface BrandItem {
  id: string;
  name: string;
  imageUrl: string | null;
}

const SearchScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [brandsError, setBrandsError] = useState<string | null>(null);
  const [topPicks, setTopPicks] = useState<ProductCard[]>([]);
  const [topPicksLoading, setTopPicksLoading] = useState(false);
  const [topPicksError, setTopPicksError] = useState<string | null>(null);
  const [topPicksFetchNonce, setTopPicksFetchNonce] = useState(0);
  const fallbackCategoryImage = useMemo(
    () => require('../assets/paints.png'),
    [],
  );
  const fallbackProductImage = useMemo(
    () => require('../assets/product1.png'),
    [],
  );

  const recentSearches = [
    'Bricks',
    'Timber & Wood',
    'Stones',
    'Steel Pipes',
    'Tiles',
  ];

  const normalizeCategory = useCallback(
    (item: any, index: number): CategoryItem => {
      return {
        id: String(item?.id ?? item?.category_id ?? `category-${index}`),
        name: item?.name ?? item?.title ?? 'Category',
        imageUrl: item?.logo,
      };
    },
    [],
  );

  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    setCategoriesError(null);
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
    } catch (error: any) {
      setCategories([]);
      setCategoriesError(error?.message || 'Unable to load categories.');
    } finally {
      setCategoriesLoading(false);
    }
  }, [normalizeCategory]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const normalizeBrand = useCallback((item: any, index: number): BrandItem => {
    return {
      id: String(item?.id ?? item?.brand_id ?? `brand-${index}`),
      name: item?.name ?? item?.title ?? 'Brand',
      imageUrl: item?.logo,
    };
  }, []);

  const fetchBrands = useCallback(async () => {
    setBrandsLoading(true);
    setBrandsError(null);
    try {
      const payload = await getMostSearchedBrands();
      const listSource = Array.isArray(payload?.brands)
        ? payload.brands
        : Array.isArray(payload?.results)
        ? payload.results
        : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
        ? payload
        : [];
      setBrands(listSource.map(normalizeBrand));
    } catch (error: any) {
      setBrands([]);
      setBrandsError(error?.message || 'Unable to load brands.');
    } finally {
      setBrandsLoading(false);
    }
  }, [normalizeBrand]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const normalizeTopPick = useCallback((item: any, index: number) => {
    const discountedPrice = Number(item?.price ?? item?.price_including_gst);
    const originalPrice = Number(
      item?.price_including_gst ?? item?.original_price,
    );
    const discountPct =
      typeof item?.discount_percentage === 'number'
        ? item.discount_percentage
        : Number(item?.discount_percentage);
    const imageFromArray = Array.isArray(item?.images)
      ? item.images.find((img: any) => img?.is_feature)?.url ||
        item.images[0]?.url
      : undefined;

    const formatDiscountLabel = () => {
      if (typeof discountPct === 'number' && !Number.isNaN(discountPct)) {
        return `${Math.round(discountPct)}% OFF`;
      }
      return item?.discount_label ?? null;
    };

    return {
      id: String(
        item?.id ?? item?.product_id ?? item?.uuid ?? `top-pick-${index}`,
      ),
      name: item?.name ?? item?.title ?? 'Product',
      originalPrice:
        !Number.isNaN(originalPrice) && originalPrice ? originalPrice : null,
      discountedPrice: !Number.isNaN(discountedPrice)
        ? discountedPrice
        : originalPrice ?? null,
      discountLabel: formatDiscountLabel(),
      imageUrl:
        imageFromArray ??
        item?.image ??
        item?.thumbnail ??
        item?.featured_image ??
        item?.primary_image ??
        null,
      isBestseller: item?.best_seller || false,
    };
  }, []);

  useEffect(() => {
    let isActive = true;
    const fetchTopPicks = async () => {
      setTopPicksLoading(true);
      setTopPicksError(null);
      try {
        const payload = await getBestsellers(
          debouncedQuery ? { search: debouncedQuery } : undefined,
        );
        const listSource = Array.isArray(payload?.results)
          ? payload.results
          : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
          ? payload
          : [];
        if (!isActive) {
          return;
        }
        setTopPicks(listSource.map(normalizeTopPick));
      } catch (error: any) {
        if (!isActive) {
          return;
        }
        setTopPicks([]);
        setTopPicksError(error?.message || 'Unable to load top picks.');
      } finally {
        if (isActive) {
          setTopPicksLoading(false);
        }
      }
    };

    fetchTopPicks();
    return () => {
      isActive = false;
    };
  }, [debouncedQuery, normalizeTopPick, topPicksFetchNonce]);

  const formatPrice = (value: number | null) => {
    if (value === null || Number.isNaN(value)) {
      return '';
    }
    return `₹${value.toLocaleString('en-IN')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search products"
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* <View style={styles.searchBar}>
          <Icon
            name="search-outline"
            size={18}
            color={COLORS.gray500}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products, vendors, categories"
            placeholderTextColor={COLORS.gray500}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearSearch}
            >
              <Icon name="close-circle" size={18} color={COLORS.gray500} />
            </TouchableOpacity>
          )}
        </View> */}

        {/* Recent Searches Section */}
        {/*<View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>RECENT SEARCHES</Text>
          </View>
          <View style={styles.tagsContainer}>
            {recentSearches.map((search, index) => (
              <TouchableOpacity key={index} style={styles.tag}>
                <Text style={styles.tagText}>{search}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>*/}

        {/* Categories Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>CATEGORIES</Text>
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => navigation.navigate('Categories')}
            >
              <Text style={styles.seeAllText}>See all</Text>
              <Icon name="chevron-forward" size={16} color={COLORS.gray400} />
            </TouchableOpacity>
          </View>

          {categoriesError ? (
            <TouchableOpacity
              style={styles.errorBanner}
              onPress={fetchCategories}
            >
              <Icon name="warning-outline" size={18} color={COLORS.accentRed} />
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
                  <View style={styles.categoryImageWrapper}>
                    {item.imageUrl ? (
                      <Image
                        source={{ uri: item.imageUrl }}
                        style={styles.categoryImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <MaterialIcon
                        name="category"
                        size={s(40)}
                        color={COLORS.primary}
                      />
                    )}
                  </View>
                  <Text
                    style={styles.categoryText}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                !categoriesLoading ? (
                  <View style={styles.emptyState}>
                    <Icon
                      name="grid-outline"
                      size={32}
                      color={COLORS.gray500}
                    />
                    <Text style={styles.emptyTitle}>
                      No categories available
                    </Text>
                    <Text style={styles.emptySubtitle}>
                      Check back soon for more categories.
                    </Text>
                  </View>
                ) : null
              }
            />
          )}
        </View>

        {/* Most Searched Brands Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>MOST SEARCHED BRANDS</Text>
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => navigation.navigate('BrandList')}
            >
              <Text style={styles.seeAllText}>See all</Text>
              <Icon name="chevron-forward" size={16} color={COLORS.gray400} />
            </TouchableOpacity>
          </View>

          {brandsError ? (
            <TouchableOpacity style={styles.errorBanner} onPress={fetchBrands}>
              <Icon name="warning-outline" size={18} color={COLORS.accentRed} />
              <Text style={styles.errorText}>{brandsError}</Text>
              <Text style={styles.retryText}>Tap to retry</Text>
            </TouchableOpacity>
          ) : null}

          {brandsLoading && brands.length === 0 ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.loaderText}>Loading brands...</Text>
            </View>
          ) : brands.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.brandsContainer}
            >
              {brands.map((brand, index) => (
                <TouchableOpacity
                  key={brand.id}
                  style={styles.brandCard}
                  onPress={() =>
                    navigation.navigate('BrandProductsList', {
                      brandId: brand.id,
                      brandName: brand.name,
                    })
                  }
                >
                  {brand.imageUrl ? (
                    <Image
                      source={{ uri: brand.imageUrl }}
                      style={styles.brandImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.brandImagePlaceholder}>
                      <MaterialIcon
                        name="business"
                        size={s(24)}
                        color={COLORS.primary}
                      />
                    </View>
                  )}
                  <Text
                    style={styles.brandName}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {brand.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : !brandsLoading ? (
            <View style={styles.emptyState}>
              <Icon name="business-outline" size={32} color={COLORS.gray500} />
              <Text style={styles.emptyTitle}>No brands available</Text>
              <Text style={styles.emptySubtitle}>
                Check back soon for more brands.
              </Text>
            </View>
          ) : null}
        </View>

        {/* Top Picks Section */}
        <View style={[styles.section, styles.lastSection]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>TOP PICKS</Text>
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => navigation.navigate('ProductList')}
            >
              <Text style={styles.seeAllText}>See all</Text>
              <Icon name="chevron-forward" size={16} color={COLORS.gray400} />
            </TouchableOpacity>
          </View>
          {topPicksError ? (
            <TouchableOpacity
              style={styles.errorBanner}
              onPress={() => setTopPicksFetchNonce(prev => prev + 1)}
            >
              <Icon name="warning-outline" size={18} color={COLORS.accentRed} />
              <Text style={styles.errorText}>{topPicksError}</Text>
              <Text style={styles.retryText}>Tap to retry</Text>
            </TouchableOpacity>
          ) : null}
          {topPicksLoading && topPicks.length === 0 ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.loaderText}>Loading top picks...</Text>
            </View>
          ) : (
            <FlatList
              data={topPicks}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.topPicksContainer}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.topPickCard}
                  onPress={() =>
                    navigation.navigate('ProductDetail', { productId: item.id })
                  }
                >
                  {item.discountLabel ? (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>
                        {item.discountLabel}
                      </Text>
                    </View>
                  ) : null}

                  <Image
                    source={
                      item.imageUrl
                        ? { uri: item.imageUrl }
                        : fallbackProductImage
                    }
                    style={styles.topPickImage}
                    resizeMode="cover"
                  />

                  <TouchableOpacity style={styles.favoriteButton}>
                    <Icon name="heart-outline" size={20} color={COLORS.white} />
                  </TouchableOpacity>

                  <View style={styles.topPickInfo}>
                    <Text style={styles.topPickName}>{item.name}</Text>
                    <View style={styles.priceStack}>
                      <Text style={styles.originalPrice}>
                        {formatPrice(item.originalPrice)}
                      </Text>
                      <Text style={styles.topPickPrice}>
                        {formatPrice(item.discountedPrice) ||
                          formatPrice(item.originalPrice) ||
                          'Price unavailable'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                !topPicksLoading ? (
                  <View style={styles.emptyState}>
                    <Icon
                      name="cube-outline"
                      size={32}
                      color={COLORS.gray500}
                    />
                    <Text style={styles.emptyTitle}>No top picks found</Text>
                    <Text style={styles.emptySubtitle}>
                      Try a different search query.
                    </Text>
                  </View>
                ) : null
              }
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SearchScreen;

interface ProductCard {
  id: string;
  name: string;
  originalPrice: number | null;
  discountedPrice: number | null;
  discountLabel: string | null;
  imageUrl: string | null;
  isBestseller: boolean;
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray975,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: COLORS.white,
    marginTop: '15@vs',
    paddingHorizontal: '16@s',
    paddingVertical: '16@vs',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginTop: '12@vs',
    marginHorizontal: '16@s',
    paddingHorizontal: '12@s',
    paddingVertical: '10@vs',
    borderRadius: '12@s',
    shadowColor: COLORS.black,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  searchIcon: {
    marginRight: '8@s',
  },
  searchInput: {
    flex: 1,
    fontSize: '13@ms',
    color: COLORS.black,
  },
  clearSearch: {
    marginLeft: '8@s',
  },
  lastSection: {
    marginBottom: '20@vs',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16@vs',
  },
  sectionTitle: {
    fontSize: '13@ms',
    fontWeight: '700',
    color: COLORS.black,
    letterSpacing: 0.5,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '4@s',
  },
  seeAllText: {
    fontSize: '12@ms',
    color: COLORS.gray400,
    fontWeight: '400',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '8@s',
  },
  tag: {
    borderWidth: 1,
    borderColor: COLORS.gray400,
    paddingHorizontal: '16@s',
    paddingVertical: '8@vs',
    borderRadius: '20@s',
    backgroundColor: COLORS.white,
  },
  tagText: {
    fontSize: '13@ms',
    color: COLORS.textSemiDark,
    fontWeight: '400',
  },
  categoriesContainer: {
    flexGrow: 1,
    paddingVertical: '4@vs',
    justifyContent: 'center',
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: '16@s',
    width: '70@s',
  },
  categoryImageWrapper: {
    width: '60@s',
    height: '60@s',
    borderRadius: '40@s',
    overflow: 'hidden',
    marginBottom: '2@vs',
    backgroundColor: COLORS.gray1025,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryText: {
    fontSize: '12@ms',
    fontWeight: '500',
    color: COLORS.textSemiDark,
    textAlign: 'center',
  },
  brandsContainer: {
    paddingVertical: '4@vs',
  },
  brandCard: {
    width: '120@s',
    height: '60@s',
    borderRadius: '12@s',
    marginRight: '12@s',
    overflow: 'hidden',
    position: 'relative',
  },
  brandImage: {
    width: '100%',
    height: '100%',
  },
  brandImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.gray1025,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandName: {
    position: 'absolute',
    bottom: '8@vs',
    left: '8@s',
    maxWidth: '100@s',
    fontSize: '10@ms',
    fontWeight: '600',
    color: COLORS.white,
    textShadowColor: COLORS.overlayStrong,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  topPicksContainer: {
    flexGrow: 1,
    paddingVertical: '4@vs',
    justifyContent: 'center',
  },
  topPickCard: {
    width: '140@s',
    borderRadius: '20@s',
    marginRight: '12@s',
    backgroundColor: COLORS.white,
  },
  discountBadge: {
    position: 'absolute',
    top: '8@vs',
    backgroundColor: COLORS.primary,
    paddingHorizontal: '8@s',
    paddingVertical: '4@vs',
    borderRadius: '4@s',
    zIndex: 2,
  },
  discountText: {
    fontSize: '11@ms',
    fontWeight: '600',
    color: COLORS.white,
  },
  topPickImage: {
    width: '100%',
    height: '140@vs',
    backgroundColor: COLORS.gray1025,
    resizeMode: 'cover',
    borderRadius: '20@s',
  },
  favoriteButton: {
    position: 'absolute',
    top: '100@vs',
    right: '8@s',
    backgroundColor: COLORS.overlayLight,
    borderRadius: '20@s',
    padding: '6@s',
    zIndex: 2,
  },
  topPickInfo: {
    padding: '12@s',
    position: 'absolute',
    top: '70@vs',
  },
  topPickName: {
    fontSize: '14@ms',
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: '4@vs',
  },
  topPickPrice: {
    fontSize: '13@ms',
    color: COLORS.white,
    fontWeight: '500',
  },
  priceStack: {
    flexDirection: 'column',
  },
  originalPrice: {
    fontSize: '11@ms',
    color: COLORS.gray700,
    textDecorationLine: 'line-through',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8@s',
    backgroundColor: COLORS.infoSurface,
    borderRadius: '10@s',
    paddingHorizontal: '12@s',
    paddingVertical: '8@vs',
    marginBottom: '12@vs',
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: '20@vs',
  },
  emptyTitle: {
    marginTop: '8@vs',
    fontSize: '14@ms',
    fontWeight: '600',
    color: COLORS.textDark,
  },
  emptySubtitle: {
    fontSize: '12@ms',
    color: COLORS.gray500,
  },
});
