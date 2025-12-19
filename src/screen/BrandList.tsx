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
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../component/Header';
import COLORS from '../constants/colors';
import { getBrands } from '../api/brands';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  BrandProductsList: { brandId?: string; brandName?: string };
};

interface Brand {
  id: string;
  name: string;
  productCount: string;
  imageUrl?: string;
}

const BrandList = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const abortRef = useRef<AbortController | null>(null);
  const fallbackBrandImage = useMemo(() => require('../assets/logo.png'), []);

  const normalizeBrand = useCallback((item: any, index: number): Brand => {
    const productCountValue =
      item?.product_count ??
      item?.productCount ??
      item?.products_count ??
      item?.total_products;

    let productCountLabel = 'Products available';
    if (typeof productCountValue === 'number') {
      productCountLabel = `${productCountValue} Products`;
    } else if (typeof productCountValue === 'string' && productCountValue) {
      productCountLabel = productCountValue;
    }

    return {
      id: String(item?.id ?? item?.brand_id ?? item?.uuid ?? `brand-${index}`),
      name: item?.name,
      productCount: productCountLabel,
      imageUrl: item?.logo,
    };
  }, []);

  const fetchBrands = useCallback(
    async (
      query: string,
      mode: 'default' | 'refresh' = 'default',
      page: number = 1,
    ) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      if (mode === 'refresh') {
        setRefreshing(true);
        setCurrentPage(1);
        setHasMore(true);
      } else if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        setError(null);
        const payload = await getBrands({ search: query, page });

        const listSource = payload?.results || [];
        const normalizedBrands = listSource.map(normalizeBrand);

        if (page === 1) {
          setBrands(normalizedBrands);
        } else {
          setBrands(prev => [...prev, ...normalizedBrands]);
        }

        const totalPagesCount = payload?.total_pages ?? 1;
        const currentPageNum = payload?.current_page ?? page;
        const hasNextPage =
          payload?.next !== null && currentPageNum < totalPagesCount;

        setTotalPages(totalPagesCount);
        setCurrentPage(currentPageNum);
        setHasMore(hasNextPage);
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          return;
        }
        setError(err?.message || 'Unable to load brands.');
        if (page === 1) {
          setBrands([]);
        }
      } finally {
        if (mode === 'refresh') {
          setRefreshing(false);
        } else if (page === 1) {
          setLoading(false);
        } else {
          setLoadingMore(false);
        }
      }
    },
    [normalizeBrand],
  );

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading && !refreshing) {
      const nextPage = currentPage + 1;
      fetchBrands(debouncedQuery, 'default', nextPage);
    }
  }, [
    currentPage,
    hasMore,
    loadingMore,
    loading,
    refreshing,
    debouncedQuery,
    fetchBrands,
  ]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 400);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    fetchBrands(debouncedQuery, 'default', 1);
    return () => {
      abortRef.current?.abort();
    };
  }, [debouncedQuery, fetchBrands]);

  const handleBrandPress = (brand: Brand) => {
    // Navigate to brand products page
    navigation.navigate('BrandProductsList', {
      brandId: brand.id,
      brandName: brand.name,
    });
  };

  const renderBrandCard = ({ item, index }: { item: Brand; index: number }) => {
    const isLeftColumn = index % 2 === 0;

    return (
      <TouchableOpacity
        style={[
          styles.brandCard,
          isLeftColumn ? styles.leftCard : styles.rightCard,
        ]}
        onPress={() => handleBrandPress(item)}
      >
        <Image
          source={item.imageUrl ? { uri: item.imageUrl } : fallbackBrandImage}
          style={styles.brandImage}
          resizeMode="cover"
        />
        <View style={styles.brandInfo}>
          <Text style={styles.brandName}>{item.name}</Text>
          {/* <Text style={styles.productCount}>{item.productCount}</Text> */}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search brands"
      />

      <View style={styles.content}>
        {error && (
          <TouchableOpacity
            onPress={() => fetchBrands(debouncedQuery, 'default', 1)}
            style={styles.errorBanner}
          >
            <Icon
              name="warning-outline"
              size={18}
              color={COLORS.accentRed}
              style={styles.errorIcon}
            />
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.retryText}>Tap to retry</Text>
          </TouchableOpacity>
        )}

        {loading && brands.length === 0 ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator
              size="small"
              color={COLORS.primary}
              style={styles.loaderSpinner}
            />
            <Text style={styles.loaderText}>Loading brands...</Text>
          </View>
        ) : (
          <FlatList
            data={brands}
            renderItem={renderBrandCard}
            keyExtractor={item => item.id}
            numColumns={2}
            contentContainerStyle={styles.brandList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchBrands(debouncedQuery, 'refresh', 1)}
                tintColor={COLORS.primary}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Icon name="albums-outline" size={40} color={COLORS.gray500} />
                <Text style={styles.emptyTitle}>No brands found</Text>
                <Text style={styles.emptySubtitle}>
                  Try tweaking your search query.
                </Text>
              </View>
            }
            ListFooterComponent={
              loadingMore ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator
                    size="small"
                    color={COLORS.primary}
                    style={styles.loaderSpinner}
                  />
                  <Text style={styles.loaderText}>Loading more brands...</Text>
                </View>
              ) : null
            }
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default BrandList;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray975,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: '12@s',
    paddingTop: '10@vs',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray1050,
    borderRadius: '12@s',
    paddingHorizontal: '10@s',
    paddingVertical: '6@vs',
  },
  searchIcon: {
    marginRight: '6@s',
  },
  searchInput: {
    flex: 1,
    fontSize: '13@ms',
    color: COLORS.black,
    paddingVertical: 0,
  },
  clearButton: {
    marginLeft: '6@s',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.infoSurface,
    borderRadius: '10@s',
    paddingHorizontal: '10@s',
    paddingVertical: '8@vs',
    marginTop: '10@vs',
  },
  errorIcon: {
    marginRight: '6@s',
  },
  errorText: {
    flex: 1,
    fontSize: '12@ms',
    color: COLORS.textDark,
  },
  retryText: {
    fontSize: '12@ms',
    fontWeight: '600',
    color: COLORS.primary,
  },
  loaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: '20@vs',
  },
  loaderSpinner: {
    marginRight: '8@s',
  },
  loaderText: {
    fontSize: '13@ms',
    color: COLORS.textDark,
  },

  brandList: {
    paddingHorizontal: '4@s',
    paddingTop: '16@vs',
    paddingBottom: '20@vs',
  },
  brandCard: {
    width: '45%',
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
    marginRight: '8@s',
    marginLeft: '8@s',
    marginTop: '10@s',
  },
  rightCard: {
    marginLeft: '4@s',
    marginRight: '8@s',
    marginTop: '10@s',
  },
  brandImage: {
    width: '100%',
    height: '140@vs',
    backgroundColor: COLORS.gray1025,
  },
  brandInfo: {
    padding: '4@s',
    backgroundColor: COLORS.white,
  },
  brandName: {
    fontSize: '14@ms',
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: '2@vs',
  },
  productCount: {
    fontSize: '12@ms',
    color: COLORS.black,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: '30@vs',
  },
  emptyTitle: {
    marginTop: '10@vs',
    fontSize: '15@ms',
    fontWeight: '600',
    color: COLORS.textDark,
  },
  emptySubtitle: {
    marginTop: '4@vs',
    fontSize: '12@ms',
    color: COLORS.gray500,
  },
});
