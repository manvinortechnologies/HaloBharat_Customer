import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/MaterialIcons';
import NormalHeader from '../component/NormalHeader';
import COLORS from '../constants/colors';
import { useNavigation, useRoute } from '@react-navigation/native';
import { createAddress, updateAddress } from '../api/addresses';
import Toast from 'react-native-toast-message';

interface RouteParams {
  address?: {
    id: string | number;
    title?: string;
    full_name?: string;
    phone?: string;
    building?: string;
    locality?: string;
    city?: string;
    state?: string;
    pincode?: string;
    instructions?: string;
    // Fallback for normalized addresses
    name?: string;
    addressLine1?: string;
    addressLine2?: string;
    addressLine3?: string;
    mobile?: string;
    type?: string;
  };
}

const AddAddress = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = (route.params as RouteParams) || {};
  const isEditMode = !!params.address;
  const addressId = params.address?.id;

  const [addressType, setAddressType] = useState('Home');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '+91 ',
    houseNumber: '',
    locality: '',
    pincode: '',
    state: '',
    city: '',
    instructions: '',
  });

  // Populate form when editing
  useEffect(() => {
    if (isEditMode && params.address) {
      const address = params.address;

      // Map address type back from API format
      const typeMap: Record<string, string> = {
        Home: 'Home',
        Work: 'Office',
        Office: 'Office',
        Other: 'Other',
      };

      // Use raw API data if available, otherwise fallback to normalized data
      const addressTitle = address.title || address.type || 'Home';
      const mappedType = typeMap[addressTitle] || 'Home';

      setAddressType(mappedType);
      setFormData({
        fullName: address.full_name || address.name || '',
        phoneNumber: address.phone
          ? `+91 ${address.phone.replace('+91', '').trim()}`
          : address.mobile
          ? `+91 ${address.mobile.replace('+91', '').trim()}`
          : '+91 ',
        houseNumber: address.building || address.addressLine1 || '',
        locality: address.locality || address.addressLine2 || '',
        pincode: address.pincode || '',
        state: address.state || '',
        city: address.city || '',
        instructions: address.instructions || '',
      });
    }
  }, [isEditMode, params.address]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveAddress = async () => {
    if (!isFormValid()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter a valid 10-digit phone number',
      });
      return;
    }

    // Validate phone number
    const phoneNumber = formData.phoneNumber.replace('+91 ', '').trim();
    if (phoneNumber.length !== 10 || !/^\d+$/.test(phoneNumber)) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter a valid 10-digit phone number',
      });
      return;
    }

    setLoading(true);
    try {
      // Map form data to API payload format
      // Map address type: "Office" in UI maps to "Work" in API
      const addressTitle =
        addressType === 'Home'
          ? 'Home'
          : addressType === 'Office'
          ? 'Work'
          : 'Other';

      const payload = {
        title: addressTitle,
        full_name: formData.fullName.trim(),
        phone: phoneNumber,
        building: formData.houseNumber.trim(),
        locality: formData.locality.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        instructions: formData.instructions?.trim() || '',
        latitude: null,
        longitude: null,
        is_default: false,
      };

      if (isEditMode && addressId) {
        await updateAddress(addressId, payload);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Address updated successfully',
        });
        navigation.goBack();
      } else {
        await createAddress(payload);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Address saved successfully',
        });
        navigation.goBack();
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Failed to save address. Please try again.';
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.fullName.trim() &&
      formData.phoneNumber.trim() &&
      formData.houseNumber.trim() &&
      formData.locality.trim() &&
      formData.pincode.trim() &&
      formData.state.trim() &&
      formData.city.trim()
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <NormalHeader title={isEditMode ? 'Edit Address' : 'Add Address'} />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Form Container */}
        <View style={styles.formContainer}>
          {/* Full Name */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Full Name</Text>
            </View>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your name"
              placeholderTextColor={COLORS.gray400}
              value={formData.fullName}
              onChangeText={value => handleInputChange('fullName', value)}
            />
          </View>

          {/* Phone Number */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Phone Number</Text>
            </View>
            <View style={styles.phoneInputContainer}>
              <Text style={styles.phonePrefix}>+91</Text>
              <TextInput
                style={[styles.textInput, styles.phoneInput]}
                placeholder="Enter phone number"
                placeholderTextColor={COLORS.gray400}
                value={formData.phoneNumber.replace('+91 ', '')}
                onChangeText={value =>
                  handleInputChange('phoneNumber', '+91 ' + value)
                }
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>
          </View>

          {/* House/Building/Apartment No. */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>House/Building/Apartment No.</Text>
            </View>
            <TextInput
              style={styles.textInput}
              placeholder="Enter House/Building/Apartment No."
              placeholderTextColor={COLORS.gray400}
              value={formData.houseNumber}
              onChangeText={value => handleInputChange('houseNumber', value)}
            />
          </View>

          {/* Locality/Area/Street/Sector */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Locality/Area/Street/Sector</Text>
            </View>
            <TextInput
              style={styles.textInput}
              placeholder="Enter locality/Area/Street/Sector"
              placeholderTextColor={COLORS.gray400}
              value={formData.locality}
              onChangeText={value => handleInputChange('locality', value)}
            />
          </View>

          {/* Pincode and State Row */}
          <View style={styles.rowContainer}>
            {/* Pincode */}
            <View style={styles.halfInputGroup}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>Pincode</Text>
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="Enter pincode"
                placeholderTextColor={COLORS.gray400}
                value={formData.pincode}
                onChangeText={value => handleInputChange('pincode', value)}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>

            {/* State */}
            <View style={styles.halfInputGroup}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>State</Text>
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="Enter state"
                placeholderTextColor={COLORS.gray400}
                value={formData.state}
                onChangeText={value => handleInputChange('state', value)}
              />
            </View>
          </View>

          {/* City */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>City</Text>
            </View>
            <TextInput
              style={styles.textInput}
              placeholder="Enter city"
              placeholderTextColor={COLORS.gray400}
              value={formData.city}
              onChangeText={value => handleInputChange('city', value)}
            />
          </View>

          {/* Type of Address */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Type of Address</Text>
            </View>
            <View style={styles.addressTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.addressTypeButton,
                  addressType === 'Home' && styles.addressTypeButtonSelected,
                ]}
                onPress={() => setAddressType('Home')}
              >
                <Text
                  style={[
                    styles.addressTypeText,
                    addressType === 'Home' && styles.addressTypeTextSelected,
                  ]}
                >
                  Home
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.addressTypeButton,
                  addressType === 'Office' && styles.addressTypeButtonSelected,
                ]}
                onPress={() => setAddressType('Office')}
              >
                <Text
                  style={[
                    styles.addressTypeText,
                    addressType === 'Office' && styles.addressTypeTextSelected,
                  ]}
                >
                  Office
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Delivery Instructions (Optional) */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Delivery Instructions (Optional)</Text>
            </View>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Add any special delivery instructions"
              placeholderTextColor={COLORS.gray400}
              value={formData.instructions}
              onChangeText={value => handleInputChange('instructions', value)}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Save Address Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            (!isFormValid() || loading) && styles.saveButtonDisabled,
          ]}
          onPress={handleSaveAddress}
          disabled={!isFormValid() || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.saveButtonText}>Save Address</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddAddress;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: '16@s',
  },

  formContainer: {
    marginVertical: '30@vs',
  },
  inputGroup: {
    marginBottom: '20@vs',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '8@vs',
  },
  label: {
    fontSize: '14@ms',
    fontWeight: '600',
    color: COLORS.black,
    marginLeft: '8@s',
  },
  textInput: {
    borderWidth: 0.5,
    borderColor: COLORS.textAsh,
    paddingHorizontal: '12@s',
    paddingVertical: '10@vs',
    fontSize: '14@ms',
    color: COLORS.black,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phonePrefix: {
    fontSize: '14@ms',
    color: COLORS.black,
    fontWeight: '500',
    backgroundColor: COLORS.white,
    paddingVertical: '10@vs',
    paddingLeft: '12@s',
    borderWidth: 0.5,
    borderRightWidth: 0,
    borderColor: COLORS.textAsh,
  },
  phoneInput: {
    flex: 1,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderLeftWidth: 0,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: '20@vs',
  },
  halfInputGroup: {
    width: '48%',
  },
  addressTypeContainer: {
    width: '60%',
    flexDirection: 'row',
    marginTop: '8@vs',
  },
  addressTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: '8@vs',
    borderWidth: 0.5,
    borderColor: COLORS.textAsh,
    marginRight: '8@s',
    backgroundColor: COLORS.white,
  },
  addressTypeButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  addressTypeText: {
    fontSize: '14@ms',
    color: COLORS.textAsh,
    fontWeight: '400',
    marginLeft: '8@s',
  },
  addressTypeTextSelected: {
    color: COLORS.white,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: '16@vs',
    borderRadius: '8@s',
    marginBottom: '30@vs',
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.gray700,
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    fontSize: '18@ms',
    color: COLORS.white,
    fontWeight: '600',
    marginLeft: '8@s',
  },
  textArea: {
    minHeight: '80@vs',
    paddingTop: '10@vs',
  },
});
