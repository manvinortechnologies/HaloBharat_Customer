import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import NormalHeader from '../component/NormalHeader';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

// 1. Define the param list for your stack navigator
type RootStackParamList = {
  MyOrders: undefined;
  OrderDetail: {
    product: {
      image: any;
      name: string;
      description: string;
    };
    orderId: string;
    status: string;
    date: string;
  };
};

import type { StackNavigationProp } from '@react-navigation/stack';

const MyOrders = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const orders = [
    {
      id: 1,
      orderId: '#1278654',
      date: '16 Sept, 2025',
      products: [
        {
          image: require('../assets/orderImg1.png'),
          name: 'Cinder Blocks',
          description: 'Concrete Hollow Blocks',
        },
        {
          image: require('../assets/orderImg2.png'),
          name: 'Cinder Blocks',
          description: 'Concrete Hollow Blocks',
        },
      ],
      status: 'In Transit',
    },
    {
      id: 2,
      orderId: '#1278654',
      date: '16 Sept, 2025',
      products: [
        {
          image: require('../assets/orderImg1.png'),
          name: 'Cinder Blocks',
          description: 'Concrete Hollow Blocks',
        },
        {
          image: require('../assets/orderImg2.png'),
          name: 'Cinder Blocks',
          description: 'Concrete Hollow Blocks',
        },
      ],
      status: 'Delivered on 20 Sept, 2025',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <NormalHeader title="My Orders" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Filter Dropdown */}
        <View style={styles.dropdownContainer}>
          <Text style={styles.dropdownText}>
            This Month <Ionicons name="chevron-down" size={14} color="#000" />
          </Text>
        </View>

        {/* Orders */}
        {orders.map(order => (
          <View key={order.id} style={styles.orderCard}>
            {/* Order Header */}
            <View style={styles.orderHeader}>
              <Text style={styles.orderId}>Order ID {order.orderId}</Text>
              <Text style={styles.orderDate}>{order.date}</Text>
            </View>

            {/* Product List */}
            {order.products.map((product, idx) => (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.8}
                style={styles.productRow}
                onPress={() =>
                  navigation.navigate('OrderDetail', {
                    product,
                    orderId: order.orderId,
                    status: order.status,
                    date: order.date,
                  })
                }
              >
                <View style={styles.leftSection}>
                  <Image source={product.image} style={styles.productImage} />
                </View>

                <View style={styles.rightSection}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productDesc}>{product.description}</Text>
                </View>

                <Icon name="chevron-right" size={24} color="#000" />
              </TouchableOpacity>
            ))}

            {/* Status */}
            {order.status && (
              <View
                style={[
                  styles.statusContainer,
                  order.status.includes('Delivered')
                    ? styles.delivered
                    : styles.inTransit,
                ]}
              >
                <Text style={styles.statusText}>{order.status}</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyOrders;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F7F8',
  },
  scrollContent: {
    paddingBottom: '20@vs',
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderRadius: '8@s',
    paddingVertical: '10@vs',
    paddingHorizontal: '14@s',
    alignSelf: 'flex-start',
    marginHorizontal: '12@s',
    marginTop: '10@vs',
    marginBottom: '15@vs',
    borderWidth: 0.5,
    borderColor: '#B6B6B6',
  },
  dropdownText: {
    fontSize: '12@ms',
    color: '#000',
  },
  orderCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e3e3e3',
    padding: '12@s',
    marginBottom: '16@vs',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
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
    fontSize: '12@ms',
    color: '#696969',
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: '8@s',
    padding: '10@s',
    marginBottom: '8@vs',
    borderBottomWidth: 0.5,
    borderColor: '#B6B6B6',
  },
  leftSection: {
    width: '65@s',
    height: '45@s',
    borderRadius: '8@s',
    overflow: 'hidden',
    marginRight: '10@s',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  rightSection: {
    flex: 1,
  },
  productName: {
    fontSize: '12@ms',
    fontWeight: '600',
    color: '#000',
  },
  productDesc: {
    fontSize: '12@ms',
    color: '#696969',
  },
  statusContainer: {
    width: '40%',
    marginTop: '6@vs',
    marginHorizontal: '10@s',
    alignSelf: 'flex-start',
    paddingVertical: '6@vs',
    borderRadius: '6@s',
    alignItems: 'center',
  },
  inTransit: {
    backgroundColor: '#D66651',
  },
  delivered: {
    backgroundColor: '#D66651',
  },
  statusText: {
    fontSize: '10@ms',
    color: '#fff',
    fontWeight: '500',
  },
});
