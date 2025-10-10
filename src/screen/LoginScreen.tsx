import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import React, { useState } from 'react';
import { ScaledSheet } from 'react-native-size-matters';
import { SafeAreaView } from 'react-native-safe-area-context';

const LoginScreen = ({ navigation }: any) => {
  const [phone, setPhone] = useState('');
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>Welcome User,</Text>
        <Text style={styles.subWelcomeText}>Glad to see you!</Text>
        <Text style={styles.instructionText}>
          Enter your phone number to get started on your journey with us!
        </Text>
      </View>

      {/* Phone Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.phoneInput}
          placeholder="+91"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
        <Text style={styles.infoText}>
          We will send a confirmation code on your number, to verify it is you
        </Text>
      </View>

      {/* Continue Button */}
      <TouchableOpacity
        style={styles.continueButton}
        onPress={() => navigation.navigate('OtpScreen')}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>

      {/* Sign Up */}
      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>Don’t have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.signupLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>

      {/* Social Login */}
      <View style={styles.socialContainer}>
        <View style={styles.line} />
        <Text style={styles.orText}>or login with</Text>
        <View style={styles.line} />
      </View>

      <View style={styles.socialButtons}>
        <TouchableOpacity>
          <Image
            source={require('../assets/google.png')}
            style={styles.socialIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image
            source={require('../assets/facebook.png')}
            style={styles.socialIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image
            source={require('../assets/apple.png')}
            style={styles.socialIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>
          By continuing, you agree to our{' '}
          <Text style={styles.linkText}>Terms of Service</Text> and{' '}
          <Text style={styles.linkText}>Privacy Policy</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: '20@s',
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: '5@vs',
  },
  logo: {
    width: '120@ms',
    height: '120@vs',
  },
  welcomeContainer: {
    marginTop: '5@vs',
  },
  welcomeText: {
    fontSize: '20@ms',
    fontWeight: 'bold',
    color: '#000',
  },
  subWelcomeText: {
    fontSize: '20@ms',
    color: '#000',
    fontWeight: 'bold',
    marginTop: '2@vs',
  },
  instructionText: {
    fontSize: '14@ms',
    color: '#000',
    fontWeight: '500',
    marginTop: '8@vs',
  },
  inputContainer: {
    marginTop: '10@vs',
  },
  phoneInput: {
    borderWidth: 1,
    borderColor: '#656565',
    paddingHorizontal: '10@s',
    paddingVertical: '10@vs',
    fontSize: '14@ms',
    color: '#000',
  },
  infoText: {
    fontSize: '12@ms',
    color: '#999',
    marginTop: '6@vs',
  },
  continueButton: {
    backgroundColor: '#1C3452',
    paddingVertical: '12@vs',
    borderRadius: '8@ms',
    alignItems: 'center',
    marginTop: '20@vs',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: '14@ms',
    fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: '5@vs',
  },
  signupText: {
    fontSize: '12@ms',
    color: '#666',
  },
  signupLink: {
    fontSize: '12@ms',
    color: '#000',
    fontWeight: 'bold',
  },
  socialContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: '10@vs',
    justifyContent: 'center',
  },
  line: {
    height: 1,
    backgroundColor: '#000',
    flex: 1,
    marginHorizontal: '10@s',
  },
  orText: {
    fontSize: '12@ms',
    color: '#000',
    fontWeight: '500',
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: '2@vs',
  },
  socialIcon: {
    width: '20@ms',
    height: '20@ms',
    marginHorizontal: '8@s',
  },
  footerContainer: {
    alignItems: 'center',
    paddingVertical: '10@vs',
    marginTop: '60@vs',
    paddingHorizontal: '10@s',
  },
  footerText: {
    fontSize: '12@ms',
    color: '#656565',
    textAlign: 'center',
  },
  linkText: {
    // textDecorationLine: 'underline',
    color: '#000',
    fontWeight: '600',
  },
});
