import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet, ms, mvs } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/FontAwesome';
import Header from '../component/Header';

const Vendors = () => {
  const vendors = [
    {
      id: '1',
      name: 'Cornerstone',
      image: require('../assets/vendor1.png'),
      rating: 4.6,
      reviews: 123,
    },
    {
      id: '2',
      name: 'Handyman',
      image: require('../assets/vendor2.png'),
      rating: 4.6,
      reviews: 123,
    },
    {
      id: '3',
      name: 'Brickpro',
      image: require('../assets/vendor3.png'),
      rating: 4.6,
      reviews: 123,
    },
    {
      id: '4',
      name: 'The Architect',
      image: require('../assets/vendor4.png'),
      rating: 4.6,
      reviews: 123,
    },
    {
      id: '5',
      name: 'Construction Material',
      image: require('../assets/vendor1.png'),
      rating: 4.6,
      reviews: 123,
    },
  ];

  const renderVendor = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.leftSection}>
        <Image source={item.image} style={styles.logo} resizeMode="contain" />
      </View>
      <View style={styles.middleSection}>
        <Text style={styles.vendorName}>{item.name}</Text>
        <View style={styles.ratingRow}>
          <Icon name="star" size={ms(14)} color="#FCA311" />
          <Text style={styles.ratingText}>
            {item.rating}{' '}
            <Text style={styles.reviewText}>({item.reviews})</Text>
          </Text>
        </View>
        <Text style={styles.subText}>100+ bought past week</Text>
      </View>
      <TouchableOpacity style={styles.visitButton}>
        <Text style={styles.visitText}>Visit store</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={vendors}
        keyExtractor={item => item.id}
        renderItem={renderVendor}
        contentContainerStyle={{ paddingBottom: mvs(10) }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default Vendors;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F7F8',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: '10@ms',
    padding: '10@ms',
    marginHorizontal: '10@s',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    marginTop: '10@vs',
  },
  leftSection: {
    width: '60@ms',
    height: '60@ms',
    marginRight: '12@ms',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '70@ms',
    height: '70@ms',
  },
  middleSection: {
    flex: 1,
  },
  vendorName: {
    fontSize: '14@ms',
    fontWeight: '600',
    color: '#000',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: '4@ms',
  },
  ratingText: {
    fontSize: '12@ms',
    color: '#333',
    marginLeft: '4@ms',
  },
  reviewText: {
    color: '#777',
  },
  subText: {
    fontSize: '10@ms',
    color: '#00',
    marginTop: '3@ms',
  },
  visitButton: {
    borderRadius: '20@ms',
    paddingVertical: '6@ms',
    paddingHorizontal: '12@ms',
  },
  visitText: {
    color: '#1C3452',
    fontSize: '10@ms',
    fontWeight: '600',
  },
});
