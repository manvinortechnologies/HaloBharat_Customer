import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { ScaledSheet } from 'react-native-size-matters';
import NormalHeader from '../component/NormalHeader';
import COLORS from '../constants/colors';
import { getProductReviews } from '../api/reviews';

interface ReviewItem {
  id: string;
  name: string;
  rating: number | null;
  comment: string;
  images: string[];
}

const RatingReview = ({ route }: any) => {
  const productSnapshot = route?.params?.productSnapshot ?? {};
  const productId = route?.params?.productId ?? productSnapshot?.id ?? '1';
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const fallbackImages = useMemo(
    () => [require('../assets/review1.png'), require('../assets/review2.png')],
    [],
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const normalizeReview = useCallback(
    (item: any, index: number): ReviewItem => {
      const imageList = Array.isArray(item?.images)
        ? item.images.filter(Boolean)
        : [];
      return {
        id: String(item?.id ?? item?.review_id ?? `review-${index}`),
        name:
          item?.user?.name ??
          item?.author ??
          item?.customer_name ??
          'Anonymous User',
        rating:
          typeof item?.rating === 'number'
            ? item.rating
            : Number(item?.rating ?? 0),
        comment: item?.comment ?? item?.body ?? 'No comment provided.',
        images: imageList as string[],
      };
    },
    [],
  );

  const fetchReviews = useCallback(
    async (mode: 'default' | 'refresh' = 'default') => {
      if (!productId) {
        setError('Missing product identifier.');
        return;
      }
      if (mode === 'refresh') {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      try {
        setError(null);
        const payload = await getProductReviews(
          productId,
          debouncedQuery ? { search: debouncedQuery } : undefined,
        );
        const listSource = Array.isArray(payload?.results)
          ? payload.results
          : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
          ? payload
          : [];
        setReviews(listSource.map(normalizeReview));
      } catch (err: any) {
        setError(err?.message || 'Unable to load reviews.');
        setReviews([]);
      } finally {
        if (mode === 'refresh') {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [debouncedQuery, normalizeReview, productId],
  );

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const productName =
    productSnapshot?.name ?? 'Cinder Blocks / Concrete Hollow Blocks';
  const productVendor = productSnapshot?.vendorName ?? 'Cemex';
  const productRating = productSnapshot?.rating ?? 4.6;
  const productReviews = productSnapshot?.reviews ?? 123;
  const productSubtitle = productSnapshot?.subtitle ?? '100+ bought past week';

  const getImageSource = (img: any, idx: number) => {
    if (typeof img === 'number') {
      return img;
    }
    return { uri: img ?? undefined };
  };

  return (
    <SafeAreaView style={styles.container}>
      <NormalHeader title="Ratings & Reviews" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 90 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchReviews('refresh')}
            tintColor={COLORS.primary}
          />
        }
      >
        <View style={styles.searchBar}>
          <Icon
            name="search-outline"
            size={18}
            color={COLORS.gray500}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search reviews"
            placeholderTextColor={COLORS.gray500}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              <Icon name="close-circle" size={18} color={COLORS.gray500} />
            </TouchableOpacity>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <View style={styles.productHeader}>
            <Text style={styles.productName}>{productName}</Text>
            <View style={styles.brandRow}>
              <Image
                source={require('../assets/vendor1.png')}
                style={styles.brandLogo}
              />
              <View>
                <Text style={styles.brandText}>{productVendor}</Text>
                <Text style={styles.visitText}>Visit store</Text>
              </View>
            </View>
          </View>
          <View style={styles.ratingRow}>
            <Icon name="star" size={14} color={COLORS.accentGoldBright} />
            <Text style={styles.ratingText}>
              {productRating?.toFixed(1)} ({productReviews ?? 0})
            </Text>
          </View>
          <Text style={styles.salesText}>{productSubtitle}</Text>
        </View>

        {error ? (
          <TouchableOpacity
            style={styles.errorBanner}
            onPress={() => fetchReviews()}
          >
            <Icon name="warning-outline" size={18} color={COLORS.accentRed} />
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.retryText}>Tap to retry</Text>
          </TouchableOpacity>
        ) : null}

        {loading && reviews.length === 0 ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loaderText}>Loading reviews...</Text>
          </View>
        ) : null}

        <FlatList
          data={reviews}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>
                    {item.name?.charAt(0) ?? '?'}
                  </Text>
                </View>
                <View style={{ flex: 1, flexDirection: 'row', gap: 10 }}>
                  <Text style={styles.reviewName}>{item.name}</Text>
                  <View style={styles.reviewRatingRow}>
                    <Icon
                      name="star"
                      size={16}
                      color={COLORS.accentGoldBright}
                    />
                    <Text style={styles.reviewRating}>
                      {item.rating?.toFixed(1) ?? '--'}
                    </Text>
                  </View>
                </View>
              </View>
              <Text style={styles.reviewComment}>{item.comment}</Text>

              {item.images.length > 0 ? (
                <View style={styles.reviewImagesRow}>
                  {item.images.map((img, index) => (
                    <Image
                      key={`${item.id}-img-${index}`}
                      source={getImageSource(img, index)}
                      style={styles.reviewImage}
                    />
                  ))}
                </View>
              ) : null}
            </View>
          )}
          ListEmptyComponent={
            !loading && !error ? (
              <View style={styles.emptyState}>
                <Icon
                  name="chatbubble-ellipses-outline"
                  size={40}
                  color={COLORS.gray500}
                />
                <Text style={styles.emptyTitle}>No reviews yet</Text>
                <Text style={styles.emptySubtitle}>
                  Be the first to share your experience.
                </Text>
              </View>
            ) : null
          }
        />
      </ScrollView>

      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity style={styles.reviewButton}>
          <Text style={styles.reviewButtonText}>Write a Review</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default RatingReview;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray975,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: '16@s',
    marginTop: '12@vs',
    marginBottom: '4@vs',
    borderRadius: '12@s',
    paddingHorizontal: '12@s',
    paddingVertical: '8@vs',
    elevation: 1,
    shadowColor: COLORS.black,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
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

  productInfo: {
    padding: '15@ms',
    backgroundColor: COLORS.gray1075,
    marginVertical: '10@vs',
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productName: {
    width: '50%',
    fontSize: '14@ms',
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: '8@ms',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '6@ms',
  },
  brandLogo: {
    width: '30@ms',
    height: '30@ms',
    resizeMode: 'cover',
    borderRadius: '15@s',
    marginRight: '6@ms',
  },
  brandText: {
    fontSize: '12@ms',
    color: COLORS.black,
    fontWeight: '500',
  },
  visitText: {
    fontSize: '10@ms',
    color: COLORS.primaryDeep,
    marginLeft: '4@ms',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: '12@ms',
    color: COLORS.black,
    fontWeight: '500',
  },
  salesText: {
    fontSize: '11@ms',
    color: COLORS.black,
    marginTop: '2@ms',
  },
  reviewCard: {
    borderBottomWidth: 0.6,
    borderColor: COLORS.gray825,
    padding: '12@ms',
    backgroundColor: COLORS.white,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '2@ms',
  },
  avatarCircle: {
    width: '32@ms',
    height: '32@ms',
    borderRadius: '16@ms',
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '10@ms',
  },
  avatarText: {
    fontSize: '13@ms',
    fontWeight: '600',
    color: COLORS.white,
  },
  reviewName: {
    fontSize: '15@ms',
    fontWeight: '600',
    color: COLORS.black,
  },
  reviewRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: '2@ms',
  },
  reviewRating: {
    fontSize: '15@ms',
    color: COLORS.black,
    marginLeft: '4@ms',
  },
  reviewComment: {
    fontSize: '12@ms',
    color: COLORS.textMuted,
    marginVertical: '2@ms',
    marginLeft: '20@ms',
  },
  reviewImagesRow: {
    flexDirection: 'row',
    marginTop: '2@ms',
    gap: '8@ms',
    marginLeft: '20@ms',
  },
  reviewImage: {
    width: '60@ms',
    height: '60@ms',
    borderRadius: '8@ms',
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    padding: '12@ms',
    borderTopWidth: 0.5,
    borderColor: COLORS.gray825,
  },
  reviewButton: {
    backgroundColor: COLORS.primaryDeep,
    borderRadius: '10@ms',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: '10@ms',
    marginHorizontal: '20@s',
    marginBottom: '10@vs',
  },
  reviewButtonText: {
    color: COLORS.white,
    fontSize: '13@ms',
    fontWeight: '600',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.infoSurface,
    borderRadius: '10@s',
    marginHorizontal: '16@s',
    marginBottom: '12@vs',
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
    textAlign: 'center',
  },
});
