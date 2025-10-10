import React from 'react';
import { ScrollView, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import NormalHeader from '../component/NormalHeader';

const Account = () => {
  const userData = {
    fullName: 'Rahul Sharma',
    phoneNumber: '+91 9876543210',
    email: 'rahulsharma@gmail.com',
    gender: 'Female',
    address: '#1235, Street 5, Mumbai, Maharashtra, 16089',
  };

  const handleDeleteAccount = () => console.log('Delete Account pressed');
  const handleLogOut = () => console.log('Log Out pressed');

  const renderDetail = (label: string, value: string) => (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}</Text>
      <View style={styles.inputField}>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <NormalHeader title="Account" />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.detailsContainer}>
          {renderDetail('Full Name', userData.fullName)}
          {renderDetail('Phone Number', userData.phoneNumber)}
          {renderDetail('Email ID', userData.email)}
          {renderDetail('Gender', userData.gender)}
          {renderDetail('Address', userData.address)}
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity onPress={handleDeleteAccount}>
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleLogOut}>
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Account;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    color: '#000',
    marginBottom: '6@vs',
    fontWeight: '500',
  },
  inputField: {
    backgroundColor: '#fff',
    paddingVertical: '10@vs',
    paddingHorizontal: '12@s',
    borderWidth: 0.5,
    borderColor: '#000',
  },
  detailValue: {
    fontSize: '15@ms',
    color: '#000',
    fontWeight: '400',
  },
  actionsContainer: {
    marginBottom: '40@vs',
    paddingHorizontal: '16@s',
  },
  button: {
    paddingVertical: '8@vs',
    borderRadius: '8@s',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16@vs',
  },
  deleteButtonText: { fontSize: '14@ms', color: '#B20808', fontWeight: '600' },
  logoutButtonText: {
    fontSize: '14@ms',
    color: '#000',
    fontWeight: '600',
    marginTop: '5@vs',
  },
});
