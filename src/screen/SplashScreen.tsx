import React, { useEffect } from 'react';
import { Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import auth from '@react-native-firebase/auth';
import COLORS from '../constants/colors';
import { loadAuthData } from '../storage/authStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SplashScreen = ({ navigation }: any) => {
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const bootstrap = async () => {
      await loadAuthData();
      const data = await AsyncStorage.getItem('authData');
      navigation.reset({
        index: 0,
        routes: [{ name: data ? 'MainTab' : 'LoginScreen' }],
      });
    };

    bootstrap();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [navigation]);
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={COLORS.primaryDark}
        barStyle="light-content"
      />
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
    backgroundColor: COLORS.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '280@s',
    height: '250@vs',
  },
});
