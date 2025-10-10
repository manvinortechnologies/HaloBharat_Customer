import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import Header from '../component/Header';
import Icon from 'react-native-vector-icons/Ionicons';
import Vendors from '../component/Vendors';
import { useNavigation } from '@react-navigation/native';

// Use regular require instead of reanimated carousel for now
// Alternatively, we'll create a simple custom carousel

const { width: screenWidth } = Dimensions.get('window');

const categories = [
  { id: '1', name: 'Paints', image: require('../assets/paints.png') },
  { id: '2', name: 'Stones', image: require('../assets/stones.png') },
  { id: '3', name: 'Steel', image: require('../assets/steel.png') },
  { id: '4', name: 'Timber', image: require('../assets/timber.png') },
  { id: '5', name: 'Tiles', image: require('../assets/tiles.png') },
  // { id: '6', name: 'Bricks', image: require('../assets/bricks.png') },
];

const topBrands = [
  {
    id: '1',
    name: 'UltraTech Cement',
    image: require('../assets/ultratech.png'),
    offers: 220,
  },
  {
    id: '2',
    name: 'Astral Pipes',
    image: require('../assets/astral.png'),
    offers: 220,
  },
  {
    id: '3',
    name: 'Heidelberg Materials',
    image: require('../assets/heidelberg.png'),
    offers: 220,
  },
];

const banners = [
  require('../assets/banner1.png'),
  require('../assets/notificationImg1.png'),
];

const bestsellers = [
  {
    id: '1',
    name: 'Screw Assortment Box + Fastener Set',
    originalPrice: 1011,
    discountedPrice: 950,
    image: require('../assets/product1.png'),
  },
  {
    id: '2',
    name: '5 kg cement + Steel Rods',
    originalPrice: 1011,
    discountedPrice: 950,
    image: require('../assets/product2.png'),
  },
  {
    id: '3',
    name: 'Pipes & Fitting (GI pipes, M5)',
    originalPrice: 1011,
    discountedPrice: 950,
    image: require('../assets/product3.png'),
  },
];

const vendors = [
  {
    id: '1',
    name: 'Connestone',
    rating: 4.6,
    reviews: 123,
    pastWeekBought: 100,
  },
  {
    id: '2',
    name: 'Handyman',
    rating: 4.6,
    reviews: 123,
    pastWeekBought: 100,
  },
  {
    id: '3',
    name: 'Bricks',
    rating: 4.6,
    reviews: 123,
    pastWeekBought: 100,
  },
];

