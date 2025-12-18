import React, { useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import NormalHeader from '../component/NormalHeader';
import COLORS from '../constants/colors';
import { getProfile } from '../api/profile';
import auth from '@react-native-firebase/auth';
import { clearAuthData } from '../storage/authStorage';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  LoginScreen: undefined;
};

const Account = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProfile();
      await AsyncStorage.setItem('profile', JSON.stringify(data));
      setProfile(data);
    } catch (err: any) {
      setError(err?.message || 'Unable to load profile.');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleDeleteAccount = () => {
    Alert.alert('Delete Account', 'Account deletion is not supported yet.', [
      { text: 'OK' },
    ]);
  };

  const handleLogOut = () => {
    Alert.alert('Log Out', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await auth().signOut();
          } catch (err) {
            console.warn('Failed to sign out of Firebase:', err);
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

  const renderDetail = (label: string, value?: string | null) => {
    const displayValue = value && value.length > 0 ? value : 'Not provided';
    return (
      <View style={styles.detailItem}>
        <Text style={styles.detailLabel}>{label}</Text>
        <View style={styles.inputField}>
          <Text style={styles.detailValue}>{displayValue}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <NormalHeader title="Account" showBackButton={false} />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loaderText}>Loading profile...</Text>
          </View>
        ) : error ? (
          <TouchableOpacity style={styles.errorBanner} onPress={fetchProfile}>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.retryText}>Tap to retry</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.detailsContainer}>
            {renderDetail('Full Name', profile?.full_name ?? profile?.name)}
            {renderDetail(
              'Phone Number',
              profile?.contact_phone ?? profile?.phone,
            )}
            {renderDetail('Email ID', profile?.email)}
            {renderDetail('Gender', profile?.gender)}
            {renderDetail(
              'Address',
              profile?.address ??
                [profile?.city, profile?.state, profile?.pincode]
                  .filter(Boolean)
                  .join(', '),
            )}
            {renderDetail('Role', profile?.role)}
            {renderDetail('Status', profile?.status)}
            {renderDetail(
              'Account Created',
              profile?.created_at
                ? new Date(profile.created_at).toLocaleString()
                : null,
            )}
            {renderDetail('Profile ID', profile?.id)}
          </View>
        )}

        <View style={styles.actionsContainer}>
          {/* <TouchableOpacity onPress={handleDeleteAccount}>
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </TouchableOpacity> */}

          <TouchableOpacity onPress={handleLogOut}>
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default Account;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: '10@s',
    paddingVertical: '20@vs',
  },
  detailsContainer: {
    borderRadius: '12@s',
    paddingVertical: '10@vs',
    marginBottom: '2@vs',
  },
  detailItem: {
    marginBottom: '16@vs',
    paddingHorizontal: '16@s',
  },
  detailLabel: {
    fontSize: '14@ms',
    color: COLORS.black,
    marginBottom: '6@vs',
    fontWeight: '500',
  },
  inputField: {
    backgroundColor: COLORS.white,
    paddingVertical: '10@vs',
    paddingHorizontal: '12@s',
    borderWidth: 0.5,
    borderColor: COLORS.black,
  },
  detailValue: {
    fontSize: '15@ms',
    color: COLORS.black,
    fontWeight: '400',
  },
  actionsContainer: {
    marginBottom: '40@vs',
    paddingHorizontal: '16@s',
  },
  deleteButtonText: {
    fontSize: '14@ms',
    color: COLORS.accentRuby,
    fontWeight: '600',
    marginBottom: '16@vs',
  },
  logoutButtonText: {
    fontSize: '14@ms',
    color: COLORS.black,
    fontWeight: '600',
    marginTop: '5@vs',
  },
  loaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8@s',
    paddingVertical: '20@vs',
  },
  loaderText: {
    fontSize: '13@ms',
    color: COLORS.textDark,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.infoSurface,
    borderRadius: '10@s',
    paddingHorizontal: '12@s',
    paddingVertical: '8@vs',
    marginHorizontal: '12@s',
    marginBottom: '12@vs',
    gap: '6@s',
  },
  errorText: {
    flex: 1,
    fontSize: '12@ms',
    color: COLORS.textDark,
  },
  retryText: {
    fontSize: '12@ms',
    color: COLORS.primary,
    fontWeight: '600',
  },
});
