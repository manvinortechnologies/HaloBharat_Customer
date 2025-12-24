import {
  ActivityIndicator,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import React, { useMemo, useState } from 'react';
import { ScaledSheet } from 'react-native-size-matters';
import { SafeAreaView } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';
import COLORS from '../constants/colors';

const LoginScreen = ({ navigation }: any) => {
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const formattedPhone = useMemo(() => {
    const trimmed = phone.replace(/\\s+/g, '');
    if (!trimmed) {
      return '';
    }
    if (trimmed.startsWith('+')) {
      return trimmed;
    }
    return `+91${trimmed}`;
  }, [phone]);

  const isPhoneValid = useMemo(
    () => /^(?:\+91)?[1-9][0-9]{9}$/.test(formattedPhone),
    [formattedPhone],
  );

  const handleContinue = async () => {
    if (!formattedPhone || !isPhoneValid) {
      setError('Enter a valid phone number with country code.');
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      const confirmation = await auth().signInWithPhoneNumber(formattedPhone);
      navigation.navigate('OtpScreen', {
        verificationId: confirmation.verificationId,
        phoneNumber: formattedPhone,
      });
    } catch (err: any) {
      const message =
        err?.code === 'auth/invalid-phone-number'
          ? 'The phone number is invalid.'
          : err?.code === 'auth/too-many-requests'
          ? 'Too many attempts. Please try again later.'
          : 'Unable to send verification code. Please try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

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
      {/* Phone Input */}
      <View style={styles.inputContainer}>
        <View style={styles.phoneWrapper}>
          <Text style={styles.prefix}>+91</Text>
          <TextInput
            style={styles.phoneInput}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            maxLength={10}
          />
        </View>
        <Text style={styles.infoText}>
          We will send a confirmation code on your number, to verify it is you
        </Text>
      </View>

      {/* Continue Button */}
      <TouchableOpacity
        style={[
          styles.continueButton,
          (!isPhoneValid || submitting) && styles.disabledButton,
        ]}
        onPress={handleContinue}
        disabled={submitting || !isPhoneValid}
      >
        {submitting ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.continueButtonText}>Continue</Text>
        )}
      </TouchableOpacity>

      {/* Sign Up */}
      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>Don’t have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.signupLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>

      {/* Social Login */}
      {/* <View style={styles.socialContainer}>
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
      </View> */}

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
    backgroundColor: COLORS.white,
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
    color: COLORS.black,
  },
  subWelcomeText: {
    fontSize: '20@ms',
    color: COLORS.black,
    fontWeight: 'bold',
    marginTop: '2@vs',
  },
  instructionText: {
    fontSize: '14@ms',
    color: COLORS.black,
    fontWeight: '500',
    marginTop: '8@vs',
  },
  inputContainer: {
    marginTop: '10@vs',
  },
  phoneWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.textSmoke,
    paddingHorizontal: '10@s',
    paddingVertical: '6@vs',
  },
  prefix: {
    fontSize: '14@ms',
    color: COLORS.black,
    marginRight: '5@s',
  },
  phoneInput: {
    flex: 1,
    fontSize: '14@ms',
    color: COLORS.black,
  },
  errorText: {
    color: COLORS.accentRed,
    fontSize: '12@ms',
    marginTop: '6@vs',
  },
  infoText: {
    fontSize: '12@ms',
    color: COLORS.gray400,
    marginTop: '6@vs',
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: '12@vs',
    borderRadius: '8@ms',
    alignItems: 'center',
    marginTop: '20@vs',
  },
  disabledButton: {
    opacity: 0.6,
  },
  continueButtonText: {
    color: COLORS.white,
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
    color: COLORS.textSubtle,
  },
  signupLink: {
    fontSize: '12@ms',
    color: COLORS.black,
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
    backgroundColor: COLORS.black,
    flex: 1,
    marginHorizontal: '10@s',
  },
  orText: {
    fontSize: '12@ms',
    color: COLORS.black,
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
    color: COLORS.textSmoke,
    textAlign: 'center',
  },
  linkText: {
    // textDecorationLine: 'underline',
    color: COLORS.black,
    fontWeight: '600',
  },
});
