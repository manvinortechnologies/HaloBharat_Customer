import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import auth from '@react-native-firebase/auth';
import COLORS from '../constants/colors';
import { firebaseLogin } from '../api/auth';
import { storeAuthData } from '../storage/authStorage';
import { AuthData } from '../storage/authStorage';
import Toast from 'react-native-toast-message';

const OTP_LENGTH = 6;

const OtpScreen = ({ navigation, route }: any) => {
  const params = route?.params ?? {};
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [timer, setTimer] = useState(30);
  const [verificationId, setVerificationId] = useState<string | null>(
    params?.verificationId ?? null,
  );
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [autoVerifying, setAutoVerifying] = useState(false);
  const inputRefs = useRef<TextInput[]>([]);
  const phoneNumber: string | undefined = params?.phoneNumber;

  useEffect(() => {
    if (!verificationId) {
      navigation.goBack();
    }
  }, [verificationId, navigation]);

  // Handle automatic OTP verification on Android devices
  const handleAuthStateChanged = useCallback(
    async (user: any) => {
      if (user && !verifying && !autoVerifying) {
        // Some Android devices can automatically process the verification code (OTP) message,
        // and the user would NOT need to enter the code.
        // Actually, if he/she tries to enter it, he/she will get an error message because the code was already used in the background.
        // In this function, make sure you hide the component(s) for entering the code and/or navigate away from this screen.
        // It is also recommended to display a message to the user informing him/her that he/she has successfully logged in.
        try {
          setAutoVerifying(true);
          setError('');
          console.log('user', user);
          const idToken = await user.getIdToken(true);
          if (!idToken) {
            throw new Error('Unable to obtain login token. Please retry.');
          }
          try {
            const response = await firebaseLogin(idToken);
            await storeAuthData(response as AuthData);
            Toast.show({
              type: 'success',
              text1: 'Successfully logged in!',
            });
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainTab' }],
            });
          } catch (err: any) {
            console.log('err', err.response?.data?.error);
            if (
              err.response?.data?.error ===
              'You are not registered. Please sign up first.'
            ) {
              Toast.show({
                type: 'error',
                text1: err.response?.data?.error,
              });
              navigation.reset({
                index: 0,
                routes: [
                  { name: 'Signup', params: { phoneNumber, idToken } },
                ],
              });
            } else {
              setError(
                err.response?.data?.error ||
                'Login failed. Please try again.',
              );
            }
          }
        } catch (err: any) {
          console.log('Auto-verification error:', err);
          setError('Auto-verification failed. Please enter the code manually.');
        } finally {
          setAutoVerifying(false);
        }
      }
    },
    [verifying, autoVerifying, phoneNumber, navigation],
  );

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(handleAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, [handleAuthStateChanged]);

  useEffect(() => {
    if (timer <= 0) {
      return;
    }
    const interval = setInterval(
      () => setTimer(prev => (prev > 0 ? prev - 1 : 0)),
      1000,
    );
    return () => clearInterval(interval);
  }, [timer]);

  const maskedPhone = useMemo(() => {
    if (!phoneNumber) {
      return '';
    }
    if (phoneNumber.length <= 4) {
      return phoneNumber;
    }
    const visible = phoneNumber.slice(-4);
    const maskedPrefix = phoneNumber
      .slice(0, phoneNumber.length - 4)
      .replace(/\d/g, '*');
    return `${maskedPrefix}${visible}`;
  }, [phoneNumber]);

  const resetOtpInputs = () => {
    setOtp(Array(OTP_LENGTH).fill(''));
    inputRefs.current[0]?.focus();
  };

  const handleChange = (text: string, index: number) => {
    const digit = text.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setError('');
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (!verificationId || code.length !== OTP_LENGTH) {
      setError('Enter the complete verification code.');
      return;
    }
    try {
      setVerifying(true);
      const credential = auth.PhoneAuthProvider.credential(
        verificationId,
        code,
      );
      await auth().signInWithCredential(credential);
      const idToken = await auth().currentUser?.getIdToken(true);
      if (!idToken) {
        throw new Error('Unable to obtain login token. Please retry.');
      }
      try {
        const response = await firebaseLogin(idToken);
        await storeAuthData(response as AuthData);
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTab' }],
        });

      } catch (err: any) {
        console.log('err', err.response.data?.error);
        if (
          err.response.data?.error ===
          'You are not registered. Please sign up first.'
        ) {
          Toast.show({
            type: 'error',
            text1: err.response.data?.error,
          });
          navigation.reset({
            index: 0,
            routes: [{ name: 'Signup', params: { phoneNumber, idToken } }],
          });
        }
      }
    } catch (err: any) {
      console.log('err', err.response.data?.error);
      setError(
        err.response.data?.error || 'Verification failed. Please retry.',
      );


      Toast.show({
        type: 'error',
        text1: err.response.data?.error,
      });

      resetOtpInputs();
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!phoneNumber) {
      return;
    }
    try {
      setResending(true);
      setError('');
      const confirmation = await auth().signInWithPhoneNumber(
        phoneNumber,
        true,
      );
      setVerificationId(confirmation.verificationId);
      resetOtpInputs();
      setTimer(30);
    } catch (err: any) {
      setError('Unable to resend code right now. Please wait and try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Logo */}
      <Image
        source={require('../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Heading */}
      <Text style={styles.title}>OTP Verification</Text>
      <Text style={styles.subtitle}>
        {phoneNumber
          ? `Please enter the code sent to ${maskedPhone}`
          : 'Please enter the verification code we sent to your phone'}
      </Text>

      {/* Timer */}
      <Text style={styles.timer}>
        00:{timer < 10 ? `0${timer}` : timer.toString().padStart(2, '0')}
      </Text>

      {/* OTP Boxes */}
      {autoVerifying ? (
        <View style={styles.autoVerifyContainer}>
          <ActivityIndicator color={COLORS.primary} size="large" />
          <Text style={styles.autoVerifyText}>
            Automatically verifying your code...
          </Text>
        </View>
      ) : (
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              style={styles.otpBox}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={text => handleChange(text, index)}
              onKeyPress={({ nativeEvent }) =>
                handleKeyPress(nativeEvent.key, index)
              }
              ref={ref => {
                inputRefs.current[index] = ref!;
              }}
              editable={!autoVerifying}
            />
          ))}
        </View>
      )}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Resend Code */}
      <View style={styles.resendContainer}>
        <Text style={styles.resendText}>Didn’t receive code? </Text>
        <TouchableOpacity
          onPress={handleResend}
          disabled={timer > 0 || resending}
        >
          <Text
            style={[
              styles.resendLink,
              (timer > 0 || resending) && styles.disabledText,
            ]}
          >
            {resending
              ? 'Sending...'
              : timer > 0
                ? `Re-send in ${timer}s`
                : 'Re-send code'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Continue Button */}
      <TouchableOpacity
        style={[
          styles.button,
          (verifying || autoVerifying) && styles.disabledButton,
        ]}
        onPress={handleVerify}
        disabled={verifying || autoVerifying}
      >
        {verifying || autoVerifying ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.buttonText}>Continue</Text>
        )}
      </TouchableOpacity>

      {/* Terms */}
      <Text style={styles.footerText}>
        By continuing, you agree to our{' '}
        <Text style={styles.linkText}>Terms of Service</Text> and{' '}
        <Text style={styles.linkText}>Privacy Policy</Text>.
      </Text>
    </SafeAreaView>
  );
};

