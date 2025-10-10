import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/MaterialIcons';
import NormalHeader from '../component/NormalHeader';

interface OrderedProduct {
  id: string;
  name: string;
  seller: string;
  quantity: number;
  deliveryDate: string;
  image: any;
}

interface DeliveryAddress {
  name: string;
  addressLine1: string;
  addressLine2: string;
  mobile: string;
}

interface RecommendedProduct {
  id: string;
  name: string;
  description: string;
  image: any;
  discount: string;
  deliveryDays: string;
}

const PaymentConfirmation = ({ navigation }: any) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleAssignPress = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };
  const orderDate = '20 Sept, 2025 / 12:45 Pm';
  const totalAmount = 4285;
  const paymentMethod = 'Cash on delivery';

  const deliveryAddress: DeliveryAddress = {
    name: 'Rahul Sharma',
    addressLine1: '#1235, Street 5, Mumbai, Maharashtra, 16089',
    addressLine2: '',
    mobile: '9876543210',
  };

  const orderedProducts: OrderedProduct[] = [
    {
      id: '1',
      name: 'Cinder Blocks / Concrete Hollow Blocks',
      seller: 'Seller - Cemex',
      quantity: 5,
      deliveryDate: 'Delivery by 27 Sept',
      image: require('../assets/product1.png'),
    },
  ];

  const recommendedProducts: RecommendedProduct[] = [
    {
      id: '1',
      name: 'Cinder Blocks / Concrete Hollow Blocks',
      description: 'Essential safety and tool kit for construction',
      image: require('../assets/product2.png'),
      discount: '22% Off',
      deliveryDays: 'Delivery in 3 days',
    },
    {
      id: '2',
      name: 'TMT Steel Bars (Rebar / Sariya)',
      description: 'Essential safety and tool kit for construction',
      image: require('../assets/product3.png'),
      discount: '22% Off',
      deliveryDays: 'Delivery in 3 days',
    },
  ];

  const handleContinueShopping = () => {
    // Navigate to home or products page
    console.log('Continue shopping');
  };

  const handleProductPress = (productId: string) => {
    // Navigate to product details
    console.log('Product pressed:', productId);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <NormalHeader title="" />

      {/* Progress Bar Section */}
      <View style={styles.progressContainer}>
        {/* Shipping Step */}
        <View style={styles.stepContainer}>
          <View style={styles.activeLine} />
          <Text style={styles.activeStep}>Shipping</Text>
        </View>

        {/* Payment Step */}
        <View style={styles.stepContainer}>
          <View style={styles.activeLine} />
          <Text style={styles.activeStep}>Payment</Text>
        </View>

        {/* Confirmation Step */}
        <View style={styles.stepContainer}>
          <View style={styles.activeLine} />
          <Text style={styles.activeStep}>Confirmation</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Message */}
        <View style={styles.successContainer}>
          <View style={styles.checkmarkCircle}>
            <Icon name="check" size={30} color="#4CAF50" />
          </View>
          <Text style={styles.successTitle}>
            GREAT NEWS! YOUR ORDER IS CONFIRMED. GET READY TO RECEIVE YOUR ITEMS
            SOON 📦
          </Text>
          <Text style={styles.orderDate}>{orderDate}</Text>
        </View>

        {/* Ordered Products */}
        <View style={styles.section}>
          {orderedProducts.map(product => (
            <View key={product.id} style={styles.productCard}>
              <Image
                source={product.image}
                style={styles.productImage}
                resizeMode="cover"
              />
              <View style={styles.productInfo}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={styles.productName}>{product.name}</Text>
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#1C3452',
                      width: 50,
                      height: 20,
                      borderRadius: 2,
                    }}
                    onPress={handleAssignPress}
                  >
                    <Text
                      style={{
                        color: '#fff',
                        fontSize: 12,
                        textAlign: 'center',
                      }}
                    >
                      Assign
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.productSeller}>{product.seller}</Text>
                <View style={styles.productMeta}>
                  <Text style={styles.productQuantity}>
                    Qty: {product.quantity} Packs
                  </Text>
                  <Icon name="keyboard-arrow-down" size={20} color="#000" />
                </View>
                <View style={styles.deliveryBadge}>
                  <Text style={styles.deliveryBadgeText}>
                    {product.deliveryDate}
                  </Text>
                </View>
              </View>
              <Text style={styles.productPrice}>Rs {totalAmount}</Text>
            </View>
          ))}
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Delivery To - {deliveryAddress.name}
          </Text>
          <Text style={styles.addressText}>{deliveryAddress.addressLine1}</Text>
          <Text style={styles.addressText}>
            Mobile - {deliveryAddress.mobile}
          </Text>
          <Text style={styles.paymentMethod}>{paymentMethod}</Text>
        </View>

        {/* Continue Shopping Section */}
        <View style={styles.continueSection}>
          <Text style={styles.continueSectionTitle}>CONTINUING SHOPPING</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recommendedList}
          >
            {recommendedProducts.map(product => (
              <TouchableOpacity
                key={product.id}
                style={styles.recommendedCard}
                onPress={() => handleProductPress(product.id)}
              >
                {/* Discount Badge */}
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{product.discount}</Text>
                </View>

                {/* Product Image */}
                <Image
                  source={product.image}
                  style={styles.recommendedImage}
                  resizeMode="cover"
                />

                {/* Favorite Button */}
                <TouchableOpacity style={styles.favoriteButton}>
                  <Icon name="favorite-border" size={18} color="#666" />
                </TouchableOpacity>

                {/* Product Info */}
                <View style={styles.recommendedInfo}>
                  <Text style={styles.recommendedName} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <Text style={styles.recommendedDescription} numberOfLines={1}>
                    {product.description}
                  </Text>
                  <View style={styles.recommendedDeliveryBadge}>
                    <Text style={styles.recommendedDeliveryText}>
                      {product.deliveryDays}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Modal for Assign Project */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Close Button */}
            <TouchableOpacity style={styles.closeIcon} onPress={closeModal}>
              <Icon name="close" size={22} color="#000" />
            </TouchableOpacity>

            {/* Title and Subtitle */}
            <Text style={styles.modalTitle}>Assign Project</Text>
            <Text style={styles.modalSubtitle}>
              Choose an existing project or create a new one
            </Text>

            {/* Buttons */}
            <View style={{ flexDirection: 'row', gap: 20 }}>
              <TouchableOpacity
                style={styles.modalButtonPrimary}
                onPress={() => navigation.navigate('AssignProject')}
              >
                <Text style={styles.modalButtonText}>Add New Project</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalButtonSecondary}
                onPress={() => navigation.navigate('AssignProject')}
              >
                <Text style={styles.modalButtonSecondaryText}>
                  Existing Project
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default PaymentConfirmation;

const styles = ScaledSheet.create({
  container: {
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

  successContainer: {
    backgroundColor: '#fff',
    padding: '24@s',
    paddingVertical: '10@s',
    alignItems: 'center',
    marginBottom: '2@vs',
  },
  checkmarkCircle: {
    width: '40@s',
    height: '40@s',
    borderRadius: '20@s',
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '16@vs',
  },
  successTitle: {
    fontSize: '12@ms',
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginBottom: '4@vs',
    lineHeight: '18@vs',
  },
  orderDate: {
    fontSize: '12@ms',
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    padding: '16@s',
    marginVertical: '10@vs',
  },
  productCard: {
    flexDirection: 'row',
  },
  productImage: {
    width: '80@s',
    height: '100@s',
    borderRadius: '8@s',
    backgroundColor: '#F5F5F5',
  },
  productInfo: {
    flex: 1,
    marginLeft: '12@s',
  },
  productName: {
    fontSize: '14@ms',
    fontWeight: '600',
    color: '#000',
    marginBottom: '4@vs',
  },
  productSeller: {
    fontSize: '10@ms',
    color: '#666',
    marginBottom: '6@vs',
  },
  productMeta: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '8@vs',
    backgroundColor: '#E0E3E4',
    paddingHorizontal: '2@s',
  },
  productQuantity: {
    fontSize: '12@ms',
    color: '#000',
    textAlign: 'center',
  },
  deliveryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#D66651',
    paddingHorizontal: '8@s',
    paddingVertical: '4@vs',
    borderRadius: '4@s',
  },
  deliveryBadgeText: {
    fontSize: '10@ms',
    color: '#fff',
    fontWeight: '600',
  },
  productPrice: {
    fontSize: '15@ms',
    fontWeight: '700',
    color: '#000',
    alignSelf: 'flex-end',
  },
  sectionTitle: {
    fontSize: '14@ms',
    fontWeight: '700',
    color: '#000',
    marginBottom: '8@vs',
  },
  addressText: {
    fontSize: '13@ms',
    color: '#000',
    fontWeight: '500',
    marginBottom: '4@vs',
    lineHeight: '18@vs',
  },
  paymentMethod: {
    fontSize: '13@ms',
    color: '#D66651',
    marginTop: '8@vs',
    fontWeight: '500',
  },
  continueSection: {
    backgroundColor: '#fff',
    paddingVertical: '16@vs',
    marginBottom: '20@vs',
  },
  continueSectionTitle: {
    fontSize: '14@ms',
    fontWeight: '700',
    color: '#000',
    paddingHorizontal: '16@s',
    marginBottom: '16@vs',
  },
  recommendedList: {
    paddingHorizontal: '16@s',
  },
  recommendedCard: {
    width: '160@s',
    backgroundColor: '#fff',
    borderRadius: '12@s',
    marginRight: '12@s',
    marginBottom: '10@vs',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  discountBadge: {
    position: 'absolute',
    top: '8@vs',
    backgroundColor: '#1C3452',
    paddingHorizontal: '8@s',
    paddingVertical: '4@vs',
    borderRadius: '4@s',
    zIndex: 2,
  },
  discountText: {
    color: '#fff',
    fontSize: '11@ms',
    fontWeight: '600',
  },
  recommendedImage: {
    width: '100%',
    height: '140@vs',
    backgroundColor: '#F5F5F5',
  },
  favoriteButton: {
    position: 'absolute',
    top: '100@vs',
    right: '8@s',
    backgroundColor: '#fff',
    borderRadius: '20@s',
    padding: '6@s',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    zIndex: 2,
  },
  recommendedInfo: {
    padding: '12@s',
  },
  recommendedName: {
    fontSize: '13@ms',
    fontWeight: '600',
    color: '#000',
    marginBottom: '4@vs',
    lineHeight: '16@vs',
  },
  recommendedDescription: {
    fontSize: '11@ms',
    color: '#666',
    marginBottom: '8@vs',
  },
  recommendedDeliveryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#D66651',
    paddingHorizontal: '8@s',
    paddingVertical: '4@vs',
    borderRadius: '4@s',
  },
  recommendedDeliveryText: {
    fontSize: '10@ms',
    color: '#fff',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: '20@s',
    padding: '20@s',
    alignItems: 'center',
    elevation: 5,
  },
  closeIcon: {
    position: 'absolute',
    top: '10@s',
    right: '10@s',
    zIndex: 1,
  },
  modalTitle: {
    fontSize: '16@ms',
    fontWeight: '700',
    color: '#000',
    marginTop: '10@vs',
  },
  modalSubtitle: {
    fontSize: '11@ms',
    color: '#696969',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: '4@vs',
    marginBottom: '20@vs',
  },
  modalButtonPrimary: {
    backgroundColor: '#1C3452',
    borderRadius: '6@s',
    width: '45%',
    paddingVertical: '8@vs',
    marginBottom: '10@vs',
  },
  modalButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: '13@ms',
    fontWeight: '600',
  },
  modalButtonSecondary: {
    backgroundColor: '#1C3452',
    borderRadius: '6@s',
    width: '45%',
    paddingVertical: '8@vs',
    marginBottom: '10@vs',
  },
  modalButtonSecondaryText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: '13@ms',
    fontWeight: '600',
  },
});
