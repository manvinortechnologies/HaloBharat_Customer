import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { ScaledSheet } from 'react-native-size-matters';
import COLORS from '../constants/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface NormalHeaderProps {
  title?: string;
  showBackButton?: boolean;
  rightButton?: React.ReactNode;
  showCartButton?: boolean;
  showWishlistButton?: boolean;
  showSearchButton?: boolean;
}

const NormalHeader: React.FC<NormalHeaderProps> = ({
  title = 'Title',
  showBackButton = true,
  rightButton = null,
  showCartButton = false,
  showWishlistButton = false,
  showSearchButton = false,
}) => {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      {/* Left Section */}
      <View style={styles.leftSection}>
        {showBackButton && navigation.canGoBack() && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="chevron-back" size={24} color={COLORS.black} />
          </TouchableOpacity>
        )}
      </View>
      {/* Title - Centered */}
      <Text style={styles.title}>{title}</Text>
      {/* Right Section */}
      <View style={styles.rightSection}>
        {showCartButton && (
          <TouchableOpacity onPress={() => navigation.navigate('MyCart')}>
            <Ionicons name="bag-outline" size={24} color={COLORS.black} />
          </TouchableOpacity>
        )}
        {showWishlistButton && (
          <TouchableOpacity onPress={() => navigation.navigate('Wishlist')}>
            <Ionicons name="heart-outline" size={24} color={COLORS.black} />
          </TouchableOpacity>
        )}
        {showSearchButton && (
          <TouchableOpacity onPress={() => navigation.navigate('SearchScreen')}>
            <Ionicons name="search" size={24} color={COLORS.black} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default NormalHeader;

const styles = ScaledSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '50@vs',
    paddingHorizontal: '10@s',
    backgroundColor: COLORS.white,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    position: 'relative',
  },
  leftSection: {
    // width: '50@s',
    alignItems: 'flex-start',
    justifyContent: 'center',
    zIndex: 100,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '10@s',
  },
  title: {
    position: 'absolute',
    left: 0,
    right: 0,
    fontSize: '18@ms',
    fontWeight: '700',
    color: COLORS.black,
    textAlign: 'center',
  },
});
