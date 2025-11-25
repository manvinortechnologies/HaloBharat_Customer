import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import { Dropdown } from 'react-native-element-dropdown';
import COLORS from '../constants/colors';
import Loader from '../component/Loader';
import { authAPI } from '../api/auth';

const genderOptions = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
  { label: 'Other', value: 'Other' },
];

const Signup = ({ navigation }: any) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    contact_phone: '',
    gender: '',
    address: '',
    locality: '',
    role: 'Customer',
    status: 'Accepted',
    pincode: '',
    state: '',
    city: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const currentErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      currentErrors.full_name = 'Full name is required.';
    }

    if (!formData.email.trim()) {
      currentErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      currentErrors.email = 'Enter a valid email.';
    }

    if (!formData.password.trim()) {
      currentErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      currentErrors.password = 'Password must be at least 6 characters.';
    }

    if (!formData.contact_phone.trim()) {
      currentErrors.contact_phone = 'Phone number is required.';
    }

    if (!formData.gender.trim()) {
      currentErrors.gender = 'Gender is required.';
    }

    if (!formData.address.trim()) {
      currentErrors.address = 'Address is required.';
    }

    if (!formData.pincode.trim()) {
      currentErrors.pincode = 'Pincode is required.';
    }

    if (!formData.state.trim()) {
      currentErrors.state = 'State is required.';
    }

    if (!formData.city.trim()) {
      currentErrors.city = 'City is required.';
    }

    setErrors(currentErrors);
    return Object.keys(currentErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      await authAPI.register(formData);
      setErrors({});
      navigation.navigate('LoginScreen');
    } catch (error: any) {
      console.error('Signup error:', error);
      setErrors(prev => ({
        ...prev,
        api:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          'Failed to signup. Please try again.',
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.heading}>Let’s Create a Account</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            placeholder="Enter your name"
            placeholderTextColor="#999"
            style={styles.input}
            value={formData.full_name}
            onChangeText={text => handleChange('full_name', text)}
          />
          {errors.full_name ? (
            <Text style={styles.errorText}>{errors.full_name}</Text>
          ) : null}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="Enter your email"
            placeholderTextColor="#999"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.email}
            onChangeText={text => handleChange('email', text)}
          />
          {errors.email ? (
            <Text style={styles.errorText}>{errors.email}</Text>
          ) : null}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            placeholder="Enter your password"
            placeholderTextColor="#999"
            style={styles.input}
            secureTextEntry
            value={formData.password}
            onChangeText={text => handleChange('password', text)}
          />
          {errors.password ? (
            <Text style={styles.errorText}>{errors.password}</Text>
          ) : null}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            placeholder="+91"
            placeholderTextColor="#999"
            style={styles.input}
            keyboardType="phone-pad"
            value={formData.contact_phone}
            onChangeText={text => handleChange('contact_phone', text)}
          />
          {errors.contact_phone ? (
            <Text style={styles.errorText}>{errors.contact_phone}</Text>
          ) : null}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Gender</Text>
          <Dropdown
            data={genderOptions}
            search={false}
            labelField="label"
            valueField="value"
            placeholder="Select Gender"
            placeholderStyle={styles.dropdownPlaceholder}
            value={formData.gender}
            onChange={(item: { label: string; value: string }) =>
              handleChange('gender', item.value)
            }
            style={styles.dropdown}
            selectedTextStyle={styles.dropdownSelectedText}
            containerStyle={styles.dropdownContainer}
            itemTextStyle={styles.dropdownItemText}
          />
          {errors.gender ? (
            <Text style={styles.errorText}>{errors.gender}</Text>
          ) : null}
        </View>

        <Text style={styles.addressTitle}>Add address</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>House/Building/Apartment No.</Text>
          <TextInput
            placeholder="Enter House/Building/Apartment No."
            placeholderTextColor="#999"
            style={styles.input}
            value={formData.address}
            onChangeText={text => handleChange('address', text)}
          />
          {errors.address ? (
            <Text style={styles.errorText}>{errors.address}</Text>
          ) : null}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Locality/Area/Street/Sector</Text>
          <TextInput
            placeholder="Enter locality/Area/Street/Sector"
            placeholderTextColor="#999"
            style={styles.input}
            value={formData.locality}
            onChangeText={text => handleChange('locality', text)}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfInput]}>
            <Text style={styles.label}>Pincode</Text>
            <TextInput
              placeholder="Enter pincode"
              placeholderTextColor="#999"
              style={styles.input}
              keyboardType="number-pad"
              value={formData.pincode}
              onChangeText={text => handleChange('pincode', text)}
            />
            {errors.pincode ? (
              <Text style={styles.errorText}>{errors.pincode}</Text>
            ) : null}
          </View>
          <View style={[styles.inputGroup, styles.halfInput]}>
            <Text style={styles.label}>State</Text>
            <TextInput
              placeholder="Enter state"
              placeholderTextColor="#999"
              style={styles.input}
              value={formData.state}
              onChangeText={text => handleChange('state', text)}
            />
            {errors.state ? (
              <Text style={styles.errorText}>{errors.state}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>City</Text>
          <TextInput
            placeholder="Enter city"
            placeholderTextColor="#999"
            style={styles.input}
            value={formData.city}
            onChangeText={text => handleChange('city', text)}
          />
          {errors.city ? (
            <Text style={styles.errorText}>{errors.city}</Text>
          ) : null}
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Continue</Text>
          )}
        </TouchableOpacity>

        {errors.api ? <Text style={styles.errorText}>{errors.api}</Text> : null}

        <View style={styles.loginContainer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.termsText}>
          By continuing, you agree to our{' '}
          <Text style={styles.linkText}>Terms of Service</Text> and{' '}
          <Text style={styles.linkText}>Privacy Policy</Text>.
        </Text>
      </ScrollView>
      <Loader visible={loading} message="Please wait..." />
    </SafeAreaView>
  );
};

