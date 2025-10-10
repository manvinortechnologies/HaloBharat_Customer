import React, { useEffect } from 'react';
import { View, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';

const SplashScreen = ({ navigation }: any) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('LoginScreen');
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigation]);
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#151F2C" barStyle="light-content" />
      <Image
        source={require('../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </SafeAreaView>
  );
};

export default SplashScreen;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#151F2C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '280@s',
    height: '250@vs',
  },
});
