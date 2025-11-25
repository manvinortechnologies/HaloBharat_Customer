import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../component/Header';
import Vendors from '../component/Vendors';
import COLORS from '../constants/colors';

const VendorList = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <Vendors showSearchBar={false} />
    </SafeAreaView>
  );
};

export default VendorList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray975,
  },
});
