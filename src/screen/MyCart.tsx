import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet, ms, vs, s } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ion from 'react-native-vector-icons/Ionicons';
import NormalHeader from '../component/NormalHeader';
import ProductCard from '../component/Product';
import AddAddress from './AddAddress';

const bestsellers = [
  {
    id: '1',
    name: 'Screw Assortment Box + Fastener Set',
    originalPrice: 1011,
    discountedPrice: 950,
    image: require('../assets/product1.png'),
  },
  {
    id: '2',
    name: '5 kg cement + Steel Rods',
    originalPrice: 1011,
    discountedPrice: 950,
    image: require('../assets/product2.png'),
  },
  {
    id: '3',
    name: 'Pipes & Fitting (GI pipes, M5)',
    originalPrice: 1011,
    discountedPrice: 950,
    image: require('../assets/product3.png'),
  },
];

const MyCart = ({ navigation }: any) => {
  const [selectedItem, setSelectedItem] = useState(1);

  const cartItems = [
    {
      id: 1,
      title: 'Cinder Blocks / Concrete Hollow Blocks',
      seller: 'Cemex',
      qty: '5 Packs',
      price: 3998,
      oldPrice: 5998,
      deliveryDate: '27 Sept',
      image: require('../assets/product1.png'),
    },
    {
      id: 2,
      title: 'Cinder Blocks / Concrete Hollow Blocks',
      seller: 'Cemex',
      qty: '5 Packs',
      price: 3998,
      oldPrice: 5998,
      deliveryDate: '27 Sept',
      image: require('../assets/product2.png'),
    },
    {
      id: 3,
      title: 'Cinder Blocks / Concrete Hollow Blocks',
      seller: 'Cemex',
      qty: '5 Packs',
      price: 3998,
      oldPrice: 5998,
      deliveryDate: '27 Sept',
      image: require('../assets/product3.png'),
    },
  ];

  const itemTotal = 3998 * cartItems.length;
  const deliveryFees = 150;
  const platformFees = 49;
  const gst = 180;
  const totalAmount = itemTotal + deliveryFees + platformFees + gst;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header Section */}
      <NormalHeader title="Cart" />

      {/* Progress Bar Section */}
      <View style={styles.progressContainer}>
        {/* Shipping Step */}
        <View style={styles.stepContainer}>
          <View style={styles.activeLine} />
          <Text style={styles.activeStep}>Shipping</Text>
        </View>

        {/* Payment Step */}
        <View style={styles.stepContainer}>
          <View style={styles.inactiveLine} />
          <Text style={styles.inactiveStep}>Payment</Text>
        </View>

        {/* Confirmation Step */}
        <View style={styles.stepContainer}>
          <View style={styles.inactiveLine} />
          <Text style={styles.inactiveStep}>Confirmation</Text>
        </View>
      </View>

      {/* Scrollable Cart Items */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: vs(100) }}
        showsVerticalScrollIndicator={false}
      >
        {cartItems.map(item => (
          <View key={item.id} style={styles.cartCard}>
            <View style={styles.rowBetween}>
              <View style={{ flexDirection: 'row', gap: 2 }}>
                <TouchableOpacity
                  onPress={() => setSelectedItem(item.id)}
                  style={[
                    styles.radio,
                    selectedItem === item.id && styles.radioActive,
                  ]}
                >
                  {selectedItem === item.id && (
                    <Icon name="check" size={ms(14)} color="#fff" />
                  )}
                </TouchableOpacity>

                <Image source={item.image} style={styles.cartImage} />
                <View style={styles.cartDetails}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.seller}>Seller - {item.seller}</Text>

                  <Text style={styles.qtyText}>Qty - {item.qty}</Text>

                  <View style={styles.qtyContainer}>
                    <Text style={styles.deliveryText}>
                      Delivery by {item.deliveryDate}
                    </Text>

                    <View style={styles.priceRow}>
                      <Text style={styles.price}>Rs {item.price}</Text>
                      <Text style={styles.oldPrice}>Rs {item.oldPrice}</Text>
                    </View>
                  </View>
                </View>
              </View>
              <TouchableOpacity>
                <Icon name="close" size={ms(20)} color="#000" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Delivery Section */}
        <View style={styles.deliveryContainer}>
          <Text style={styles.deliveryTitle}>
            Delivery To - <Text style={styles.deliveryName}>Rahul Sharma</Text>
          </Text>
          <Text style={styles.deliveryText2}>
            #1235, Street 5, Mumbai, Maharashtra, 16089
          </Text>
          <Text style={styles.deliveryText2}>Mobile - 9876543210</Text>
          <TouchableOpacity
            style={styles.editIcon}
            onPress={() => navigation.navigate(AddAddress)}
          >
            <Icon name="edit" size={ms(18)} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Bill Details */}
        <View style={styles.billContainer}>
          <Text style={styles.billTitle}>BILL DETAILS</Text>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Item Total</Text>
            <Text style={styles.billAmount}>Rs {itemTotal}</Text>
          </View>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery Fees</Text>
            <Text style={styles.billAmount}>Rs {deliveryFees}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Platform Fees</Text>
            <Text style={styles.billAmount}>Rs {platformFees}</Text>
          </View>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>GST</Text>
            <Text style={styles.billAmount}>Rs {gst}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.billRow}>
            <Text style={styles.totalLabel}>To Pay</Text>
            <Text style={styles.totalAmount}>Rs {totalAmount}</Text>
          </View>
        </View>

        {/* BestSellers Product list */}
        <View style={{ marginTop: 10, backgroundColor: '#fff' }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>BESTSELLERS FROM CEMEX</Text>
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => navigation.navigate('ProductList')}
            >
              <Text style={styles.seeAllText}>See all</Text>
              <Ion name="chevron-forward" size={14} color="#858383" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={bestsellers}
            horizontal
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <ProductCard
                item={item}
                variant="horizontal"
                onPress={() =>
                  navigation.navigate('ProductDetail', { product: item })
                }
              />
            )}
            contentContainerStyle={{ paddingVertical: 10, marginLeft: 10 }}
          />
        </View>
      </ScrollView>

      {/* Fixed Bottom Checkout Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={() => navigation.navigate('PaymentConfirmation')}
        >
          <Text style={styles.checkoutText}>Checkout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default MyCart;

const styles = ScaledSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F1F7F8',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: '10@vs',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeLine: {
    width: '40@s',
    height: '4@vs',
    backgroundColor: '#000',
    borderRadius: '2@s',
    marginRight: '6@s',
  },

  inactiveLine: {
    width: '30@s',
    height: '3@vs',
    backgroundColor: '#ccc',
    borderRadius: '2@s',
    marginRight: '6@s',
  },

  activeStep: {
    fontSize: '13@ms',
    fontWeight: '500',
    color: '#000',
    marginRight: '6@s',
  },

  inactiveStep: {
    fontSize: '13@ms',
    color: '#000',
    fontWeight: '500',
    marginRight: '6@s',
  },

  scrollView: {
    flex: 1,
  },
  cartCard: {
    backgroundColor: '#fff',
    borderWidth: 0.8,
    borderColor: '#eee',
    borderRadius: '8@s',
    padding: '10@s',
    marginVertical: '8@vs',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  radio: {
    width: '16@s',
    height: '16@s',
    borderRadius: '2@s',
    borderWidth: 1,
    borderColor: '#aaa',
    marginRight: '4@s',
    justifyContent: 'flex-start',
  },
  radioActive: {
    backgroundColor: '#000',
  },
  cartImage: {
    width: '80@s',
    height: '100@s',
    borderRadius: '6@s',
  },
  cartDetails: {
    marginTop: '2@vs',
    marginLeft: '5@s',
  },
  title: {
    width: '55%',
    fontSize: '12@ms',
    fontWeight: '500',
    color: '#000',
  },
  seller: {
    fontSize: '11@ms',
    color: '#666',
    marginVertical: '2@vs',
  },
  qtyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: '3@vs',
    gap: '25@s',
  },
  qtyText: {
    width: '40%',
    fontSize: '12@ms',
    color: '#000',
    backgroundColor: '#E0E3E4',
    paddingHorizontal: '6@s',
    marginRight: '10@s',
    marginBottom: '2@s',
  },
  deliveryText: {
    fontSize: '10@ms',
    color: '#fff',
    backgroundColor: '#D66651',
    paddingHorizontal: '8@s',
    paddingVertical: '2@vs',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: '13@ms',
    fontWeight: '600',
    color: '#000',
    marginRight: '4@s',
  },
  oldPrice: {
    fontSize: '11@ms',
    color: '#999',
    textDecorationLine: 'line-through',
  },
  deliveryContainer: {
    marginTop: '10@vs',
    backgroundColor: '#fff',
    padding: '12@s',
    paddingHorizontal: '25@s',
    borderRadius: '8@s',
    borderWidth: 0.8,
    borderColor: '#eee',
    position: 'relative',
  },
  deliveryTitle: {
    fontSize: '13@ms',
    color: '#000',
    fontWeight: '900',
  },
  deliveryName: {
    fontWeight: '500',
  },
  deliveryText2: {
    fontSize: '12@ms',
    color: '#000',
    fontWeight: '500',
    marginTop: '3@vs',
  },
  editIcon: {
    position: 'absolute',
    right: '10@s',
    top: '10@vs',
  },
  billContainer: {
    backgroundColor: '#fff',
    borderRadius: '10@s',
    paddingHorizontal: '30@s',
    padding: '10@s',
    marginVertical: '10@vs',
  },
  billTitle: {
    fontSize: '13@ms',
    fontWeight: '700',
    color: '#000',
    marginBottom: '10@vs',
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: '5@vs',
  },
  billLabel: {
    fontSize: '12@ms',
    color: '#000',
    fontWeight: '500',
  },
  billAmount: {
    fontSize: '12@ms',
    color: '#000',
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: '8@vs',
  },
  totalLabel: {
    fontSize: '13@ms',
    fontWeight: '700',
    color: '#000',
  },
  totalAmount: {
    fontSize: '13@ms',
    fontWeight: '900',
    color: '#000',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: '5@vs',
    paddingHorizontal: '8@s',
  },
  sectionTitle: {
    fontSize: '13@ms',
    fontWeight: '700',
    marginTop: '15@vs',
    color: '#000',
  },
  seeAllButton: {
    flexDirection: 'row',
    gap: '2@s',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: '12@ms',
    color: '#858383',
    fontWeight: '400',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    borderTopWidth: 0.5,
    borderColor: '#ddd',
    padding: '10@s',
  },
  checkoutButton: {
    backgroundColor: '#1C3452',
    borderRadius: '8@s',
    alignItems: 'center',
    paddingVertical: '10@vs',
    marginHorizontal: '20@s',
  },
  checkoutText: {
    color: '#fff',
    fontSize: '14@ms',
    fontWeight: '600',
  },
});