export default Signup;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContainer: {
    alignItems: 'center',
    paddingHorizontal: '20@s',
    paddingBottom: '30@vs',
  },
  logo: {
    width: '100@s',
    height: '100@vs',
  },
  heading: {
    fontSize: '16@ms',
    fontWeight: '700',
    color: COLORS.black,
    marginTop: '5@vs',
    marginBottom: '18@vs',
    alignSelf: 'flex-start',
  },
  inputGroup: {
    width: '100%',
    marginBottom: '12@vs',
  },
  label: {
    fontSize: '11@ms',
    color: COLORS.black,
    fontWeight: '500',
    marginBottom: '5@vs',
  },
  input: {
    borderWidth: 0.5,
    borderColor: COLORS.gray450,
    paddingVertical: '10@vs',
    paddingHorizontal: '10@s',
    fontSize: '13@ms',
    color: COLORS.black,
  },
  addressTitle: {
    width: '100%',
    fontSize: '15@ms',
    fontWeight: '600',
    color: COLORS.black,
    marginVertical: '10@vs',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  halfInput: {
    width: '48%',
  },
  button: {
    width: '100%',
    backgroundColor: COLORS.primary,
    paddingVertical: '13@vs',
    borderRadius: '8@ms',
    alignItems: 'center',
    marginTop: '25@vs',
  },
  buttonText: {
    color: '#FFF',
    fontSize: '16@ms',
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: '10@vs',
  },
  footerText: {
    fontSize: '13@ms',
    color: COLORS.textCool,
  },
  loginText: {
    color: COLORS.black,
    fontWeight: '600',
    marginLeft: '2@ms',
  },
  termsText: {
    fontSize: '11@ms',
    color: COLORS.textCool,
    textAlign: 'center',
    marginTop: '40@vs',
    width: '90%',
  },
  linkText: {
    color: '#000',
    fontWeight: '600',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: '10@ms',
    marginTop: '4@vs',
    alignSelf: 'flex-start',
  },
  dropdown: {
    borderWidth: 0.5,
    borderColor: '#9E9C9C',
    paddingVertical: '10@vs',
    paddingHorizontal: '10@s',
    fontSize: '13@ms',
    minHeight: '40@vs',
  },
  dropdownPlaceholder: {
    fontSize: '13@ms',
    color: '#999',
  },
  dropdownSelectedText: {
    fontSize: '13@ms',
    color: '#000',
  },
  dropdownContainer: {
    borderWidth: 0.5,
    borderColor: '#9E9C9C',
  },
  dropdownItemText: {
    fontSize: '13@ms',
    color: '#000',
  },
});
