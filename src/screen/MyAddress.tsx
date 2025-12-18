import React, { useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/MaterialIcons';
import NormalHeader from '../component/NormalHeader';
import { useNavigation } from '@react-navigation/native';
import COLORS from '../constants/colors';
import { getAddresses, deleteAddress } from '../api/addresses';
import Toast from 'react-native-toast-message';

interface AddressItem {
  id: string | number;
  name: string;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  mobile: string;
  type: string;
  icon?: string;
  rawData?: any; // Store raw API data for editing
}

const MyAddress = () => {
  const navigation = useNavigation<any>();
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingAddressId, setDeletingAddressId] = useState<
    string | number | null
  >(null);

  const normalizeAddress = useCallback((item: any, index: number) => {
    // Extract address components
    const addressParts = [
      item?.address_line_1 ?? item?.address_line1 ?? item?.addressLine1,
      item?.address_line_2 ?? item?.address_line2 ?? item?.addressLine2,
      item?.city,
      item?.state,
      item?.pincode ?? item?.pin_code,
    ].filter(Boolean);

    const addressLine1 = addressParts[0] ?? '';
    const addressLine2 = addressParts.slice(1, 3).join(', ') || '';
    const addressLine3 =
      addressParts.slice(3).join(', ') ||
      `${item?.city ?? ''}${item?.state ? `, ${item.state}` : ''}`.trim();

    // Determine address type
    const addressType =
      item?.address_type ?? item?.type ?? item?.label ?? 'Other';
    const typeMap: Record<string, string> = {
      home: 'Home',
      work: 'Work',
      office: 'Work',
      other: 'Other',
    };
    const normalizedType =
      typeMap[addressType.toLowerCase()] ?? addressType ?? 'Other';

    return {
      id: String(item?.id ?? `address-${index}`),
      name:
        item?.full_name ??
        item?.name ??
        item?.contact_name ??
        item?.recipient_name ??
        'Name not provided',
      addressLine1,
      addressLine2,
      addressLine3,
      mobile:
        item?.phone ??
        item?.mobile ??
        item?.contact_phone ??
        item?.phone_number ??
        'Not provided',
      type: normalizedType,
      icon:
        normalizedType === 'Home'
          ? 'home'
          : normalizedType === 'Work'
          ? 'work'
          : 'location-on',
      rawData: item, // Store raw API data for editing
    };
  }, []);

  const fetchAddresses = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      try {
        const payload = await getAddresses();
        const listSource = Array.isArray(payload?.results)
          ? payload.results
          : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
          ? payload
          : [];
        setAddresses(listSource.map(normalizeAddress));
      } catch (err: any) {
        setError(err?.message || 'Unable to load addresses.');
        setAddresses([]);
      } finally {
        if (isRefresh) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [normalizeAddress],
  );

  const handleRefresh = useCallback(() => {
    fetchAddresses(true);
  }, [fetchAddresses]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Home':
        return COLORS.accentClay;
      case 'Work':
        return COLORS.accentClay;
      case 'Other':
        return COLORS.accentClay;
      default:
        return COLORS.accentClay;
    }
  };

  const handleAddAddress = () => {
    navigation.navigate('AddAddress');
  };

  const handleEditAddress = (addressId: string | number) => {
    const address = addresses.find(addr => addr.id === String(addressId));
    if (address && address.rawData) {
      // Pass the raw API data for better field mapping
      navigation.navigate('AddAddress', { address: address.rawData });
    }
  };

  const handleRemoveAddress = (addressId: string | number) => {
    const address = addresses.find(addr => addr.id === String(addressId));
    const addressName = address?.name || 'this address';

    Alert.alert(
      'Delete Address',
      `Are you sure you want to delete ${addressName}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingAddressId(addressId);
            try {
              await deleteAddress(addressId);
              // Remove from local state
              setAddresses(prev =>
                prev.filter(addr => addr.id !== String(addressId)),
              );
            } catch (error: any) {
              const errorMessage =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                'Failed to delete address. Please try again.';
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: errorMessage,
              });
            } finally {
              setDeletingAddressId(null);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <NormalHeader title="My Addresses" />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Saved Addresses Section */}
        <View style={styles.savedAddressesSection}>
          <Text style={styles.savedAddressesTitle}>Saved Addresses</Text>

          {/* Add Address Button */}
          <TouchableOpacity
            style={styles.addAddressButton}
            onPress={handleAddAddress}
          >
            <Icon name="add" size={18} color={COLORS.accentClay} />
            <Text style={styles.addAddressText}>Add Address</Text>
          </TouchableOpacity>
        </View>

        {/* Error Banner */}
        {error && !loading && (
          <TouchableOpacity
            style={styles.errorBanner}
            onPress={() => fetchAddresses(false)}
          >
            <Icon name="error-outline" size={18} color={COLORS.accentRed} />
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.retryText}>Tap to retry</Text>
          </TouchableOpacity>
        )}

        {/* Loading State */}
        {loading && addresses.length === 0 ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loaderText}>Loading addresses...</Text>
          </View>
        ) : addresses.length > 0 ? (
          /* Address Cards */
          <View style={styles.addressesContainer}>
            {addresses.map(address => (
              <View key={address.id} style={styles.addressCard}>
                {/* Address Header with Type */}
                <View style={styles.addressHeader}>
                  <View style={styles.typeContainer}>
                    <View
                      style={[
                        styles.addressTypeBadge,
                        { backgroundColor: getTypeColor(address.type) },
                      ]}
                    >
                      <Text style={styles.addressTypeText}>{address.type}</Text>
                    </View>
                  </View>
                </View>

                {/* Name */}
                <Text style={styles.name}>{address.name}</Text>

                {/* Address Lines */}
                <Text style={styles.addressLine}>{address.addressLine1}</Text>
                <Text style={styles.addressLine}>{address.addressLine2}</Text>
                <Text style={styles.addressLine}>{address.addressLine3}</Text>

                {/* Mobile Number */}
                <View style={styles.mobileContainer}>
                  <Text style={styles.mobile}>Mobile {address.mobile}</Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEditAddress(address.id)}
                  >
                    <Icon name="edit" size={16} color={COLORS.black} />
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>

                  <View style={styles.buttonSeparator} />

                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveAddress(address.id)}
                    disabled={deletingAddressId === address.id}
                  >
                    {deletingAddressId === address.id ? (
                      <ActivityIndicator size="small" color={COLORS.black} />
                    ) : (
                      <>
                        <Icon name="delete" size={16} color={COLORS.black} />
                        <Text style={styles.removeButtonText}>Remove</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          /* Empty State */
          <View style={styles.emptyContainer}>
            <Icon name="location-off" size={64} color={COLORS.gray700} />
            <Text style={styles.emptyText}>No addresses saved</Text>
            <Text style={styles.emptySubtext}>
              Add an address to get started
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyAddress;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray975,
  },
  scrollView: {
    flex: 1,
  },

  savedAddressesSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: '15@vs',
    paddingHorizontal: '16@s',
  },
  savedAddressesTitle: {
    fontSize: '16@ms',
    fontWeight: '500',
    color: COLORS.black,
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: '6@s',
    paddingVertical: '8@vs',
  },
  addAddressText: {
    fontSize: '14@ms',
    color: COLORS.accentClay,
    fontWeight: '500',
    marginLeft: '4@s',
  },
  addressesContainer: {
    marginBottom: '30@vs',
  },
  addressCard: {
    backgroundColor: COLORS.white,
    paddingHorizontal: '16@s',
    paddingVertical: '8@vs',
    marginBottom: '16@vs',
    borderWidth: 1,
    borderColor: COLORS.gray825,
  },
  addressHeader: {
    marginBottom: '12@vs',
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIcon: {
    marginRight: '6@s',
  },
  addressTypeBadge: {
    paddingHorizontal: '6@s',
    paddingVertical: '2@vs',
  },
  addressTypeText: {
    fontSize: '12@ms',
    fontWeight: '400',
    color: COLORS.white,
  },
  name: {
    fontSize: '18@ms',
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: '8@vs',
  },
  addressLine: {
    fontSize: '14@ms',
    color: COLORS.textSemiDark,
    marginBottom: '2@vs',
    lineHeight: '18@vs',
  },
  mobileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '12@vs',
  },
  mobile: {
    fontSize: '14@ms',
    color: COLORS.textSemiDark,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray825,
    paddingTop: '12@vs',
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    fontSize: '14@ms',
    color: COLORS.black,
    fontWeight: '500',
    marginLeft: '4@s',
  },
  buttonSeparator: {
    width: 1,
    height: '16@vs',
    backgroundColor: COLORS.gray825,
  },
  removeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    fontSize: '14@ms',
    color: COLORS.black,
    fontWeight: '500',
    marginLeft: '4@s',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.infoSurface,
    borderRadius: '10@s',
    marginHorizontal: '16@s',
    marginTop: '10@vs',
    paddingHorizontal: '12@s',
    paddingVertical: '8@vs',
    gap: '8@s',
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
  loaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8@s',
    paddingVertical: '40@vs',
  },
  loaderText: {
    fontSize: '14@ms',
    color: COLORS.textDark,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: '60@vs',
    paddingHorizontal: '40@s',
  },
  emptyText: {
    fontSize: '18@ms',
    fontWeight: '600',
    color: COLORS.textSemiDark,
    marginTop: '20@vs',
    marginBottom: '8@vs',
  },
  emptySubtext: {
    fontSize: '14@ms',
    color: COLORS.textAsh,
    textAlign: 'center',
  },
});