// Simple custom carousel component
const SimpleCarousel = ({ data }: { data: any[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
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
            <Image source={banner} style={styles.bannerImage} />
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

const Home = () => {
  const navigation = useNavigation<any>();
  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={() => navigation.navigate('Categories')}
          >
            <Text style={styles.seeAllText}>See all</Text>
            <Icon name="chevron-forward" size={12} />
          </TouchableOpacity>
        </View>
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
              <Image source={item.image} style={styles.categoryImage} />
              <Text style={styles.categoryText}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />

        {/* Banner Carousel */}
        <SimpleCarousel data={banners} />

        {/* Top Brands */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Brands</Text>
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={() => navigation.navigate('BrandList')}
          >
            <Text style={styles.seeAllText}>See all</Text>
            <Icon name="chevron-forward" size={12} />
          </TouchableOpacity>
        </View>
        <FlatList
          data={topBrands}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.brandsContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.brandCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('ProductList')}
            >
              <Image source={item.image} style={styles.brandImage} />

              {/* Offer badge */}
              <View style={styles.offerBadge}>
                <Text style={styles.offerText}>{item.offers} Offers</Text>
              </View>

              {/* Brand name */}
              <View style={styles.brandNameContainer}>
                <Text style={styles.brandName}>{item.name}</Text>
              </View>
            </TouchableOpacity>
          )}
        />

        {/* BESTSELLERS Section */}
        {/* Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>BESTSELLERS</Text>
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={() => navigation.navigate('ProductList')}
          >
            <Text style={styles.seeAllText}>See all</Text>
            <Icon name="chevron-forward" size={14} color="#858383" />
          </TouchableOpacity>
        </View>

        {/* Product List */}
        <FlatList
          data={bestsellers}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.productsContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.productCard}
              onPress={() => navigation.navigate('ProductDetail')}
            >
              <View style={styles.imageContainer}>
                <Image source={item.image} style={styles.productImage} />
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>10% Off</Text>
                </View>
                <TouchableOpacity style={styles.heartIcon}>
                  <Icon name="heart-outline" size={18} color="#fff" />
                </TouchableOpacity>
                <View style={styles.priceContainer}>
                  <Text style={styles.originalPrice}>
                    ₹{item.originalPrice}
                  </Text>
                  <Text style={styles.discountedPrice}>
                    ₹{item.discountedPrice}
                  </Text>
                </View>
              </View>

              <View style={styles.detailsContainer}>
                <Text style={styles.productName}>{item.name}</Text>
              </View>
            </TouchableOpacity>
          )}
        />

        {/* SHOP BY VENDOR Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>SHOP BY VENDOR</Text>
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={() => navigation.navigate('VendorList')}
          >
            <Text style={styles.seeAllText}>See all</Text>
            <Icon name="chevron-forward" size={12} />
          </TouchableOpacity>
        </View>

        {/* {vendors.map(vendor => (
          <TouchableOpacity key={vendor.id} style={styles.vendorCard}>
            <View style={styles.vendorInfo}>
              <Text style={styles.vendorName}>{vendor.name}</Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.rating}>
                  ⭐ {vendor.rating} ({vendor.reviews})
                </Text>
              </View>
              <Text style={styles.pastWeek}>
                {vendor.pastWeekBought}+ bought past week
              </Text>
            </View>
            <TouchableOpacity style={styles.visitStoreButton}>
              <Text style={styles.visitStoreText}>Visit store</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))} */}
        <Vendors />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F7F8',
  },
  categoriesContainer: {
    paddingHorizontal: '10@s',
    paddingVertical: '5@vs',
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: '5@s',
  },
  categoryImage: {
    width: '80@s',
    height: '60@s',
    borderRadius: '30@s',
    marginBottom: '2@vs',
  },
  categoryText: {
    fontSize: '12@ms',
    fontWeight: '500',
    textAlign: 'center',
  },
  carouselContainer: {
    position: 'relative',
  },
  bannerWrapper: {
    width: screenWidth,
    alignItems: 'center',
  },
  bannerImage: {
    width: screenWidth - 20,
    height: '180@vs',
    borderRadius: '10@s',
    resizeMode: 'contain',
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
    backgroundColor: '#ccc',
    marginHorizontal: '3@s',
  },
  activeIndicator: {
    backgroundColor: '#000',
  },
  sectionTitle: {
    fontSize: '18@ms',
    fontWeight: '700',
    marginVertical: '5@vs',
    paddingHorizontal: '5@s',
  },
  brandsContainer: {
    paddingHorizontal: '10@s',
    paddingVertical: '5@vs',
  },
  brandCard: {
    width: '140@s',
    height: '140@vs',
    marginRight: '10@s',
    borderRadius: '12@s',
    overflow: 'hidden', // ensures image and overlay stay within rounded corners
  },
  brandImage: {
    width: '100%',
    height: '100%',
    borderRadius: '12@s',
  },
  offerBadge: {
    position: 'absolute',
    top: '8@vs',
    left: '1@s',
    backgroundColor: '#1E2A4A',
    borderRadius: '2@s',
    paddingVertical: '3@vs',
    paddingHorizontal: '8@s',
  },
  offerText: {
    color: '#fff',
    fontSize: '10@ms',
    fontWeight: '500',
  },
  brandNameContainer: {
    position: 'absolute',
    bottom: '8@vs',
    left: '8@s',
  },
  brandName: {
    color: '#fff',
    fontSize: '13@ms',
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: '5@vs',
    paddingHorizontal: '8@s',
  },
  seeAllButton: {
    flexDirection: 'row',
    gap: '2@s',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: '12@ms',
    color: '#858383',
    fontWeight: '400',
  },
  productsContainer: {
    paddingHorizontal: '10@s',
    paddingVertical: '10@vs',
    backgroundColor: '#fff',
  },
  productCard: {
    width: 150,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginRight: 15,
    overflow: 'hidden',
    elevation: 3,
    marginBottom: '10@vs',
  },
  imageContainer: {
    position: 'relative',
    height: 110,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  discountBadge: {
    position: 'absolute',
    top: 6,
    backgroundColor: '#1C3452',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  heartIcon: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 4,
    borderRadius: 50,
  },
  detailsContainer: {
    paddingHorizontal: '8@s',
    paddingVertical: '4@vs',
    backgroundColor: '#F0F1F3',
  },
  priceContainer: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  originalPrice: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
    textDecorationLine: 'line-through',
    marginRight: 5,
  },
  discountedPrice: {
    fontSize: 13,
    fontWeight: '900',
    color: '#fff',
  },
  productName: {
    fontSize: 12,
    fontWeight: '500',

    color: '#000',
  },
  vendorCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: '10@s',
    padding: '15@s',
    marginHorizontal: '10@s',
    marginBottom: '10@vs',
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    fontSize: '16@ms',
    fontWeight: '700',
    marginBottom: '4@vs',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '2@vs',
  },
  rating: {
    fontSize: '12@ms',
    color: '#666',
  },
  pastWeek: {
    fontSize: '11@ms',
    color: '#666',
  },
  visitStoreButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: '15@s',
    paddingVertical: '8@vs',
    borderRadius: '6@s',
  },
  visitStoreText: {
    color: '#fff',
    fontSize: '12@ms',
    fontWeight: '600',
  },
});
