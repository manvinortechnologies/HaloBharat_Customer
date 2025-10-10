import React from 'react';
import { ScrollView, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/MaterialIcons';
import NormalHeader from '../component/NormalHeader';
import { useNavigation } from '@react-navigation/native';

const MyAddress = () => {
  const navigation = useNavigation<any>();
  const addresses = [
    {
      id: 1,
      name: 'Rahul Sharma',
      addressLine1: 'House no.1234,sector',
      addressLine2: 'Mumbai,160087',
      addressLine3: 'Mumbai,Maharashtra',
      mobile: '9876543210',
      type: 'Home',
      icon: 'home',
    },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Home':
        return '#D66651';
      case 'Work':
        return '#D66651';
      case 'Other':
        return '#D66651';
      default:
        return '#D66651';
    }
  };

  const handleAddAddress = () => {
    navigation.navigate('AddAddress');
  };

  const handleEditAddress = (addressId: number) => {
    console.log('Edit address:', addressId);
    // Navigate to edit address screen
  };

  const handleRemoveAddress = (addressId: number) => {
    console.log('Remove address:', addressId);
    // Show confirmation and remove address
  };

  return (
    <SafeAreaView style={styles.container}>
      <NormalHeader title="My Addresses" />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Saved Addresses Section */}
        <View style={styles.savedAddressesSection}>
          <Text style={styles.savedAddressesTitle}>Saved Addresses</Text>

          {/* Add Address Button */}
          <TouchableOpacity
            style={styles.addAddressButton}
            onPress={handleAddAddress}
          >
            <Icon name="add" size={18} color="#D66651" />
            <Text style={styles.addAddressText}>Add Address</Text>
          </TouchableOpacity>
        </View>

        {/* Address Cards */}
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
                  <Icon name="edit" size={16} color="#000" />
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>

                <View style={styles.buttonSeparator} />

                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveAddress(address.id)}
                >
                  <Icon name="delete" size={16} color="#000" />
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyAddress;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F7F8',
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
    color: '#000',
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: '6@s',
    paddingVertical: '8@vs',
  },
  addAddressText: {
    fontSize: '14@ms',
    color: '#D66651',
    fontWeight: '500',
    marginLeft: '4@s',
  },
  addressesContainer: {
    marginBottom: '30@vs',
  },
  addressCard: {
    backgroundColor: '#fff',
    paddingHorizontal: '16@s',
    paddingVertical: '8@vs',
    marginBottom: '16@vs',
    borderWidth: 1,
    borderColor: '#e0e0e0',
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
    color: '#fff',
  },
  name: {
    fontSize: '18@ms',
    fontWeight: '600',
    color: '#000',
    marginBottom: '8@vs',
  },
  addressLine: {
    fontSize: '14@ms',
    color: '#333',
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
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
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
    color: '#000',
    fontWeight: '500',
    marginLeft: '4@s',
  },
  buttonSeparator: {
    width: 1,
    height: '16@vs',
    backgroundColor: '#e0e0e0',
  },
  removeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    fontSize: '14@ms',
    color: '#000',
    fontWeight: '500',
    marginLeft: '4@s',
  },
});
