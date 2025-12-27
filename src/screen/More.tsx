import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
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
import { deleteAccount } from '../api/auth';
import Toast from 'react-native-toast-message';

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const profileData = await AsyncStorage.getItem('profile');
      if (profileData) {
        const data = JSON.parse(profileData);
        setProfile(data);
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

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const handleCancelDelete = () => {
    if (!deletingAccount) {
      setShowDeleteModal(false);
    }
  };

  const handleConfirmDelete = async () => {
    // Get mobile number from profile
    const mobileNumber = profile?.contact_phone;

    if (!mobileNumber) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Unable to find mobile number. Please try again.',
      });
      setShowDeleteModal(false);
      return;
    }

    // Ensure mobile number has country code
    const formattedMobileNumber = mobileNumber.startsWith('+')
      ? mobileNumber
      : `+91${mobileNumber}`;

    try {
      setDeletingAccount(true);
      await deleteAccount(formattedMobileNumber);
      Toast.show({
        type: 'success',
        text1: 'Account Deleted',
        text2: 'Your account has been successfully deleted.',
      });
      // Sign out from Firebase
      try {
        await auth().signOut();
      } catch (error) {
        console.warn('Failed to sign out of Firebase', error);
      }
      // Clear local data
      await clearAuthData();
      await AsyncStorage.removeItem('profile');
      // Navigate to login
      navigation.reset({
        index: 0,
        routes: [{ name: 'LoginScreen' as never }],
      });
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Failed to delete account. Please try again.';
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });
      setShowDeleteModal(false);
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <View style={styles.container}>
      <NormalHeader title="More" showBackButton={false} />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>
            Hey, {profile?.full_name || profile?.name}!
          </Text>
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
                      {(profile?.full_name || profile?.name)
                        ?.slice(0, 1)
                        ?.toUpperCase()}
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

        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDeleteAccount}
          >
            <Icon name="trash-outline" size={20} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Delete Account</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Icon name="log-out-outline" size={20} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Delete Account Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={handleCancelDelete}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContent}>
            <View style={styles.deleteModalIconContainer}>
              <Icon name="warning" size={48} color={COLORS.accentRuby} />
            </View>
            <Text style={styles.deleteModalTitle}>Delete Account</Text>
            <Text style={styles.deleteModalMessage}>
              Are you sure you want to delete your account? This action cannot
              be undone and all your data will be permanently deleted.
            </Text>
            <View style={styles.deleteModalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={handleCancelDelete}
                disabled={deletingAccount}
              >
                <Text style={styles.cancelModalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.deleteModalButton,
                  deletingAccount && styles.deleteModalButtonDisabled,
                ]}
                onPress={handleConfirmDelete}
                disabled={deletingAccount}
              >
                {deletingAccount ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.deleteModalButtonText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  actionButtonsContainer: {
    flexDirection: 'row',
    marginHorizontal: '20@s',
    marginVertical: '20@vs',
    gap: '10@s',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12@s',
    paddingVertical: '12@vs',
    gap: '8@s',
  },
  deleteButton: {
    backgroundColor: COLORS.accentRuby,
  },
  logoutButton: {
    backgroundColor: COLORS.accentRed,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: '14@ms',
    fontWeight: '600',
  },
  // Delete Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlayStrong,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '20@s',
  },
  deleteModalContent: {
    width: '100%',
    maxWidth: '400@s',
    backgroundColor: COLORS.white,
    borderRadius: '16@s',
    paddingVertical: '24@vs',
    paddingHorizontal: '20@s',
    alignItems: 'center',
  },
  deleteModalIconContainer: {
    marginBottom: '16@vs',
  },
  deleteModalTitle: {
    fontSize: '20@ms',
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: '12@vs',
    textAlign: 'center',
  },
  deleteModalMessage: {
    fontSize: '14@ms',
    color: COLORS.textSemiDark,
    textAlign: 'center',
    marginBottom: '24@vs',
    lineHeight: '20@vs',
  },
  deleteModalActions: {
    flexDirection: 'row',
    width: '100%',
    gap: '12@s',
  },
  modalButton: {
    flex: 1,
    paddingVertical: '12@vs',
    borderRadius: '8@s',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '44@vs',
  },
  cancelModalButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray800,
  },
  cancelModalButtonText: {
    color: COLORS.textDark,
    fontSize: '14@ms',
    fontWeight: '600',
  },
  deleteModalButton: {
    backgroundColor: COLORS.accentRuby,
  },
  deleteModalButtonDisabled: {
    opacity: 0.6,
  },
  deleteModalButtonText: {
    color: COLORS.white,
    fontSize: '14@ms',
    fontWeight: '600',
  },
});
