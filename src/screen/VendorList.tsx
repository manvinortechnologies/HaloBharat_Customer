import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../component/Header';
import Vendors from '../component/Vendors';

const VendorList = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <Vendors />
    </SafeAreaView>
  );
};

export default VendorList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F7F8',
  },
});
