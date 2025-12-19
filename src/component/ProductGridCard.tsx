import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { s, ScaledSheet } from 'react-native-size-matters';
import COLORS from '../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { removeWishlistItem, toggleWishlistItem } from '../api/wishlist';
import { getWishlist } from '../api/wishlist';

export interface ProductGridCardItem {
  id: string;
  name: string;
  description?: string | null;
  price: number | null;
  originalPrice: number | null;
  discount?: string | null;
  image?: string | null;
  rating?: number | null;
  reviews?: number | null;
  soldCount?: string | null;
  deliveryDays?: string | null;
  isBestseller?: boolean;
}

interface ProductGridCardProps {
  item: ProductGridCardItem;
  index: number;
  onPress?: () => void;
  onFavoritePress?: () => void;
  fallbackImage?: any;
  style?: StyleProp<ViewStyle>;
  isLeftColumn?: boolean;
}
type RootStackParamList = {
  ProductDetail: { product: ProductGridCardItem };
};
const ProductGridCard: React.FC<ProductGridCardProps> = ({
  item,
  style,
  isLeftColumn,
}) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [wishlistMap, setWishlistMap] = useState<Map<string, string | number>>(
    new Map(),
  );
  const [togglingWishlist, setTogglingWishlist] = useState<Set<string>>(
    new Set(),
  );
  const columnStyle =
    isLeftColumn !== undefined
      ? isLeftColumn
        ? styles.leftCard
        : styles.rightCard
      : {};

  const handleOnPress = () => {
    navigation.navigate('ProductDetail', { product: item });
  };

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

  return (
    <TouchableOpacity
      style={[styles.productCard, columnStyle, style]}
      onPress={handleOnPress}
      activeOpacity={0.8}
    >
      {/* Discount Badge */}
      {item.discount ? (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{item.discount}</Text>
        </View>
      ) : null}

      {/* Bestseller Badge */}
      {item.isBestseller ? (
        <View style={styles.bestsellerBadge}>
          <Text style={styles.bestsellerText}>Bestsellers</Text>
        </View>
      ) : null}

      {/* Product Image */}
      <View style={styles.productImageContainer}>
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <Ionicons name="image-outline" size={s(80)} color={COLORS.primary} />
        )}
      </View>

      {/* Favorite Icon */}
      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={() => handleToggleWishlist(item.id)}
        disabled={togglingWishlist.has(item.id)}
        activeOpacity={0.7}
      >
        {togglingWishlist.has(item.id) ? (
          <ActivityIndicator size="small" color={COLORS.white} />
        ) : (
          <Ionicons
            name={wishlistMap.has(item.id) ? 'heart' : 'heart-outline'}
            size={18}
            color={wishlistMap.has(item.id) ? COLORS.accentRuby : COLORS.white}
          />
        )}
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
        {item?.deliveryDays ? (
          <View style={styles.deliveryBadge}>
            <Text style={styles.deliveryText}>
              Delivery in {item?.deliveryDays} days
            </Text>
          </View>
        ) : null}

        {/* Price Section */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>
            {item.price != null ? `Rs ${item.price}` : 'Price on request'}
          </Text>
          {item.originalPrice && item.originalPrice > 0 ? (
            <Text style={styles.originalPrice}>Rs {item.originalPrice}</Text>
          ) : null}
        </View>

        {/* Rating and Reviews */}
        {item.rating != null && item.rating > 0 ? (
          <View style={styles.ratingRow}>
            <View style={styles.ratingBadge}>
              <Icon name="star" size={12} color={COLORS.accentGold} />
              <Text style={styles.ratingText}>
                {typeof item.rating === 'number'
                  ? item.rating.toFixed(1)
                  : item.rating}
              </Text>
            </View>
            {item.reviews != null ? (
              <Text style={styles.reviewText}>({item.reviews})</Text>
            ) : null}
          </View>
        ) : null}

        {/* Sold Count */}
        {item.soldCount ? (
          <Text style={styles.soldText}>{item.soldCount}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

export default ProductGridCard;

const styles = ScaledSheet.create({
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
    marginLeft: '2@s',
  },
  rightCard: {
    marginLeft: '4@s',
    // marginRight: '8@s',
  },
  discountBadge: {
    position: 'absolute',
    top: '8@vs',
    left: '8@s',
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
    left: '8@s',
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
  productImageContainer: {
    width: '100%',
    height: '140@s',
    backgroundColor: COLORS.gray1025,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.gray1025,
  },
  favoriteButton: {
    position: 'absolute',
    top: '110@s',
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
    borderRadius: '4@s',
    marginBottom: '4@vs',
  },
  deliveryText: {
    fontSize: '10@ms',
    color: COLORS.white,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '2@vs',
  },
  price: {
    fontSize: '14@ms',
    fontWeight: '600',
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
});
