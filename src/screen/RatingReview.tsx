import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { ScaledSheet } from 'react-native-size-matters';
import NormalHeader from '../component/NormalHeader';

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
      'Excellent quality blocks, very uniform in size and easy to install. Saved us a lot of time on site. Strong and durable material – highly recommended for big projects.',
    images: [
      require('../assets/review1.png'),
      require('../assets/review2.png'),
    ],
  },
  {
    id: '3',
    name: 'Savir Kapoor',
    rating: 4.6,
    comment: 'Amazing quality and delivered on time',
    images: [
      require('../assets/review1.png'),
      require('../assets/review2.png'),
    ],
  },
  {
    id: '4',
    name: 'Arjun Sharma',
    rating: 5,
    comment:
      'Excellent quality blocks, very uniform in size and easy to install. Saved us a lot of time on site. Strong and durable material – highly recommended for big projects.',
    images: [
      require('../assets/review1.png'),
      require('../assets/review2.png'),
    ],
  },
];

const RatingReview = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <NormalHeader title="Ratings & Reviews" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 90 }}
      >
        {/* Product Info */}
        <View style={styles.productInfo}>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <Text style={styles.productName}>
              Cinder Blocks / Concrete Hollow Blocks
            </Text>
            <View style={styles.brandRow}>
              <Image
                source={require('../assets/vendor1.png')}
                style={styles.brandLogo}
              />
              <View>
                <Text style={styles.brandText}>Cemex</Text>
                <Text style={styles.visitText}>Visit store</Text>
              </View>
            </View>
          </View>
          <View style={styles.ratingRow}>
            <Icon name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>4.6 (123)</Text>
          </View>
          <Text style={styles.salesText}>100+ bought past week</Text>
        </View>

        {/* Reviews List */}
        <FlatList
          data={reviews}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.reviewCard}>
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
                    <Icon name="star" size={16} color="#FFD700" />
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
          )}
        />
      </ScrollView>

      {/* Fixed Bottom Button */}
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
    backgroundColor: '#F1F7F8',
  },

  productInfo: {
    padding: '15@ms',
    backgroundColor: '#F9FBFF',
    marginVertical: '10@vs',
  },
  productName: {
    width: '50%',
    fontSize: '14@ms',
    fontWeight: '600',
    color: '#000',
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
    color: '#000',
    fontWeight: '500',
  },
  visitText: {
    fontSize: '10@ms',
    color: '#1E2A4A',
    marginLeft: '4@ms',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: '12@ms',
    color: '#000',
    fontWeight: '500',
  },
  salesText: {
    fontSize: '11@ms',
    color: '#000',
    marginTop: '2@ms',
  },
  reviewCard: {
    borderBottomWidth: 0.6,
    borderColor: '#E0E0E0',
    padding: '12@ms',
    backgroundColor: '#fff',
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
    backgroundColor: '#1C3452',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '10@ms',
  },
  avatarText: {
    fontSize: '13@ms',
    fontWeight: '600',
    color: '#fff',
  },
  reviewName: {
    fontSize: '15@ms',
    fontWeight: '600',
    color: '#000',
  },
  reviewRating: {
    fontSize: '15@ms',
    color: '#000',
    marginLeft: '4@ms',
  },
  reviewComment: {
    fontSize: '12@ms',
    color: '#555',
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
    backgroundColor: '#fff',
    padding: '12@ms',
    borderTopWidth: 0.5,
    borderColor: '#E0E0E0',
  },
  reviewButton: {
    backgroundColor: '#1E2A4A',
    borderRadius: '10@ms',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: '10@ms',
    marginHorizontal: '20@s',
    marginBottom: '10@vs',
  },
  reviewButtonText: {
    color: '#fff',
    fontSize: '13@ms',
    fontWeight: '600',
  },
});
