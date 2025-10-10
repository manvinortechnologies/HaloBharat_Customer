import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import NormalHeader from '../component/NormalHeader';
import Icon from 'react-native-vector-icons/MaterialIcons';

const OrderDetail = ({ navigation }: any) => {
  const orderData = {
    orderId: '#1278654',
    productName: 'Cinder Blocks / Concrete Hollow Blocks',
    orderDate: '16 Sept, 2025',
    deliveredDate: 'Delivered on 29 Sept, 2025',
    returnTill: 'Return till 28 Sept, 2025',
    deliveryTo: 'Rahul Sharma',
    address: '#1235, Street 5, Mumbai, Maharashtra, 16089',
    mobile: '9876543210',
    paymentMethod: 'Cash on delivery',
    billDetails: [
      { label: 'Item Total', amount: 'Rs 3998' },
      { label: 'Delivery Fees', amount: 'Rs 250' },
      { label: 'Platform Fees', amount: 'Rs 12' },
      { label: 'GST', amount: 'Rs 25' },
      { label: 'To Pay', amount: 'Rs 4285', isTotal: true },
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      <NormalHeader title="My Orders" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Order Card */}
        <View style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderId}>Order ID {orderData.orderId}</Text>
            <Text style={styles.orderDate}>{orderData.orderDate}</Text>
          </View>

          <View style={styles.productContainer}>
            <Image
              source={require('../assets/orderImg1.png')} // replace with your image
              style={styles.productImage}
            />
            <View style={styles.productDetails}>
              <Text style={styles.productName}>{orderData.productName}</Text>
            </View>
          </View>

          <View style={styles.statusContainer}>
            <View style={styles.deliveredBadge}>
              <Text style={styles.badgeText}>{orderData.deliveredDate}</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('ReturnOrder')}
              style={styles.returnBadge}
            >
              <Text style={styles.badgeText}>Return order</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.returnTill}>{orderData.returnTill}</Text>
        </View>

        {/* Delivery Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Delivery To -{' '}
            <Text style={styles.name}>{orderData.deliveryTo}</Text>
          </Text>
          <Text style={styles.text}>{orderData.address}</Text>
          <Text style={styles.text}>Mobile - {orderData.mobile}</Text>
          <Text style={[styles.text, styles.cod]}>
            {orderData.paymentMethod}
          </Text>
        </View>

        {/* Rate & Review */}
        <View style={styles.rateContainer}>
          <View style={styles.starRow}>
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <Icon key={i} name="star-border" size={26} color="#FFB800" />
              ))}
          </View>
          <Text style={styles.rateText}>Rate & Review your order</Text>
        </View>

        {/* Bill Details */}
        <View style={styles.section}>
          <Text style={styles.billTitle}>BILL DETAILS</Text>
          <View style={styles.billBox}>
            {orderData.billDetails.map((item, index) => (
              <View
                key={index}
                style={[styles.billRow, item.isTotal && styles.totalRow]}
              >
                <Text
                  style={[styles.billLabel, item.isTotal && styles.totalText]}
                >
                  {item.label}
                </Text>
                <Text
                  style={[styles.billAmount, item.isTotal && styles.totalText]}
                >
                  {item.amount}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Continue Shopping */}
        <View style={styles.section}>
          <Text style={styles.continueText}>CONTINUING SHOPPING</Text>
          <View style={styles.shopRow}>
            <View style={styles.shopCard}>
              <Image
                source={require('../assets/orderImg2.png')}
                style={styles.shopImage}
              />
              <View style={styles.discountTag}>
                <Text style={styles.discountText}>25% OFF</Text>
              </View>
            </View>
            <View style={styles.shopCard}>
              <Image
                source={require('../assets/orderImg1.png')}
                style={styles.shopImage}
              />
              <View style={styles.discountTag}>
                <Text style={styles.discountText}>25% OFF</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrderDetail;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F7F8',
  },
  scrollContainer: {
    paddingBottom: '30@vs',
  },
  orderCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    padding: '14@s',
    marginVertical: '14@vs',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: '10@vs',
  },
  orderId: {
    fontSize: '12@ms',
    color: '#696969',
    fontWeight: '500',
  },
  orderDate: {
    fontSize: '10@ms',
    color: '#696969',
  },
  productContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '10@vs',
  },
  productImage: {
    width: '70@s',
    height: '45@s',
    borderRadius: '6@s',
    marginRight: '10@s',
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    width: '60%',
    fontSize: '13@ms',
    color: '#000',
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    marginTop: '6@vs',
  },
  deliveredBadge: {
    backgroundColor: '#D66651',
    paddingVertical: '4@vs',
    paddingHorizontal: '8@s',
    marginRight: '8@s',
  },
  returnBadge: {
    backgroundColor: '#D66651',
    paddingVertical: '4@vs',
    paddingHorizontal: '8@s',
  },
  badgeText: {
    fontSize: '9@ms',
    color: '#fff',
  },
  returnTill: {
    fontSize: '10@ms',
    color: '#696969',
    textAlign: 'right',
  },
  section: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: '12@vs',
    marginBottom: '20@vs',
    paddingHorizontal: '20@s',
  },
  sectionTitle: {
    fontSize: '14@ms',
    color: '#000',
    fontWeight: '600',
    marginBottom: '6@vs',
  },
  name: {
    color: '#000',
    fontWeight: '600',
  },
  text: {
    fontSize: '13@ms',
    color: '#333',
    marginBottom: '3@vs',
  },
  cod: {
    color: '#E53935',
    fontWeight: '600',
  },
  rateContainer: {
    alignItems: 'flex-start',
    marginBottom: '20@vs',
    backgroundColor: '#fff',
    paddingHorizontal: '20@s',
    paddingVertical: '10@vs',
  },
  starRow: {
    flexDirection: 'row',
    marginBottom: '6@vs',
  },
  rateText: {
    fontSize: '12@ms',
    color: '#000',
    fontWeight: '500',
  },
  billTitle: {
    fontSize: '14@ms',
    fontWeight: '700',
    color: '#000',
    marginBottom: '10@vs',
  },
  billBox: {
    backgroundColor: '#FFF',
    borderRadius: '8@s',
    paddingHorizontal: '12@s',
    paddingVertical: '8@vs',
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: '6@vs',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  totalRow: {
    borderBottomWidth: 0,
    marginTop: '6@vs',
  },
  billLabel: {
    fontSize: '13@ms',
    color: '#000',
  },
  billAmount: {
    fontSize: '13@ms',
    color: '#000',
  },
  totalText: {
    fontWeight: 'bold',
    color: '#000',
    fontSize: '14@ms',
  },
  continueText: {
    fontSize: '14@ms',
    fontWeight: '700',
    color: '#000',
    marginBottom: '10@vs',
  },
  shopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  shopCard: {
    width: '48%',
    borderRadius: '8@s',
    overflow: 'hidden',
    position: 'relative',
  },
  shopImage: {
    width: '100%',
    height: '100@s',
    resizeMode: 'cover',
  },
  discountTag: {
    position: 'absolute',
    top: '8@vs',
    left: '8@s',
    backgroundColor: '#333',
    borderRadius: '4@s',
    paddingVertical: '2@vs',
    paddingHorizontal: '6@s',
  },
  discountText: {
    fontSize: '10@ms',
    color: '#fff',
    fontWeight: '600',
  },
});
