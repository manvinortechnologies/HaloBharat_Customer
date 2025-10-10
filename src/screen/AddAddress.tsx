import React, { useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/MaterialIcons';
import NormalHeader from '../component/NormalHeader';

const AddAddress = () => {
  const [addressType, setAddressType] = useState('Home');
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '+91 ',
    houseNumber: '',
    locality: '',
    pincode: '',
    state: '',
    city: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveAddress = () => {
    console.log('Saving address:', { ...formData, addressType });
    // Add your save address logic here
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
      <NormalHeader title="Add Addresses" />
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
              placeholderTextColor="#999"
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
                placeholderTextColor="#999"
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
              placeholderTextColor="#999"
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
              placeholderTextColor="#999"
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
                placeholderTextColor="#999"
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
                placeholderTextColor="#999"
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
              placeholderTextColor="#999"
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
        </View>

        {/* Save Address Button */}
        <TouchableOpacity
          style={[styles.saveButton]}
          onPress={handleSaveAddress}
          disabled={!isFormValid()}
        >
          <Text style={styles.saveButtonText}>Save Address</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddAddress;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    color: '#000',
    marginLeft: '8@s',
  },
  textInput: {
    borderWidth: 0.5,
    borderColor: '#696969',
    paddingHorizontal: '12@s',
    paddingVertical: '10@vs',
    fontSize: '14@ms',
    color: '#000',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phonePrefix: {
    fontSize: '14@ms',
    color: '#000',
    fontWeight: '500',
    backgroundColor: '#fff',
    paddingVertical: '10@vs',
    paddingLeft: '12@s',
    borderWidth: 0.5,
    borderRightWidth: 0,
    borderColor: '#696969',
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
    borderColor: '#696969',
    marginRight: '8@s',
    backgroundColor: '#fff',
  },
  addressTypeButtonSelected: {
    backgroundColor: '#1C3452',
    borderColor: '#1C3452',
  },
  addressTypeText: {
    fontSize: '14@ms',
    color: '#696969',
    fontWeight: '400',
    marginLeft: '8@s',
  },
  addressTypeTextSelected: {
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#1C3452',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: '16@vs',
    borderRadius: '8@s',
    marginBottom: '30@vs',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    fontSize: '18@ms',
    color: '#fff',
    fontWeight: '600',
    marginLeft: '8@s',
  },
});
