import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import auth from '@react-native-firebase/auth';

import LoginScreen from './src/screen/LoginScreen';
import OtpScreen from './src/screen/OtpScreen';
import SplashScreen from './src/screen/SplashScreen';
import Signup from './src/screen/Signup';
import Home from './src/screen/Home';
import More from './src/screen/More';
import MainTabScreen from './src/navigation/MainTabScreen';
import Categories from './src/component/Categories';
import MyOrders from './src/screen/MyOrders';
import MyProject from './src/screen/MyProject';
import MyAddress from './src/screen/MyAddress';
import HelpSupport from './src/screen/HelpSupport';
import TermsPolicies from './src/screen/TermsPolicies';
import OrderDetail from './src/screen/OrderDetail';
import ReturnOrder from './src/screen/ReturnOrder';
import MyProjectDetail from './src/screen/MyProjectDetail';
import AddAddress from './src/screen/AddAddress';
import Vendors from './src/component/Vendors';
import SearchScreen from './src/screen/SearchScreen';
import VendorList from './src/screen/VendorList';
import Wishlist from './src/screen/Wishlist';
import Notification from './src/screen/Notification';
import ProductList from './src/screen/ProductList';
import ProductDetail from './src/screen/ProductDetail';
import RatingReview from './src/screen/RatingReview';
import MyCart from './src/screen/MyCart';
import PaymentConfirmation from './src/screen/PaymentConfirmation';
import AssignProject from './src/screen/AssignProject';
import BrandList from './src/screen/BrandList';
import ProductCategoryList from './src/screen/ProductCategoryList';
import { clearAuthData } from './src/storage/authStorage';
import { setGlobalLogoutFunction } from './src/api/axiosInstance';
import BrandProductsList from './src/screen/BrandProductsList';
import VendorDetail from './src/screen/VendorDetail';
import ChatsScreen from './src/screen/ChatsScreen';
import ChatingScreen from './src/screen/ChatingScreen';
import Account from './src/screen/Account';
import Toast from 'react-native-toast-message';
import { CartProvider } from './src/context/CartContext';

const Stack = createStackNavigator();
const navigationRef = createNavigationContainerRef<any>();

const App = () => {
  useEffect(() => {
    setGlobalLogoutFunction(async () => {
      try {
        await auth().signOut();
      } catch (err) {
        console.warn('Failed to sign out of Firebase:', err);
      }
      await clearAuthData();
      if (navigationRef.isReady()) {
        navigationRef.reset({
          index: 0,
          routes: [{ name: 'LoginScreen' as never }],
        });
      }
    });
  }, []);

  return (
    <CartProvider>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="SplashScreen" component={SplashScreen} />
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="OtpScreen" component={OtpScreen} />
          <Stack.Screen name="Signup" component={Signup} />
          <Stack.Screen name="MainTab" component={MainTabScreen} />
          <Stack.Screen name="Account" component={Account} />
          {/* <Stack.Screen name="Home" component={Home} /> */}
          {/* <Stack.Screen name="More" component={More} /> */}
          <Stack.Screen name="Categories" component={Categories} />
          <Stack.Screen
            name="ProductCategoryList"
            component={ProductCategoryList}
          />
          <Stack.Screen name="ProductList" component={ProductList} />
          <Stack.Screen name="ProductDetail" component={ProductDetail} />
          <Stack.Screen name="RatingReview" component={RatingReview} />
          <Stack.Screen name="Vendors" component={Vendors} />
          <Stack.Screen name="VendorList" component={VendorList} />
          <Stack.Screen name="VendorDetail" component={VendorDetail} />
          <Stack.Screen name="BrandList" component={BrandList} />
          <Stack.Screen
            name="BrandProductsList"
            component={BrandProductsList}
          />
          <Stack.Screen name="SearchScreen" component={SearchScreen} />
          <Stack.Screen name="Wishlist" component={Wishlist} />
          <Stack.Screen name="Notification" component={Notification} />
          <Stack.Screen name="MyCart" component={MyCart} />
          <Stack.Screen
            name="PaymentConfirmation"
            component={PaymentConfirmation}
          />
          <Stack.Screen name="AssignProject" component={AssignProject} />
          <Stack.Screen name="MyOrders" component={MyOrders} />
          <Stack.Screen name="OrderDetail" component={OrderDetail} />
          <Stack.Screen name="ReturnOrder" component={ReturnOrder} />
          <Stack.Screen name="MyProject" component={MyProject} />
          <Stack.Screen name="MyProjectDetail" component={MyProjectDetail} />
          <Stack.Screen name="MyAddress" component={MyAddress} />
          <Stack.Screen name="AddAddress" component={AddAddress} />
          <Stack.Screen name="HelpSupport" component={HelpSupport} />
          <Stack.Screen name="TermsPolicies" component={TermsPolicies} />
          <Stack.Screen name="ChatsScreen" component={ChatsScreen} />
          <Stack.Screen name="ChatingScreen" component={ChatingScreen} />
        </Stack.Navigator>
        <Toast />
      </NavigationContainer>
    </CartProvider>
  );
};

export default App;

const styles = StyleSheet.create({});
