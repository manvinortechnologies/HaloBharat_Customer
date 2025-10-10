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
import { ScaledSheet } from 'react-native-size-matters';

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
        <Image source={item.image} style={styles.image} resizeMode="cover" />

        {item.discount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{item.discount}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.heartIcon}>
          <Icon name="heart-outline" size={16} color="#fff" />
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
    backgroundColor: '#fff',
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
    height: 110,
    position: 'relative',
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
    backgroundColor: '#1C3452',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: '#fff',
    fontSize: '10@ms',
    fontWeight: '600',
  },
  heartIcon: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.4)',
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
    color: '#fff',
    textDecorationLine: 'line-through',
    marginRight: 5,
  },
  discountedPrice: {
    fontSize: '12@ms',
    color: '#fff',
    fontWeight: '700',
  },
  detailsContainer: {
    paddingHorizontal: '8@s',
    paddingVertical: '6@vs',
    backgroundColor: '#F0F1F3',
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    color: '#000',
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
    color: '#1E2A4A',
    fontSize: '12@ms',
    fontWeight: '600',
    marginTop: 2,
  },
});
