import React from 'react';
import { ScrollView, Text, View, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import Header from './Header';
import { useNavigation, NavigationProp } from '@react-navigation/native';

type RootStackParamList = {
  ProductCategoryList: undefined;
  Categories: undefined;
};

const Categories = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  // Enhanced categories data with images
  const categories = [
    { id: '1', name: 'Paints', image: require('../assets/paints.png') },
    { id: '2', name: 'Stones', image: require('../assets/stones.png') },
    { id: '3', name: 'Timber', image: require('../assets/timber.png') },
    { id: '4', name: 'Tiles', image: require('../assets/tiles.png') },
    { id: '5', name: 'Bricks', image: require('../assets/stones.png') },
    { id: '6', name: 'Pipes', image: require('../assets/steel.png') },
    { id: '7', name: 'Cement', image: require('../assets/stones.png') },
    { id: '8', name: 'Tools', image: require('../assets/timber.png') },
    { id: '9', name: 'Electrical', image: require('../assets/steel.png') },
    { id: '10', name: 'Plumbing', image: require('../assets/paints.png') },
    { id: '11', name: 'Hardware', image: require('../assets/stones.png') },
    { id: '12', name: 'Furniture', image: require('../assets/timber.png') },
    { id: '13', name: 'Lighting', image: require('../assets/stones.png') },
    { id: '14', name: 'Flooring', image: require('../assets/paints.png') },
    { id: '15', name: 'Roofing', image: require('../assets/stones.png') },
    { id: '16', name: 'Water Tank', image: require('../assets/paints.png') },
  ];

  // Function to render each category item
  const renderCategoryItem = (
    item: { id: any; name: any; image: any },
    index: number,
  ) => (
    <TouchableOpacity
      key={item.id}
      style={styles.categoryItem}
      onPress={() => navigation.navigate('ProductCategoryList')}
    >
      {/* Rounded Image Container */}
      <View style={styles.imageContainer}>
        <Image
          source={item.image}
          style={styles.categoryImage}
          resizeMode="cover"
        />
      </View>

      {/* Category Name */}
      <Text style={styles.categoryName} numberOfLines={2}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}

        {/* Categories Grid - 4 items per row */}
        <View style={styles.gridContainer}>
          {categories.map((item, index) => renderCategoryItem(item, index))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Categories;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F7F8',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: '16@s',
  },
  header: {
    fontSize: '24@ms',
    fontWeight: 'bold',
    color: '#000',
    marginTop: '20@vs',
    marginBottom: '24@vs',
    textAlign: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: '-2.5@s',
    marginTop: '10@vs',
  },
  categoryItem: {
    width: '23%', // 4 items per row (100% / 4 - some margin)
    alignItems: 'center',
    marginBottom: '20@vs',
    padding: '5@s',
  },
  imageContainer: {
    width: '80@s',
    height: '60@s',
    borderRadius: '30@s', // Makes it circular
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '8@vs',
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.1,
    // shadowRadius: 3,
    // elevation: 3,
    // overflow: 'hidden',
    // Ensures image stays within rounded bounds
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    borderRadius: '30@s',
  },
  categoryName: {
    fontSize: '12@ms',
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    marginTop: '2@vs',
  },
});
