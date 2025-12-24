import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { ScaledSheet, ms, mvs, s } from 'react-native-size-matters';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import COLORS from '../constants/colors';
import { getVendors } from '../api/vendors';

interface VendorItem {
  id: string;
  name: string;
  imageUrl: string | null;
  rating: number | null;
  reviews: number | null;
  subtitle: string | null;
}

const Vendors = ({
  showSearchBar = true,
  page_size = 10,
  scrollEnabled = true,
}: {
  showSearchBar?: boolean;
  page_size?: number;
  scrollEnabled?: boolean;
}) => {
  const [vendors, setVendors] = useState<VendorItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const fallbackVendorImage = useMemo(
    () => require('../assets/vendor1.png'),
    [],
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const normalizeVendor = useCallback(
    (item: any, index: number): VendorItem => {
      return {
        id: String(item?.id ?? item?.business_id ?? `vendor-${index}`),
        name: item?.name ?? item?.business_name ?? 'Vendor',
        imageUrl:
          item?.logo ??
          item?.image ??
          item?.thumbnail ??
          item?.featured_image ??
          null,
        rating: item.average_rating,
        reviews: item.reviews_count,
        subtitle: item?.description || '',
      };
    },
    [],
  );

  const fetchVendors = useCallback(
    async (mode: 'default' | 'refresh' = 'default') => {
      if (mode === 'refresh') {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      try {
        setError(null);
        const payload = await getVendors(
          debouncedQuery ? { search: debouncedQuery, page_size } : undefined,
        );
        const listSource = Array.isArray(payload?.results)
          ? payload.results
          : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
          ? payload
          : [];
        setVendors(listSource.map(normalizeVendor));
      } catch (err: any) {
        setError(err?.message || 'Unable to load vendors.');
        setVendors([]);
      } finally {
        if (mode === 'refresh') {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [debouncedQuery, normalizeVendor],
  );

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const navigation = useNavigation<any>();

  const renderVendor = ({ item }: { item: VendorItem }) => (
    <View style={styles.card}>
      <View style={styles.leftSection}>
        {item.imageUrl ? (
          <Image
            source={
              item.imageUrl ? { uri: item.imageUrl } : fallbackVendorImage
            }
            style={styles.logo}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.logo}>
            <Ionicons name="storefront" size={s(30)} color={COLORS.primary} />
          </View>
        )}
      </View>
      <View style={styles.middleSection}>
        <Text style={styles.vendorName}>{item.name}</Text>
        <View style={styles.ratingRow}>
          <FontAwesome name="star" size={ms(14)} color={COLORS.accentAmber} />
          <Text style={styles.ratingText}>
            {item.rating?.toFixed(1) ?? '--'}{' '}
            <Text style={styles.reviewText}>({item.reviews ?? 0})</Text>
          </Text>
        </View>
        <Text style={styles.subText}>{item.subtitle ?? 'Trusted vendor'}</Text>
      </View>
      <TouchableOpacity
        style={styles.visitButton}
        onPress={() =>
          navigation.navigate('VendorDetail', {
            businessId: item.id,
            businessName: item.name,
          })
        }
      >
        <Text style={styles.visitText}>Visit store</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {showSearchBar && (
        <View style={styles.searchBar}>
          <Ionicons
            name="search-outline"
            size={18}
            color={COLORS.gray500}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search vendors"
            placeholderTextColor={COLORS.gray500}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={18} color={COLORS.gray500} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {error ? (
        <TouchableOpacity
          style={styles.errorBanner}
          onPress={() => fetchVendors()}
        >
          <Ionicons name="warning-outline" size={18} color={COLORS.accentRed} />
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.retryText}>Tap to retry</Text>
        </TouchableOpacity>
      ) : null}

      {loading && vendors.length === 0 ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loaderText}>Loading vendors...</Text>
        </View>
      ) : null}

      <FlatList
        scrollEnabled={scrollEnabled}
        data={vendors}
        keyExtractor={item => item.id}
        renderItem={renderVendor}
        contentContainerStyle={{ paddingBottom: mvs(10) }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchVendors('refresh')}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          !loading && !error ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="storefront-outline"
                size={40}
                color={COLORS.gray500}
              />
              <Text style={styles.emptyTitle}>No vendors found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search terms.
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

export default Vendors;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray975,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    margin: '12@s',
    borderRadius: '12@s',
    paddingHorizontal: '12@s',
    paddingVertical: '8@vs',
    elevation: 1,
    shadowColor: COLORS.black,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },
  searchIcon: {
    marginRight: '6@s',
  },
  searchInput: {
    flex: 1,
    fontSize: '13@ms',
    color: COLORS.black,
  },
  clearButton: {
    marginLeft: '6@s',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: '10@ms',
    padding: '10@ms',
    marginHorizontal: '10@s',
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    marginTop: '10@vs',
  },
  leftSection: {
    width: '60@ms',
    height: '60@ms',
    marginRight: '12@ms',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '70@ms',
    height: '70@ms',
    justifyContent: 'center',
    alignItems: 'center',
  },
  middleSection: {
    flex: 1,
  },
  vendorName: {
    fontSize: '14@ms',
    fontWeight: '600',
    color: COLORS.black,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: '4@ms',
  },
  ratingText: {
    fontSize: '12@ms',
    color: COLORS.textSemiDark,
    marginLeft: '4@ms',
  },
  reviewText: {
    color: COLORS.textCool,
  },
  subText: {
    fontSize: '10@ms',
    color: COLORS.textAsh,
    marginTop: '3@ms',
  },
  visitButton: {
    borderRadius: '20@ms',
    paddingVertical: '6@ms',
    paddingHorizontal: '12@ms',
  },
  visitText: {
    color: COLORS.primary,
    fontSize: '10@ms',
    fontWeight: '600',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.infoSurface,
    borderRadius: '10@s',
    paddingHorizontal: '12@s',
    paddingVertical: '8@vs',
    marginHorizontal: '12@s',
    marginBottom: '8@vs',
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
    paddingVertical: '16@vs',
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
    fontSize: '15@ms',
    fontWeight: '600',
    color: COLORS.textDark,
  },
  emptySubtitle: {
    fontSize: '12@ms',
    color: COLORS.gray500,
    marginTop: '4@vs',
  },
});
