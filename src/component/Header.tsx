import React from 'react';
import { View, Image, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet, ms } from 'react-native-size-matters';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  SearchScreen: undefined;
  Notification: undefined;
  Wishlist: undefined;
  MyCart: undefined;
};

const Header = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.container}>
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.iconContainer}>
          {/* Notification Button */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Notification')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="notifications-outline"
              size={ms(20)}
              color="#000"
              style={styles.icon}
            />
          </TouchableOpacity>

          {/* Wishlist Button */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Wishlist')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="heart-outline"
              size={ms(20)}
              color="#000"
              style={styles.icon}
            />
          </TouchableOpacity>

          {/* My Cart Button */}
          <TouchableOpacity
            onPress={() => navigation.navigate('MyCart')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="bag-outline"
              size={ms(20)}
              color="#000"
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <TouchableOpacity
        style={styles.searchContainer}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('SearchScreen')}
      >
        <Ionicons
          name="search-outline"
          size={ms(16)}
          color="#303030"
          style={styles.searchIcon}
        />
        <Text style={styles.placeholderText}>Search for Products</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Header;

const styles = ScaledSheet.create({
  safeArea: {
    backgroundColor: '#fff',
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '10@s',
  },
  logo: {
    width: '80@s',
    height: '60@vs',
    marginLeft: '-15@s',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: '10@s',
  },
  icon: {
    marginHorizontal: '8@s',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
    borderRadius: '10@s',
    marginHorizontal: '20@s',
    marginTop: '5@vs',
    marginBottom: '10@vs',
    paddingHorizontal: '10@s',
    height: '40@vs',
    borderWidth: 1,
    borderColor: '#D9D9D9',
  },
  searchIcon: {
    marginRight: '8@s',
  },
  placeholderText: {
    flex: 1,
    fontSize: '13@ms',
    color: '#303030',
  },
});
