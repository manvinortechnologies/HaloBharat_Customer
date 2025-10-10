import React from 'react';
import { ScrollView, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/Ionicons';
import NormalHeader from '../component/NormalHeader';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Define your stack param list
type RootStackParamList = {
  Account: undefined;
  MyOrders: undefined;
  Wishlist: undefined;
  Projects: undefined;
  Addresses: undefined;
  HelpSupport: undefined;
  TermsPolicies: undefined;
};

const More = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const userName = 'Rahul Sharma';

  // Menu items with screen mapping
  const menuItems = [
    {
      id: 1,
      title: 'Your Profile',
      description: 'Manage your personal details & saved info',
      icon: 'person',
      isProfile: true,
      screen: 'Account',
    },
    {
      id: 2,
      title: 'My Wishlist',
      description: 'Manage your personal details & saved info',
      icon: 'heart-outline',
      screen: 'Wishlist',
    },
    {
      id: 3,
      title: 'My Orders',
      description: 'Track, manage, and record your purchases',
      icon: 'bag-outline',
      screen: 'MyOrders',
    },
    {
      id: 4,
      title: 'My Projects',
      description: 'Link Orders to Your Projects',
      icon: 'clipboard-outline',
      screen: 'MyProject',
    },
    {
      id: 5,
      title: 'My Addresses',
      description: 'Save & Manage Your Delivery Locations',
      icon: 'location-outline',
      screen: 'MyAddress',
    },
    {
      id: 6,
      title: 'Help & Support',
      description: 'Get quick assistance and FAQs',
      icon: 'help-circle-outline',
      screen: 'HelpSupport',
    },
    {
      id: 7,
      title: 'Terms & Policies',
      description: 'Read our guidelines and conditions',
      icon: 'document-text-outline',
      screen: 'TermsPolicies',
    },
  ];

  const handleMenuItemPress = (screen: string) => {
    navigation.navigate(screen as keyof RootStackParamList);
  };

  return (
    <SafeAreaView style={styles.container}>
      <NormalHeader title="More" />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>Hey, {userName}!</Text>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && styles.lastMenuItem,
              ]}
              onPress={() => handleMenuItemPress(item.screen)}
            >
              <View style={styles.menuIconContainer}>
                {item.isProfile ? (
                  <View style={styles.profileCircle}>
                    <Text style={styles.profileLetter}>
                      {userName[0].toUpperCase()}
                    </Text>
                  </View>
                ) : (
                  <Icon name={item.icon} size={22} color="#000" />
                )}
              </View>

              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default More;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F7F8',
  },
  scrollView: {
    flex: 1,
  },
  greetingContainer: {
    paddingHorizontal: '20@s',
    marginVertical: '15@vs',
  },
  greeting: {
    fontSize: '18@ms',
    fontWeight: '600',
    color: '#000',
  },
  menuContainer: {
    backgroundColor: '#F1F7F8',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: '12@vs',
    paddingHorizontal: '20@s',
    marginBottom: '10@vs',
    backgroundColor: '#fff',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuIconContainer: {
    width: '40@s',
    alignItems: 'center',
    marginRight: '5@s',
  },
  profileCircle: {
    width: '30@s',
    height: '30@s',
    borderRadius: '15@s',
    backgroundColor: '#1C3452',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileLetter: {
    color: '#fff',
    fontSize: '16@ms',
    fontWeight: '700',
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: '14@ms',
    fontWeight: '400',
    color: '#000',
    marginBottom: '2@vs',
  },
  menuDescription: {
    fontSize: '10@ms',
    color: '#696969',
    fontWeight: '400',
  },
});
