import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import NormalHeader from '../component/NormalHeader';
import Icon from 'react-native-vector-icons/Ionicons';
import { ScaledSheet } from 'react-native-size-matters';

const MyProjectDetail = () => {
  const projectItems = [
    {
      id: 1,
      name: 'Cinder Blocks / Concrete Hollow Blocks',
      image: require('../assets/orderImg1.png'),
    },
    {
      id: 2,
      name: 'Cinder Blocks / Concrete Hollow Blocks',
      image: require('../assets/orderImg2.png'),
    },
  ];

  const handleItemPress = (itemName: string) => {
    console.log(`${itemName} presses`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <NormalHeader title="" />
      <ScrollView style={styles.scrollContainer}>
        {projectItems.map(item => (
          <TouchableOpacity
            key={item.id}
            style={styles.itemContainer}
            onPress={() => handleItemPress(item.name)}
          >
            <View style={styles.itemContainer}>
              <Image source={item.image} style={styles.image} />
              <Text style={styles.name}>{item.name}</Text>
            </View>
            <Icon name="chevron-forward" size={22} color="#000" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyProjectDetail;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F7F8',
  },
  scrollContainer: {
    paddingVertical: '10@vs',
    marginTop: '20@vs',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '10@s',
    backgroundColor: '#fff',
    paddingVertical: '4@vs',
    paddingHorizontal: '10@s',
    marginBottom: '10@vs',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: '70@s',
    height: '50@vs',
    resizeMode: 'contain',
  },
  name: {
    width: '60%',
    color: '#000',
    fontSize: '12@ms',
    fontWeight: '500',
  },
});
