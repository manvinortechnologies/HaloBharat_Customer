import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/Ionicons';
import NormalHeader from '../component/NormalHeader';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import COLORS from '../constants/colors';
import auth from '@react-native-firebase/auth';
import { clearAuthData } from '../storage/authStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define your stack param list
type RootStackParamList = {
  Account: undefined;
  MyOrders: undefined;
  Wishlist: undefined;
  Projects: undefined;
  Addresses: undefined;
  HelpSupport: undefined;
  TermsPolicies: undefined;
  MainTab: { screenName: string };
};

const More = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const [profile, setProfile] = useState<any>(null);
  useEffect(() => {
    const fetchProfile = async () => {
      const profileData = await AsyncStorage.getItem('profile');
      if (profileData) {
        const data = JSON.parse(profileData);
        setProfile(data?.full_name);
      }
    };
    fetchProfile();
  }, []);

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
    navigation.navigate(screen as never);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await auth().signOut();
          } catch (error) {
            console.warn('Failed to sign out of Firebase', error);
          }
          await clearAuthData();
          navigation.reset({
            index: 0,
            routes: [{ name: 'LoginScreen' as never }],
          });
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <NormalHeader title="More" showBackButton={false} />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>Hey, {profile}!</Text>
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
                      {profile?.slice(0, 1)?.toUpperCase()}
                    </Text>
                  </View>
                ) : (
                  <Icon name={item.icon} size={22} color={COLORS.black} />
                )}
              </View>

              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="log-out-outline" size={20} color={COLORS.white} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default More;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray975,
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
    color: COLORS.black,
  },
  menuContainer: {
    backgroundColor: COLORS.gray975,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: '12@vs',
    paddingHorizontal: '20@s',
    marginBottom: '10@vs',
    backgroundColor: COLORS.white,
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
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileLetter: {
    color: COLORS.white,
    fontSize: '16@ms',
    fontWeight: '700',
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: '14@ms',
    fontWeight: '400',
    color: COLORS.black,
    marginBottom: '2@vs',
  },
  menuDescription: {
    fontSize: '10@ms',
    color: COLORS.textAsh,
    fontWeight: '400',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: '20@s',
    marginVertical: '20@vs',
    backgroundColor: COLORS.accentRed,
    borderRadius: '12@s',
    paddingVertical: '12@vs',
    gap: '8@s',
  },
  logoutText: {
    color: COLORS.white,
    fontSize: '14@ms',
    fontWeight: '600',
  },
});
