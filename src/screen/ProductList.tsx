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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  discount: string;
  image: any;
  rating: number;
  reviews: number;
  soldCount: string;
  deliveryDays: string;
  isNew?: boolean;
}

const ProductList = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const [selectedFilter, setSelectedFilter] = useState<string>('');
  const deliveryAddress = 'Rahul Sharma, #1234, Sector 6, Mumbai';

  const filters = ['Filters', 'Under 2000', 'New for you', 'Deals', '20%'];

  const products: Product[] = [
    {
      id: '1',
      name: 'Safety Helmet with Tools Set',
      description: 'Essential safety and tool kit for construction',
      price: 3998,
      originalPrice: 5998,
      discount: '22% Off',
      image: require('../assets/product1.png'), // Replace with your image
      rating: 4.6,
      reviews: 132,
      soldCount: '100+ bought past week',
      deliveryDays: 'Delivery in 3 days',
      isNew: false,
    },
    {
      id: '2',
      name: 'Cement Plaster (Mortar for Brickwork)',
      description: 'Essential safety and tool kit for construction',
      price: 3998,
      originalPrice: 5998,
      discount: '22% Off',
      image: require('../assets/product2.png'), // Replace with your image
      rating: 4.6,
      reviews: 89,
      soldCount: '100+ bought past week',
      deliveryDays: 'Delivery in 3 days',
      isNew: false,
    },
    {
      id: '3',
      name: 'Cinder Blocks / Concrete Hollow Blocks',
      description: 'Essential safety and tool kit for construction',
      price: 3998,
      originalPrice: 5998,
      discount: '22% Off',
      image: require('../assets/product3.png'), // Replace with your image
      rating: 4.6,
      reviews: 156,
      soldCount: '100+ bought past week',
      deliveryDays: 'Delivery in 3 days',
      isNew: false,
    },
    {
      id: '4',
      name: 'TMT Steel Bars (Rebar / Sariya)',
      description: 'Essential safety and tool kit for construction',
      price: 3998,
      originalPrice: 5998,
      discount: '22% Off',
      image: require('../assets/product4.png'), // Replace with your image
      rating: 4.6,
      reviews: 203,
      soldCount: '100+ bought past week',
      deliveryDays: 'Delivery in 3 days',
      isNew: false,
    },
  ];

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
        {/* Discount Badge */}
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{item.discount}</Text>
        </View>

        {/* Bestseller Badge */}
        <View style={styles.bestsellerBadge}>
          <Text style={styles.bestsellerText}>Bestseller</Text>
        </View>

        {/* Product Image */}
        <Image
          source={item.image}
          style={styles.productImage}
          resizeMode="cover"
        />

        {/* Favorite Icon */}
        <TouchableOpacity style={styles.favoriteButton}>
          <Icon name="favorite-border" size={20} color="#fff" />
        </TouchableOpacity>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.productDescription} numberOfLines={1}>
            {item.description}
          </Text>

          {/* Delivery Badge */}
          <View style={styles.deliveryBadge}>
            <Text style={styles.deliveryText}>{item.deliveryDays}</Text>
          </View>

          {/* Price Section */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>Rs {item.price}</Text>
            <Text style={styles.originalPrice}>Rs {item.originalPrice}</Text>
          </View>

          {/* Rating and Sold Count */}
          <View style={styles.ratingRow}>
            <View style={styles.ratingBadge}>
              <Icon name="star" size={12} color="#DBB005" />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
            <Text style={styles.reviewText}>({item.reviews})</Text>
          </View>

          <Text style={styles.soldText}>{item.soldCount}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <NormalHeader title="Bestsellers" />

      {/* Delivery Address Bar */}
      <View style={styles.deliveryBar}>
        <Icon name="location-on" size={16} color="#fff" />
        <Text style={styles.deliveryText} numberOfLines={1}>
          Delivery To - {deliveryAddress}
        </Text>
      </View>

      {/* Flash Sale Banner */}
      <View style={styles.flashSaleBanner}>
        <Image
          source={require('../assets/flashBanner.png')} // Replace with your banner image
          style={styles.bannerImage}
          resizeMode="cover"
        />
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
      <FlatList
        data={products}
        renderItem={renderProductCard}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.productList}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default ProductList;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  deliveryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C3452',
    paddingVertical: '10@vs',
    paddingHorizontal: '16@s',
  },
  deliveryText: {
    fontSize: '10@ms',
    color: '#fff',
    fontWeight: '400',
    marginLeft: '4@s',
  },
  flashSaleBanner: {
    height: '50@vs',
    backgroundColor: '#FF4444',
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  deliveryToButton: {
    position: 'absolute',
    right: '16@s',
    top: '50%',
    marginTop: '-15@vs',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: '12@s',
    paddingVertical: '6@vs',
    borderRadius: '6@s',
  },
  deliveryToText: {
    color: '#fff',
    fontSize: '12@ms',
    marginLeft: '4@s',
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
    backgroundColor: 'rgba(0,0,0,0.5)',
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
    padding: '10@s',
  },
  productName: {
    width: '60%',
    fontSize: '13@ms',
    fontWeight: '500',
    color: '#000',
    marginBottom: '2@vs',
  },
  productDescription: {
    fontSize: '10@ms',
    color: '#696969',
    marginBottom: '4@vs',
  },
  deliveryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#D66651',
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
    fontSize: '11@ms',
    color: '#000',
  },
});
