import React from 'react';
import { View, Image, TouchableOpacity, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet, ms } from 'react-native-size-matters';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import COLORS from '../constants/colors';

type RootStackParamList = {
  SearchScreen: undefined;
  Notification: undefined;
  Wishlist: undefined;
  MyCart: undefined;
};

const Header = ({
  value,
  onChangeText,
  placeholder,
  showBackButton = true,
}: {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  showBackButton?: boolean;
}) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.container}>
        {showBackButton && navigation.canGoBack() && (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={ms(20)} color={COLORS.black} />
          </TouchableOpacity>
        )}
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={{ flexGrow: 1 }} />
        <View style={styles.iconContainer}>
          {/* Notification Button */}
          {/* <TouchableOpacity
            onPress={() => navigation.navigate('Notification')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="notifications-outline"
              size={ms(20)}
              color={COLORS.black}
              style={styles.icon}
            />
          </TouchableOpacity> */}

          {/* Wishlist Button */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Wishlist')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="heart-outline"
              size={ms(20)}
              color={COLORS.black}
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
              color={COLORS.black}
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      {onChangeText ? (
        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={ms(16)}
            color={COLORS.textDark}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder={placeholder || 'Search for Products'}
            placeholderTextColor={COLORS.textDark}
            value={value}
            onChangeText={onChangeText}
          />
        </View>
      ) : (
        <TouchableOpacity
          style={styles.searchContainer}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('SearchScreen')}
        >
          <Ionicons
            name="search-outline"
            size={ms(16)}
            color={COLORS.textDark}
            style={styles.searchIcon}
          />
          <Text style={styles.placeholderText}>
            {placeholder || 'Search for Products'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default Header;

const styles = ScaledSheet.create({
  safeArea: {
    backgroundColor: COLORS.white,
  },
  container: {
    flexDirection: 'row',

    alignItems: 'center',
    // paddingHorizontal: '10@s',
  },
  backButton: {
    padding: '5@s',
    marginLeft: '10@s',
  },
  logo: {
    width: '80@s',
    height: '60@s',
    // marginLeft: '-15@s',
    // flexGrow: 1,
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
    backgroundColor: COLORS.gray1000,
    borderRadius: '10@s',
    marginHorizontal: '20@s',
    marginTop: '5@vs',
    marginBottom: '10@vs',
    paddingHorizontal: '10@s',
    height: '40@vs',
    borderWidth: 1,
    borderColor: COLORS.gray750,
  },
  searchIcon: {
    marginRight: '8@s',
  },
  searchInput: {
    flex: 1,
    fontSize: '13@ms',
    color: COLORS.textDark,
    paddingVertical: 0,
  },
  placeholderText: {
    flex: 1,
    fontSize: '13@ms',
    color: COLORS.textDark,
  },
});
