import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';

const OtpScreen = ({ navigation }: any) => {
  const [otp, setOtp] = useState(['', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const inputRefs = useRef<TextInput[]>([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(timer - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 4) inputRefs.current[index + 1]?.focus();
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
        Please enter the code sent to your mobile number *****3210
      </Text>

      {/* Timer */}
      <Text style={styles.timer}>00:{timer < 10 ? `0${timer}` : timer}</Text>

      {/* OTP Boxes */}
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            style={styles.otpBox}
            keyboardType="numeric"
            maxLength={1}
            value={digit}
            onChangeText={text => handleChange(text, index)}
            ref={ref => {
              inputRefs.current[index] = ref!;
            }}
          />
        ))}
      </View>

      {/* Resend Code */}
      <View style={styles.resendContainer}>
        <Text style={styles.resendText}>Didn’t receive code? </Text>
        <TouchableOpacity onPress={() => setTimer(30)}>
          <Text style={styles.resendLink}>Re-send code</Text>
        </TouchableOpacity>
      </View>

      {/* Continue Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('MainTab')}
      >
        <Text style={styles.buttonText}>Continue</Text>
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
    backgroundColor: '#FFFFFF',
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
    color: '#000',
    marginTop: '20@vs',
  },
  subtitle: {
    width: '80%',
    fontSize: '13@ms',
    color: '#777',
    textAlign: 'center',
    marginTop: '8@vs',
  },
  timer: {
    fontSize: '18@ms',
    fontWeight: '700',
    color: '#1C3452',
    marginTop: '15@vs',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginTop: '15@vs',
  },
  otpBox: {
    borderWidth: 1,
    borderColor: '#9E9C9C',
    textAlign: 'center',
    fontSize: '20@ms',
    fontWeight: '600',
    width: '50@s',
    height: '55@vs',
  },
  resendContainer: {
    flexDirection: 'row',
    marginTop: '15@vs',
  },
  resendText: {
    fontSize: '13@ms',
    color: '#777',
  },
  resendLink: {
    fontSize: '13@ms',
    fontWeight: '600',
    color: '#1C3452',
  },
  button: {
    width: '85%',
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
  footerText: {
    fontSize: '11@ms',
    color: '#777',
    textAlign: 'center',
    marginTop: '60@vs',
    width: '85%',
  },
  linkText: {
    color: '#000',
    fontWeight: '600',
  },
});
