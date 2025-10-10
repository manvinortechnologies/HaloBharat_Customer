import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Header from '../component/Header';

const SearchScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState('');

  const recentSearches = [
    'Bricks',
    'Timber & Wood',
    'Stones',
    'Steel Pipes',
    'Tiles',
  ];

  const categories = [
    { id: '1', name: 'Paints', image: require('../assets/paints.png') },
    { id: '2', name: 'Stones', image: require('../assets/stones.png') },
    { id: '3', name: 'Steel', image: require('../assets/steel.png') },
    { id: '4', name: 'Timber', image: require('../assets/timber.png') },
    { id: '5', name: 'Tiles', image: require('../assets/tiles.png') },
    // { id: '6', name: 'Bricks', image: require('../assets/bricks.png') },
  ];

  const brands = [
    {
      id: '1',
      name: 'Ultratech Cement',
      image: require('../assets/ultratech.png'),
    },
    { id: '2', name: 'Astral Pipes', image: require('../assets/astral.png') },
    {
      id: '3',
      name: 'Heidelberg Materail',
      image: require('../assets/heidelberg.png'),
    },
  ];

  const topPicks = [
    {
      id: '1',
      name: 'Bricks',
      price: '₹1,011',
      discount: '10% OFF',
      image: require('../assets/product3.png'),
    },
    {
      id: '2',
      name: 'Pipes',
      price: '₹950',
      discount: '10% OFF',
      image: require('../assets/review2.png'),
    },
    {
      id: '3',
      name: 'Hardware',
      price: '₹1,011 ₹950',
      discount: '10% OFF',
      image: require('../assets/product4.png'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Recent Searches Section */}
        <View style={styles.section}>
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
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>CATEGORIES</Text>
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => navigation.navigate('Categories')}
            >
              <Text style={styles.seeAllText}>See all</Text>
              <Icon name="chevron-forward" size={16} color="#999" />
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
                <View style={styles.categoryImageWrapper}>
                  <Image
                    source={item.image}
                    style={styles.categoryImage}
                    resizeMode="cover"
                  />
                </View>
                <Text style={styles.categoryText}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Most Searched Brands Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>MOST SEARCHED BRANDS</Text>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>See all</Text>
              <Icon name="chevron-forward" size={16} color="#999" />
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.brandsContainer}
          >
            {brands.map((brand, index) => (
              <TouchableOpacity
                key={index}
                style={styles.brandCard}
                onPress={() => navigation.navigate('ProductCategoryList')}
              >
                <Image
                  source={brand.image}
                  style={styles.brandImage}
                  resizeMode="cover"
                />
                <Text style={styles.brandName}>{brand.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
              <Icon name="chevron-forward" size={16} color="#999" />
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.topPicksContainer}
          >
            {topPicks.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.topPickCard}
                onPress={() => navigation.navigate('ProductDetail')}
              >
                {/* Discount Badge */}
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{item.discount}</Text>
                </View>

                {/* Product Image */}
                <Image
                  source={item.image}
                  style={styles.topPickImage}
                  resizeMode="cover"
                />

                {/* Favorite Button */}
                <TouchableOpacity style={styles.favoriteButton}>
                  <Icon name="heart-outline" size={20} color="#fff" />
                </TouchableOpacity>

                {/* Product Info */}
                <View style={styles.topPickInfo}>
                  <Text style={styles.topPickName}>{item.name}</Text>
                  <Text style={styles.topPickPrice}>{item.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SearchScreen;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F7F8',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: '15@vs',
    paddingHorizontal: '16@s',
    paddingVertical: '16@vs',
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
    color: '#000',
    letterSpacing: 0.5,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '4@s',
  },
  seeAllText: {
    fontSize: '12@ms',
    color: '#999',
    fontWeight: '400',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '8@s',
  },
  tag: {
    borderWidth: 1,
    borderColor: '#999',
    paddingHorizontal: '16@s',
    paddingVertical: '8@vs',
    borderRadius: '20@s',
    backgroundColor: '#fff',
  },
  tagText: {
    fontSize: '13@ms',
    color: '#333',
    fontWeight: '400',
  },
  categoriesContainer: {
    paddingVertical: '4@vs',
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: '16@s',
    width: '70@s',
  },
  categoryImageWrapper: {
    width: '80@s',
    height: '80@s',
    borderRadius: '40@s',
    overflow: 'hidden',
    marginBottom: '2@vs',
    backgroundColor: '#F5F5F5',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryText: {
    fontSize: '12@ms',
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  brandsContainer: {
    paddingVertical: '4@vs',
  },
  brandCard: {
    width: '110@s',
    height: '50@s',
    borderRadius: '12@s',
    marginRight: '12@s',
    overflow: 'hidden',
    position: 'relative',
  },
  brandImage: {
    width: '100%',
    height: '100%',
  },
  brandName: {
    position: 'absolute',
    bottom: '8@vs',
    left: '8@s',
    fontSize: '10@ms',
    fontWeight: '600',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  topPicksContainer: {
    paddingVertical: '4@vs',
  },
  topPickCard: {
    width: '140@s',
    borderRadius: '20@s',
    marginRight: '12@s',
    backgroundColor: '#fff',
  },
  discountBadge: {
    position: 'absolute',
    top: '8@vs',
    backgroundColor: '#1C3452',
    paddingHorizontal: '8@s',
    paddingVertical: '4@vs',
    borderRadius: '4@s',
    zIndex: 2,
  },
  discountText: {
    fontSize: '11@ms',
    fontWeight: '600',
    color: '#fff',
  },
  topPickImage: {
    width: '100%',
    height: '140@vs',
    backgroundColor: '#F5F5F5',
    resizeMode: 'cover',
    borderRadius: '20@s',
  },
  favoriteButton: {
    position: 'absolute',
    top: '100@vs',
    right: '8@s',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
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
    color: '#fff',
    marginBottom: '4@vs',
  },
  topPickPrice: {
    fontSize: '13@ms',
    color: '#fff',
    fontWeight: '500',
  },
});
