import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

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

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SplashScreen" component={SplashScreen} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="OtpScreen" component={OtpScreen} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="MainTab" component={MainTabScreen} />
        {/* <Stack.Screen name="Home" component={Home} /> */}
        <Stack.Screen name="More" component={More} />
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
        <Stack.Screen name="BrandList" component={BrandList} />
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

const styles = StyleSheet.create({});