export default OtpScreen;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    paddingHorizontal: '20@s',
  },
  logo: {
    width: '100@s',
    height: '100@vs',
    marginTop: '20@vs',
  },
  title: {
    fontSize: '20@ms',
    fontWeight: '700',
    color: COLORS.black,
    marginTop: '20@vs',
  },
  subtitle: {
    width: '80%',
    fontSize: '13@ms',
    color: COLORS.textCool,
    textAlign: 'center',
    marginTop: '8@vs',
  },
  timer: {
    fontSize: '18@ms',
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: '15@vs',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: '10@s',
    marginTop: '15@vs',
  },
  otpBox: {
    borderWidth: 1,
    borderColor: COLORS.gray450,
    textAlign: 'center',
    fontSize: '20@ms',
    fontWeight: '600',
    width: '40@s',
    height: '40@vs',
  },
  errorText: {
    color: COLORS.accentRed,
    marginTop: '10@vs',
    fontSize: '13@ms',
  },
  resendContainer: {
    flexDirection: 'row',
    marginTop: '15@vs',
    alignItems: 'center',
  },
  resendText: {
    fontSize: '13@ms',
    color: COLORS.textCool,
  },
  resendLink: {
    fontSize: '13@ms',
    fontWeight: '600',
    color: COLORS.primary,
  },
  disabledText: {
    opacity: 0.6,
  },
  button: {
    width: '85%',
    backgroundColor: COLORS.primary,
    paddingVertical: '13@vs',
    borderRadius: '8@ms',
    alignItems: 'center',
    marginTop: '25@vs',
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: '16@ms',
    fontWeight: '600',
  },
  footerText: {
    fontSize: '11@ms',
    color: COLORS.textCool,
    textAlign: 'center',
    marginTop: '60@vs',
    width: '85%',
  },
  linkText: {
    color: COLORS.black,
    fontWeight: '600',
  },
  autoVerifyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '15@vs',
    paddingVertical: '20@vs',
  },
  autoVerifyText: {
    fontSize: '13@ms',
    color: COLORS.textCool,
    marginTop: '10@vs',
    textAlign: 'center',
  },
});
