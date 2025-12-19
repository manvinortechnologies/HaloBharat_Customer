import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { s, ScaledSheet } from 'react-native-size-matters';
import COLORS from '../constants/colors';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
interface ProductCardProps {
  item: {
    id: string;
    name: string;
    image: any;
    originalPrice?: number;
    discountedPrice?: number;
    discount?: string;
  };
  onPress?: () => void;
  variant?: 'horizontal' | 'grid' | 'compact';
  style?: StyleProp<ViewStyle>;
}

const ProductCard: React.FC<ProductCardProps> = ({
  item,
  onPress,
  variant = 'horizontal',
  style,
}) => {
  const isGrid = variant === 'grid';
  const isCompact = variant === 'compact';
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.card,
        isGrid && styles.gridCard,
        isCompact && styles.compactCard,
        style,
      ]}
      activeOpacity={0.8}
    >
      {/* Image Section */}
      <View style={[styles.imageContainer, isCompact && styles.compactImage]}>
        {item.image.uri ? (
          <Image source={item.image} style={styles.image} resizeMode="cover" />
        ) : (
          <MaterialIcons name="image" size={s(60)} color={COLORS.primary} />
        )}

        {item.discount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{item.discount}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.heartIcon}>
          <Icon name="heart-outline" size={16} color={COLORS.white} />
        </TouchableOpacity>

        {!isCompact && (
          <View style={styles.priceOverlay}>
            {item.originalPrice && (
              <Text style={styles.originalPrice}>₹{item.originalPrice}</Text>
            )}
            {item.discountedPrice && (
              <Text style={styles.discountedPrice}>
                ₹{item.discountedPrice}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.detailsContainer}>
        <Text
          style={[
            styles.name,
            isCompact ? styles.nameCompact : styles.nameDefault,
          ]}
          numberOfLines={2}
        >
          {item.name}
        </Text>

        {isCompact && item.discountedPrice && (
          <Text style={styles.compactPrice}>₹{item.discountedPrice}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default ProductCard;

const styles = ScaledSheet.create({
  card: {
    width: 150,
    borderRadius: '12@s',
    backgroundColor: COLORS.white,
    marginRight: '15@s',
    overflow: 'hidden',
    elevation: 3,
  },
  gridCard: {
    width: '47%',
    marginBottom: '12@vs',
  },
  compactCard: {
    flexDirection: 'row',
    width: '100%',
    height: '70@vs',
    borderRadius: '8@s',
    overflow: 'hidden',
  },
  imageContainer: {
    height: '80@s',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactImage: {
    width: '30%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: COLORS.white,
    fontSize: '10@ms',
    fontWeight: '600',
  },
  heartIcon: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: COLORS.overlayMedium,
    padding: '4@s',
    borderRadius: 50,
  },
  priceOverlay: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  originalPrice: {
    fontSize: '11@ms',
    color: COLORS.white,
    textDecorationLine: 'line-through',
    marginRight: 5,
  },
  discountedPrice: {
    fontSize: '12@ms',
    color: COLORS.white,
    fontWeight: '700',
  },
  detailsContainer: {
    paddingHorizontal: '8@s',
    paddingVertical: '6@vs',
    backgroundColor: COLORS.gray950,
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    color: COLORS.black,
    fontWeight: '500',
  },
  nameDefault: {
    fontSize: '12@ms',
  },
  nameCompact: {
    fontSize: '11@ms',
    flex: 1,
  },
  compactPrice: {
    color: COLORS.primaryDeep,
    fontSize: '12@ms',
    fontWeight: '600',
    marginTop: 2,
  },
});
