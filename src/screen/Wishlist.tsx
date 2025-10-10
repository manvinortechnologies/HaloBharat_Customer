import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/MaterialIcons';
import NormalHeader from '../component/NormalHeader';

interface WishlistProduct {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  discount: string;
  image: any;
  rating: number;
  reviews: number;
  soldCount: string;
  deliveryDays: string;
  isBestseller: boolean;
}

const Wishlist = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>('');
  const [wishlistItems, setWishlistItems] = useState<WishlistProduct[]>([
    {
      id: '1',
      name: 'Cinder Blocks / Concrete Hollow Blocks',
      price: 3998,
      originalPrice: 5998,
      discount: '22% Off',
      image: require('../assets/product1.png'),
      rating: 4.6,
      reviews: 123,
      soldCount: '100+ bought past week',
      deliveryDays: 'Delivery in 3 days',
      isBestseller: true,
    },
    {
      id: '2',
      name: 'Cinder Blocks / Concrete Hollow Blocks',
      price: 3998,
      originalPrice: 5998,
      discount: '22% Off',
      image: require('../assets/product2.png'),
      rating: 4.6,
      reviews: 123,
      soldCount: '100+ bought past week',
      deliveryDays: 'Best Seller',
      isBestseller: true,
    },
    {
      id: '3',
      name: 'Cinder Blocks / Concrete Hollow Blocks',
      price: 3998,
      originalPrice: 5998,
      discount: '22% Off',
      image: require('../assets/product3.png'),
      rating: 4.6,
      reviews: 123,
      soldCount: '100+ bought past week',
      deliveryDays: 'Delivery in 3 days',
      isBestseller: false,
    },
    {
      id: '4',
      name: 'Cinder Blocks / Concrete Hollow Blocks',
      price: 3998,
      originalPrice: 5998,
      discount: '22% Off',
      image: require('../assets/product4.png'),
      rating: 4.6,
      reviews: 123,
      soldCount: '100+ bought past week',
      deliveryDays: 'Best Seller',
      isBestseller: false,
    },
  ]);

  const deliveryAddress = 'Rahul Sharma, #1234, Sector 6, Mumbai';
  const filters = ['Filters', 'Under 2000', 'New for you', 'Deals', '20%'];

  const toggleWishlist = (productId: string) => {
    setWishlistItems(prev => prev.filter(item => item.id !== productId));
  };

  const handleAddToCart = (product: WishlistProduct) => {
    console.log('Add to cart:', product.name);
    // Implement add to cart logic
  };

  const renderProductCard = ({
    item,
    index,
  }: {
    item: WishlistProduct;
    index: number;
  }) => {
    const isLeftColumn = index % 2 === 0;

    return (
      <TouchableOpacity
        style={[
          styles.productCard,
          isLeftColumn ? styles.leftCard : styles.rightCard,
        ]}
      >
        {/* Discount Badge */}
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{item.discount}</Text>
        </View>

        {/* Bestseller Badge */}
        {item.isBestseller && (
          <View style={styles.bestsellerBadge}>
            <Text style={styles.bestsellerText}>Bestseller</Text>
          </View>
        )}

        {/* Product Image */}
        <Image
          source={item.image}
          style={styles.productImage}
          resizeMode="cover"
        />

        {/* Favorite Icon (Filled) */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleWishlist(item.id)}
        >
          <Icon name="favorite" size={18} color="#fff" />
        </TouchableOpacity>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <Text style={styles.productName} numberOfLines={2}>
              {item.name}
            </Text>
            {/* Rating Section */}
            <View style={styles.ratingRow}>
              <View style={styles.ratingBadge}>
                <Icon name="star" size={12} color="#DBB005" />
                <Text style={styles.ratingText}>{item.rating}</Text>
              </View>
              <Text style={styles.reviewText}>({item.reviews})</Text>
            </View>
          </View>
          <Text style={styles.soldText}>{item.soldCount}</Text>

          {/* Price Section */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>Rs {item.price}</Text>
            <Text style={styles.originalPrice}>Rs {item.originalPrice}</Text>
          </View>

          {/* Delivery/Bestseller Badge */}
          <View style={styles.deliveryBadge}>
            <Text style={styles.deliveryText}>{item.deliveryDays}</Text>
          </View>

          {/* Add to Cart Button */}
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={() => handleAddToCart(item)}
          >
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <NormalHeader title="Wishlist" />
      {/* Delivery Address Bar */}
      <View style={styles.deliveryBar}>
        <Icon name="location-on" size={16} color="#fff" />
        <Text style={styles.deliveryText} numberOfLines={1}>
          Delivery To - {deliveryAddress}
        </Text>
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {filters.map((filter, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.filterTab,
              selectedFilter === filter && styles.filterTabActive,
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            {index === 0 && <Icon name="tune" size={18} color="#000" />}
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter && styles.filterTextActive,
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Product Grid */}
      {wishlistItems.length > 0 ? (
        <FlatList
          data={wishlistItems}
          renderItem={renderProductCard}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.productList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="favorite-border" size={80} color="#ccc" />
          <Text style={styles.emptyText}>Your wishlist is empty</Text>
          <Text style={styles.emptySubtext}>
            Add products you love to your wishlist
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Wishlist;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '16@s',
    paddingVertical: '12@vs',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: '12@s',
    padding: '4@s',
  },
  headerTitle: {
    fontSize: '18@ms',
    fontWeight: '600',
    color: '#000',
  },
  productCount: {
    fontSize: '12@ms',
    color: '#666',
    marginTop: '2@vs',
  },
  searchButton: {
    padding: '4@s',
  },
  deliveryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C3452',
    paddingVertical: '10@vs',
    paddingHorizontal: '16@s',
  },
  filterContainer: {
    backgroundColor: '#fff',
  },
  filterContent: {
    paddingHorizontal: '16@s',
    paddingVertical: '10@vs',
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: '10@s',
    paddingVertical: '4@vs',
    backgroundColor: '#fff',
    borderRadius: '4@s',
    marginRight: '6@s',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    height: '30@vs',
    marginBottom: '5@vs',
  },
  filterTabActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2C3E50',
  },
  filterText: {
    fontSize: '12@ms',
    color: '#000',
    marginLeft: '4@s',
  },
  filterTextActive: {
    color: '#1C3452',
    fontWeight: '500',
  },
  productList: {
    paddingHorizontal: '8@s',
    paddingTop: '12@vs',
    paddingBottom: '20@vs',
  },
  productCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: '12@s',
    marginBottom: '12@vs',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
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
    backgroundColor: '#1C3452',
    paddingHorizontal: '4@s',
    paddingVertical: '2@vs',
    borderRadius: '4@s',
    zIndex: 2,
  },
  discountText: {
    color: '#fff',
    fontSize: '10@ms',
    fontWeight: '400',
  },
  bestsellerBadge: {
    position: 'absolute',
    top: '30@vs',
    backgroundColor: '#9E7946',
    paddingHorizontal: '4@s',
    paddingVertical: '2@vs',
    borderRadius: '4@s',
    zIndex: 2,
  },
  bestsellerText: {
    color: '#fff',
    fontSize: '10@ms',
    fontWeight: '400',
  },
  productImage: {
    width: '100%',
    height: '160@vs',
    backgroundColor: '#F5F5F5',
  },
  favoriteButton: {
    position: 'absolute',
    top: '130@vs',
    right: '8@s',
    backgroundColor: '#696969',
    borderRadius: '20@s',
    padding: '3@s',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    zIndex: 2,
  },
  productInfo: {
    padding: '12@s',
  },
  productName: {
    width: '60%',
    fontSize: '13@ms',
    fontWeight: '500',
    color: '#000',
    marginBottom: '4@vs',
  },
  deliveryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#1C3452',
    paddingHorizontal: '4@s',
    paddingVertical: '4@vs',
    borderRadius: '4@s',
    marginBottom: '8@vs',
  },
  deliveryText: {
    fontSize: '10@ms',
    color: '#fff',
    fontWeight: '400',
    marginLeft: '4@s',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '6@vs',
  },
  price: {
    fontSize: '16@ms',
    fontWeight: '700',
    color: '#000',
    marginRight: '8@s',
  },
  originalPrice: {
    fontSize: '13@ms',
    color: '#696969',
    textDecorationLine: 'line-through',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '4@vs',
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
    color: '#000',
    fontSize: '10@ms',
    fontWeight: '600',
    marginLeft: '2@s',
  },
  reviewText: {
    fontSize: '10@ms',
    color: '#696969',
  },
  soldText: {
    fontSize: '10@ms',
    color: '#000',
    marginBottom: '4@vs',
  },
  addToCartButton: {
    width: '65%',
    backgroundColor: '#1C3452',
    paddingVertical: '6@vs',
    paddingHorizontal: '10@s',
    borderRadius: '6@s',
    alignItems: 'center',
  },
  addToCartText: {
    color: '#fff',
    fontSize: '12@ms',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '40@s',
  },
  emptyText: {
    fontSize: '18@ms',
    fontWeight: '600',
    color: '#333',
    marginTop: '20@vs',
    marginBottom: '8@vs',
  },
  emptySubtext: {
    fontSize: '14@ms',
    color: '#696969',
    textAlign: 'center',
  },
});
