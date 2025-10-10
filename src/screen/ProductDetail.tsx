import React from 'react';
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
import LinearGradient from 'react-native-linear-gradient';
import Ion from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/Ionicons';
import { ScaledSheet } from 'react-native-size-matters';
import NormalHeader from '../component/NormalHeader';
import ProductCard from '../component/Product';

const { width } = Dimensions.get('window');

const images = [
  require('../assets/product1.png'),
  require('../assets/product2.png'),
  require('../assets/product3.png'),
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

const reviews = [
  {
    id: '1',
    name: 'Savir Kapoor',
    rating: 4.6,
    comment: 'Amazing quality and delivered on time',
    images: [
      require('../assets/review1.png'),
      require('../assets/review2.png'),
    ],
  },
  {
    id: '2',
    name: 'Arjun Sharma',
    rating: 5,
    comment:
      'Excellent quality blocks, very uniform in size and easy to install. Highly recommended for big projects.',
    images: [
      require('../assets/review1.png'),
      require('../assets/review2.png'),
    ],
  },
];

const recommended = [
  {
    id: '1',
    title: 'Planks / Battens for Renovation',
    image: require('../assets/product1.png'),
  },
  {
    id: '2',
    title: 'GI (Galvanized Iron) Pipes / Steel Pipes',
    image: require('../assets/product2.png'),
    offer: '22% Off',
  },
];

const ProductDetail = ({ navigation }: any) => {
  const deliveryAddress = 'Rahul Sharma, #1234, Sector 6, Mumbai';
  return (
    <SafeAreaView style={styles.container}>
      <NormalHeader title="Product Details" />
      {/* Delivery Address Bar */}
      <View style={styles.deliveryBar}>
        <Ion name="location-on" size={16} color="#fff" />
        <Text style={styles.deliveryHeaderText} numberOfLines={1}>
          Delivery To - {deliveryAddress}
        </Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image Carousel */}
        <View style={styles.imageContainer}>
          <FlatList
            data={images}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <Image source={item} style={[styles.productImage, { width }]} />
            )}
          />

          {/* Left Badges */}
          <View style={styles.badgeContainer}>
            <View style={[styles.badge, { backgroundColor: '#9E7946' }]}>
              <Text style={styles.badgeText}>Bestsellers</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: '#1E2A4A' }]}>
              <Text style={styles.badgeText}>22% Off</Text>
            </View>
          </View>

          {/* Right Bottom Icons */}
          <View style={styles.iconContainer}>
            <TouchableOpacity style={styles.iconButton}>
              <Icon name="heart-outline" size={18} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Icon name="share-social-outline" size={18} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.productName}>
              Cinder Blocks / Concrete Hollow Blocks
            </Text>
            <View>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Text style={styles.discountedPrice}>Rs3998</Text>
                <Text style={styles.originalPrice}>Rs 5998</Text>
              </View>
              <View style={styles.saveBox}>
                <Text style={styles.saveText}>Save Rs 1998</Text>
              </View>
            </View>
          </View>

          <Text style={styles.descText}>
            Durable and high-strength concrete hollow blocks used for wall
            construction, partitions, and foundation work. Designed with hollow
            cavities to reduce weight, improve insulation, and allow easy
            handling. Ideal for both residential and commercial projects.
          </Text>

          {/* Rating & Cashback */}
          <View style={styles.ratingRow}>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={14} color="#FFD700" />
              <Text style={styles.ratingText}>4.6 (123)</Text>
            </View>

            <LinearGradient
              colors={['#9E794600', '#9ED2FF']}
              style={styles.cashbackContainer}
            >
              <Text style={styles.cashbackText}>
                Buy this and get 10% cashback on another purchase
              </Text>
            </LinearGradient>
          </View>
          <Text style={styles.salesText}>100+ bought past week</Text>

          {/* Brand Info */}
          <View style={styles.brandRow}>
            <Image
              source={require('../assets/vendor1.png')}
              style={styles.brandLogo}
            />
            <Text style={styles.brandName}>Cemex VCT Stone</Text>
          </View>

          {/* Select Pack */}
          <Text style={styles.sectionTitle}>Select Pack</Text>
          <View style={styles.selectRow}>
            <TouchableOpacity
              style={[styles.packCard, { backgroundColor: '#E6EEFA' }]}
            >
              <Text style={styles.packTitle}>Pack of 2</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Text style={styles.packPrice}>Rs 5998</Text>
                <Text style={styles.packOriginal}>Rs 9998</Text>
              </View>
              <Text style={styles.packTax}>Inc of taxes</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.packCard}>
              <Text style={styles.packTitle}>Pack of 3</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Text style={styles.packPrice}>Rs 9998</Text>
                <Text style={styles.packOriginal}>Rs 12998</Text>
              </View>
              <Text style={styles.packTax}>Inc of taxes</Text>
            </TouchableOpacity>
          </View>

          {/* Key Features */}
          <Text style={styles.sectionTitle}>Key Features</Text>
          <View style={styles.featuresContainer}>
            <Text style={styles.featureText}>
              Made from premium-grade cement and aggregates
            </Text>
            <Text style={styles.featureText}>
              Uniform size and shape for easy construction
            </Text>
            <Text style={styles.featureText}>
              Provides thermal and sound insulation
            </Text>
            <Text style={styles.featureText}>Strong load-bearing capacity</Text>
            <Text style={styles.featureText}>
              Available in multiple sizes (4", 6", 8")
            </Text>
          </View>

          {/* Specification Buttons */}
          <TouchableOpacity style={styles.specButton}>
            <Text style={styles.specText}>Material</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.specButton}>
            <Text style={styles.specText}>Block Type</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.specButton}>
            <Text style={styles.specText}>Density</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.specButton}>
            <Text style={styles.specText}>Dimensions</Text>
          </TouchableOpacity>
        </View>

        {/* BestSellers Product list */}
        <View style={{ marginTop: 20 }}>
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

          <FlatList
            data={bestsellers}
            horizontal
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <ProductCard
                item={item}
                variant="horizontal"
                onPress={() =>
                  navigation.navigate('ProductDetail', { product: item })
                }
              />
            )}
            contentContainerStyle={{ paddingVertical: 10, marginLeft: 10 }}
          />
        </View>

        {/* Reviews Section */}
        <View style={{ marginTop: 30 }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ratings & Reviews</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('RatingReview')}
            >
              <Text style={styles.seeAllText}>View all 123</Text>
            </TouchableOpacity>
          </View>

          {reviews.map(item => (
            <View key={item.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{item.name[0]}</Text>
                </View>
                <View style={{ flex: 1, flexDirection: 'row', gap: 10 }}>
                  <Text style={styles.reviewName}>{item.name}</Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginTop: 2,
                    }}
                  >
                    <Icon name="star" size={14} color="#FFD700" />
                    <Text style={styles.reviewRating}>{item.rating}</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.reviewComment}>{item.comment}</Text>

              <View style={styles.reviewImagesRow}>
                {item.images.map((img, index) => (
                  <Image key={index} source={img} style={styles.reviewImage} />
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* You May Also Like Section */}
        <View style={{ marginTop: 5 }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>YOU MAY ALSO LIKE</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={recommended}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.recommendCard}>
                <Image source={item.image} style={styles.recommendImage} />
                {item.offer && (
                  <View style={styles.offerBadge}>
                    <Text style={styles.offerText}>{item.offer}</Text>
                  </View>
                )}
                <Text style={styles.recommendTitle}>{item.title}</Text>
              </View>
            )}
            contentContainerStyle={{ paddingVertical: 10, marginLeft: 10 }}
          />
        </View>
      </ScrollView>

      {/* Bottom Fixed Buttons */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.addToCartButton}>
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
        <View style={styles.deliveryBox}>
          <Text style={styles.deliveryText}>Delivery in 3 days</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ProductDetail;

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
  deliveryHeaderText: {
    fontSize: '10@ms',
    color: '#fff',
    fontWeight: '400',
    marginLeft: '4@s',
  },
  imageContainer: {
    padding: '6@s',
    height: '200@vs',
    position: 'relative',
    marginTop: '10@vs',
    backgroundColor: '#F1F7F8',
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: '20@s',
    resizeMode: 'cover',
  },
  badgeContainer: {
    position: 'absolute',
    top: '10@vs',
    left: '10@s',
    gap: '5@vs',
  },
  badge: {
    paddingHorizontal: '8@s',
    paddingVertical: '3@vs',
    borderRadius: '5@s',
  },
  badgeText: {
    color: '#fff',
    fontSize: '10@ms',
    fontWeight: '600',
  },
  iconContainer: {
    position: 'absolute',
    right: '10@s',
    bottom: '10@vs',
    gap: '8@s',
  },
  iconButton: {
    backgroundColor: '#fff',
    padding: '6@s',
    borderRadius: '20@s',
    elevation: 2,
  },
  infoContainer: {
    padding: '15@s',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: '10@vs',
  },
  productName: {
    width: '50%',
    fontSize: '14@ms',
    fontWeight: '700',
    color: '#000',
    marginRight: '10@s',
  },
  discountedPrice: {
    color: '#000',
    fontSize: '14@ms',
    fontWeight: '700',
  },
  originalPrice: {
    color: '#696969',
    fontSize: '11@ms',
    textDecorationLine: 'line-through',
  },
  saveBox: {
    width: '80%',
    backgroundColor: '#1E2A4A',
    padding: '4@s',
    borderRadius: '5@s',
  },
  saveText: {
    color: '#fff',
    fontSize: '10@ms',
    textAlign: 'center',
  },
  descText: {
    fontSize: '12@ms',
    color: '#444',
    marginBottom: '12@vs',
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2@vs',
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  ratingText: {
    fontSize: '12@ms',
    fontWeight: '500',
    color: '#000',
  },
  salesText: {
    fontSize: '9@ms',
    color: '#000',
    marginBottom: '8@vs',
  },
  cashbackContainer: {
    width: '68%',
    paddingHorizontal: '8@s',
    paddingVertical: '8@vs',
    borderRadius: '6@s',
    marginLeft: '8@s',
  },
  cashbackText: {
    fontSize: '9@ms',
    color: '#000',
    fontWeight: '500',
    textAlign: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: '8@vs',
  },
  brandLogo: {
    width: '30@s',
    height: '30@s',
    borderRadius: '15@s',
    resizeMode: 'cover',
    marginRight: '6@s',
  },
  brandName: {
    fontSize: '12@ms',
    fontWeight: '500',
    color: '#000',
  },
  sectionTitle: {
    fontSize: '13@ms',
    fontWeight: '700',
    marginTop: '15@vs',
    color: '#000',
  },
  selectRow: { flexDirection: 'row', gap: '10@s', marginTop: '10@vs' },
  packCard: {
    width: '35%',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: '8@s',
    padding: '8@s',
  },
  packTitle: { fontSize: '11@ms', fontWeight: '600', color: '#000' },
  packPrice: {
    fontSize: '13@ms',
    fontWeight: '700',
    color: '#000',
  },
  packOriginal: {
    fontSize: '11@ms',
    color: '#696969',
    textDecorationLine: 'line-through',
  },
  packTax: {
    fontSize: '10@ms',
    color: '#FF0000',
  },
  featuresContainer: {
    marginTop: '10@vs',
  },
  featureText: {
    fontSize: '11@ms',
    color: '#444',
    marginBottom: '4@vs',
  },
  specButton: {
    backgroundColor: '#F1F7F8',
    borderRadius: '6@s',
    padding: '10@s',
    marginTop: '8@vs',
  },
  specText: { fontSize: '12@ms', color: '#000', fontWeight: '500' },
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
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: '10@ms',
    padding: '10@ms',
    marginVertical: '8@ms',
    marginHorizontal: '10@ms',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '6@ms',
  },
  avatarCircle: {
    backgroundColor: '#1C3452',
    width: '36@ms',
    height: '36@ms',
    borderRadius: '18@ms',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '10@ms',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '400',
    fontSize: '14@ms',
  },
  reviewName: {
    fontWeight: '600',
    fontSize: '16@ms',
    color: '#000',
  },
  reviewRating: {
    fontSize: '14@ms',
    color: '#000',
    marginLeft: '4@ms',
  },
  reviewComment: {
    fontSize: '12@ms',
    color: '#696969',
    marginVertical: '2@ms',
    marginLeft: '10@ms',
  },
  reviewImagesRow: {
    flexDirection: 'row',
    marginTop: '6@ms',
    gap: '8@ms',
    marginLeft: '10@ms',
  },
  reviewImage: {
    width: '60@ms',
    height: '60@ms',
    borderRadius: '8@ms',
  },
  recommendCard: {
    width: width * 0.45,
    backgroundColor: '#fff',
    borderRadius: '12@ms',
    marginHorizontal: '6@ms',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  recommendImage: {
    width: '100%',
    height: '120@ms',
    borderTopLeftRadius: '12@ms',
    borderTopRightRadius: '12@ms',
  },
  offerBadge: {
    position: 'absolute',
    top: '6@ms',
    right: '6@ms',
    backgroundColor: '#1E2A4A',
    paddingHorizontal: '6@ms',
    paddingVertical: '2@ms',
    borderRadius: '6@ms',
  },
  offerText: {
    color: '#fff',
    fontSize: '10@ms',
  },
  recommendTitle: {
    fontSize: '12@ms',
    fontWeight: '600',
    color: '#000',
    padding: '8@ms',
  },

  bottomContainer: {
    flexDirection: 'column',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    paddingVertical: '10@vs',
    alignItems: 'center',
  },
  addToCartButton: {
    backgroundColor: '#1E2A4A',
    borderRadius: '8@s',
    paddingVertical: '10@vs',
    paddingHorizontal: '100@s',
    marginBottom: '5@vs',
  },
  addToCartText: {
    color: '#fff',
    fontSize: '14@ms',
    fontWeight: '700',
  },
  deliveryBox: {
    backgroundColor: '#F77F6F',
    paddingHorizontal: '20@s',
    paddingVertical: '4@vs',
  },
  deliveryText: {
    color: '#fff',
    fontSize: '11@ms',
    fontWeight: '600',
  },
});
