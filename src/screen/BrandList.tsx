import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../component/Header';

interface Brand {
  id: string;
  name: string;
  productCount: string;
  image: any;
}

const BrandList = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState('');

  const brands: Brand[] = [
    {
      id: '1',
      name: 'Heidelberg Materials',
      productCount: '1011 Products',
      image: require('../assets/heidelberg.png'),
    },
    {
      id: '2',
      name: 'UltraTech Cement',
      productCount: '1011 Products',
      image: require('../assets/ultratech.png'),
    },
    {
      id: '3',
      name: 'Astral Pipes',
      productCount: '1011 Products',
      image: require('../assets/astral.png'),
    },
    {
      id: '4',
      name: 'Heidelberg Materials',
      productCount: '1011 Products',
      image: require('../assets/heidelberg.png'),
    },
    {
      id: '5',
      name: 'UltraTech Cement',
      productCount: '1011 Products',
      image: require('../assets/ultratech.png'),
    },
    {
      id: '6',
      name: 'Astral Pipes',
      productCount: '1011 Products',
      image: require('../assets/astral.png'),
    },
  ];

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleBrandPress = (brand: Brand) => {
    // Navigate to brand products page
    console.log('Brand pressed:', brand.name);
    navigation.navigate('ProductList', { brandId: brand.id });
  };

  const renderBrandCard = ({ item, index }: { item: Brand; index: number }) => {
    const isLeftColumn = index % 2 === 0;

    return (
      <TouchableOpacity
        style={[
          styles.brandCard,
          isLeftColumn ? styles.leftCard : styles.rightCard,
        ]}
        onPress={() => handleBrandPress(item)}
      >
        <Image
          source={item.image}
          style={styles.brandImage}
          resizeMode="cover"
        />
        <View style={styles.brandInfo}>
          <Text style={styles.brandName}>{item.name}</Text>
          <Text style={styles.productCount}>{item.productCount}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header />

      {/* Brand Grid */}
      <FlatList
        data={filteredBrands}
        renderItem={renderBrandCard}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.brandList}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default BrandList;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F7F8',
  },

  brandList: {
    paddingHorizontal: '8@s',
    paddingTop: '8@vs',
    paddingBottom: '20@vs',
    marginTop: '10@s',
    backgroundColor: '#fff',
  },
  brandCard: {
    width: '45%',
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
    marginRight: '8@s',
    marginLeft: '8@s',
    marginTop: '10@s',
  },
  rightCard: {
    marginLeft: '4@s',
    marginRight: '8@s',
    marginTop: '10@s',
  },
  brandImage: {
    width: '100%',
    height: '140@vs',
    backgroundColor: '#F5F5F5',
  },
  brandInfo: {
    padding: '4@s',
    backgroundColor: '#fff',
  },
  brandName: {
    fontSize: '14@ms',
    fontWeight: '600',
    color: '#000',
    marginBottom: '2@vs',
  },
  productCount: {
    fontSize: '12@ms',
    color: '#000',
  },
});
