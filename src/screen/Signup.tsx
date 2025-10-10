import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';

const Signup = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Heading */}
        <Text style={styles.heading}>Let’s Create a Account</Text>

        {/* Full Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            placeholder="Enter your name"
            placeholderTextColor="#999"
            style={styles.input}
          />
        </View>

        {/* Phone Number */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            placeholder="+91"
            placeholderTextColor="#999"
            style={styles.input}
            keyboardType="phone-pad"
          />
        </View>

        {/* Gender */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Gender</Text>
          <TextInput
            placeholder="Enter gender"
            placeholderTextColor="#999"
            style={styles.input}
          />
        </View>

        {/* Address Section */}
        <Text style={styles.addressTitle}>Add address</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>House/Building/Apartment No.</Text>
          <TextInput
            placeholder="Enter House/Building/Apartment No."
            placeholderTextColor="#999"
            style={styles.input}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Locality/Area/Street/Sector</Text>
          <TextInput
            placeholder="Enter locality/Area/Street/Sector"
            placeholderTextColor="#999"
            style={styles.input}
          />
        </View>

        {/* Pincode & State */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfInput]}>
            <Text style={styles.label}>Pincode</Text>
            <TextInput
              placeholder="Enter pincode"
              placeholderTextColor="#999"
              style={styles.input}
              keyboardType="number-pad"
            />
          </View>
          <View style={[styles.inputGroup, styles.halfInput]}>
            <Text style={styles.label}>State</Text>
            <TextInput
              placeholder="Enter state"
              placeholderTextColor="#999"
              style={styles.input}
            />
          </View>
        </View>

        {/* City */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>City</Text>
          <TextInput
            placeholder="Enter city"
            placeholderTextColor="#999"
            style={styles.input}
          />
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('OtpScreen')}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>

        {/* Already have account */}
        <View style={styles.loginContainer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>
        </View>

        {/* Terms */}
        <Text style={styles.termsText}>
          By continuing, you agree to our{' '}
          <Text style={styles.linkText}>Terms of Service</Text> and{' '}
          <Text style={styles.linkText}>Privacy Policy</Text>.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Signup;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    color: '#000',
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
    color: '#000',
    fontWeight: '500',
    marginBottom: '5@vs',
  },
  input: {
    borderWidth: 0.5,
    borderColor: '#9E9C9C',
    paddingVertical: '10@vs',
    paddingHorizontal: '10@s',
    fontSize: '13@ms',
    color: '#000',
  },
  addressTitle: {
    width: '100%',
    fontSize: '15@ms',
    fontWeight: '600',
    color: '#000',
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
    backgroundColor: '#1C3452',
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: '10@vs',
  },
  footerText: {
    fontSize: '13@ms',
    color: '#777',
  },
  loginText: {
    color: '#000',
    fontWeight: '600',
    marginLeft: '2@ms',
  },
  termsText: {
    fontSize: '11@ms',
    color: '#777',
    textAlign: 'center',
    marginTop: '40@vs',
    width: '90%',
  },
  linkText: {
    color: '#000',
    fontWeight: '600',
  },
});
