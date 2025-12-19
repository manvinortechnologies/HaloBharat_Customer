import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { s, ScaledSheet } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/MaterialIcons';
import NormalHeader from '../component/NormalHeader';
import COLORS from '../constants/colors';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface OrderedProduct {
  id: string;
  sourceId: string;
  productId?: string | null;
  name: string;
  seller?: string | null;
  quantity: number;
  deliveryDate?: string | null;
  imageUrl?: string | null;
  lineTotal?: string | number | null;
}

type PaymentRouteParams = RouteProp<
  {
    PaymentConfirmation: {
      order?: any;
      deliveryAddress?: {
        name?: string;
        addressLine1?: string;
        addressLine2?: string;
        phone?: string;
      };
      paymentMethod?: string;
    };
  },
  'PaymentConfirmation'
>;

const PaymentConfirmation = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<PaymentRouteParams>();
  const fallbackProductImage = useMemo(
    () => require('../assets/product1.png'),
    [],
  );

  const order = route.params?.order ?? null;
  const rawItems: any[] = Array.isArray(order?.items) ? order.items : [];
  const orderedProducts: OrderedProduct[] = useMemo(() => {
    return rawItems.map((item, index) => {
      const sourceId = String(
        item?.id ?? item?.order_item_id ?? item?.product_id ?? `item-${index}`,
      );
      const productId = item?.product_id ? String(item.product_id) : null;
      const quantity = Number(item?.quantity ?? 1);
      const deliveryDate =
        item?.delivery_datetime ?? order?.delivery_datetime ?? null;
      const imageUrl = item?.product_image ?? null;
      const lineTotal = item?.line_total ?? item?.unit_price ?? null;
      return {
        id: sourceId,
        sourceId,
        productId,
        name: item?.product_name ?? item?.name ?? 'Product',
        seller: item?.vendor_name ? `Seller - ${item.vendor_name}` : null,
        quantity,
        deliveryDate,
        imageUrl,
        lineTotal,
      };
    });
  }, [rawItems, order]);

  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedOrderItem, setSelectedOrderItem] =
    useState<OrderedProduct | null>(null);

  const handleAssignPress = (item: OrderedProduct) => {
    setSelectedOrderItem(item);
    setAssignModalVisible(true);
  };

  const closeAssignModal = () => {
    setAssignModalVisible(false);
    setSelectedOrderItem(null);
  };

  const navigateToAssignProject = (action: 'new' | 'existing') => {
    if (!order?.order_id || !selectedOrderItem) {
      closeAssignModal();
      return;
    }
    closeAssignModal();
    navigation.replace('AssignProject', {
      orderId: order.order_id,
      items: rawItems,
      initialItemId: selectedOrderItem.sourceId,
      initialAction: action,
    });
  };

  const paymentMethod =
    route.params?.paymentMethod ?? order?.payment_method ?? 'Cash on Delivery';
  const orderDateRaw =
    order?.delivery_datetime ?? order?.created_at ?? new Date().toISOString();
  const orderDate = new Date(orderDateRaw).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  const deliveryName =
    route.params?.deliveryAddress?.name ??
    (typeof order?.delivery_to === 'string'
      ? order.delivery_to.split(',')[0]
      : 'Customer');
  const deliveryAddressLine =
    route.params?.deliveryAddress?.addressLine1 ??
    order?.delivery_to ??
    'Delivery details unavailable';
  const contactPhone =
    route.params?.deliveryAddress?.phone ??
    order?.contact_phone ??
    'Not provided';
  const totalAmount =
    typeof order?.total_amount === 'number'
      ? order.total_amount.toFixed(2)
      : order?.total_amount ?? '0.00';

  const recommendedProducts = orderedProducts.slice(0, 3);

  const formatCurrency = (value?: string | number | null) => {
    if (value == null) {
      return '--';
    }
    const num =
      typeof value === 'number'
        ? value
        : Number.isNaN(Number(value))
        ? null
        : Number(value);
    if (num == null || Number.isNaN(num)) {
      return `${value}`;
    }
    return `Rs ${num.toFixed(2)}`;
  };

  const handleContinueShopping = () => {
    navigation.replace('MainTab');
  };

  const handleProductPress = (product: OrderedProduct) => {
    if (product.productId) {
      navigation.replace('ProductDetail', { productId: product.productId });
    }
  };

  const formatDeliveryEta = useCallback((isoDate?: string | null) => {
    if (!isoDate) {
      return 'Delivery in 3 days';
    }
    const target = new Date(isoDate);
    if (Number.isNaN(target.getTime())) {
      return 'Delivery in 3 days';
    }
    const now = new Date();
    const diffMs = target.getTime() - now.getTime();
    const days = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    return `Delivery in ${days} day${days === 1 ? '' : 's'}`;
  }, []);

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
            <Icon name="check" size={30} color={COLORS.successBright} />
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
            <View key={product.id}>
              <View style={styles.productCard}>
                <View style={styles.productImageContainer}>
                  {product.imageUrl ? (
                    <Image
                      source={{ uri: product.imageUrl }}
                      style={styles.productImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <MaterialIcons
                      name="image"
                      size={s(40)}
                      color={COLORS.primary}
                    />
                  )}
                </View>
                <View style={styles.productInfo}>
                  <View style={styles.productHeader}>
                    <Text
                      style={styles.productName}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {product.name}
                    </Text>
                    <TouchableOpacity
                      style={styles.assignButton}
                      onPress={() => handleAssignPress(product)}
                    >
                      <Text style={styles.assignButtonText}>Assign</Text>
                    </TouchableOpacity>
                  </View>
                  {product.seller ? (
                    <Text style={styles.productSeller}>{product.seller}</Text>
                  ) : null}
                  <View style={styles.productMeta}>
                    <Text style={styles.productQuantity}>
                      Qty: {product.quantity}
                    </Text>
                  </View>
                  <View style={styles.deliveryBadge}>
                    <Text style={styles.deliveryBadgeText}>
                      {formatDeliveryEta(product.deliveryDate)}
                    </Text>
                  </View>
                </View>
              </View>
              <Text style={styles.productPrice}>
                {formatCurrency(product.lineTotal)}
              </Text>
            </View>
          ))}
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery To - {deliveryName}</Text>
          <Text style={styles.addressText}>{deliveryAddressLine}</Text>
          <Text style={styles.addressText}>Mobile - {contactPhone}</Text>
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
                onPress={() => handleProductPress(product)}
              >
                {product.lineTotal ? (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>
                      {formatCurrency(product.lineTotal)}
                    </Text>
                  </View>
                ) : null}
                <View style={styles.recommendedImageContainer}>
                  {product.imageUrl ? (
                    <Image
                      source={{ uri: product.imageUrl }}
                      style={styles.recommendedImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <MaterialIcons
                      name="image"
                      size={s(80)}
                      color={COLORS.primary}
                    />
                  )}
                </View>

                <View style={styles.recommendedInfo}>
                  <Text style={styles.recommendedName} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <View style={styles.recommendedDeliveryBadge}>
                    <Text style={styles.recommendedDeliveryText}>
                      {formatDeliveryEta(product.deliveryDate)}
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
        visible={assignModalVisible}
        animationType="fade"
        onRequestClose={closeAssignModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.closeIcon}
              onPress={closeAssignModal}
            >
              <Icon name="close" size={22} color={COLORS.black} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Assign Project</Text>
            <Text style={styles.modalSubtitle}>
              {selectedOrderItem
                ? `Assign "${selectedOrderItem.name}" to a project`
                : 'Choose an existing project or create a new one'}
            </Text>
            <View style={{ flexDirection: 'row', gap: 20 }}>
              <TouchableOpacity
                style={styles.modalButtonPrimary}
                onPress={() => navigateToAssignProject('new')}
                disabled={!selectedOrderItem}
              >
                <Text style={styles.modalButtonText}>Add New Project</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonSecondary}
                onPress={() => navigateToAssignProject('existing')}
                disabled={!selectedOrderItem}
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
    backgroundColor: COLORS.gray975,
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
    backgroundColor: COLORS.black,
    borderRadius: '2@s',
    marginRight: '6@s',
  },

  inactiveLine: {
    width: '30@s',
    height: '3@vs',
    backgroundColor: COLORS.gray700,
    borderRadius: '2@s',
    marginRight: '6@s',
  },

  activeStep: {
    fontSize: '13@ms',
    fontWeight: '500',
    color: COLORS.black,
    marginRight: '6@s',
  },

  inactiveStep: {
    fontSize: '13@ms',
    color: COLORS.black,
    fontWeight: '500',
    marginRight: '6@s',
  },

  scrollView: {
    flex: 1,
  },

  successContainer: {
    backgroundColor: COLORS.white,
    padding: '24@s',
    paddingVertical: '10@s',
    alignItems: 'center',
    marginBottom: '2@vs',
  },
  checkmarkCircle: {
    width: '40@s',
    height: '40@s',
    borderRadius: '20@s',
    backgroundColor: COLORS.successSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '16@vs',
  },
  successTitle: {
    fontSize: '12@ms',
    fontWeight: '700',
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: '4@vs',
    lineHeight: '18@vs',
  },
  orderDate: {
    fontSize: '12@ms',
    color: COLORS.textSubtle,
  },
  section: {
    backgroundColor: COLORS.white,
    padding: '16@s',
    marginVertical: '10@vs',
  },
  productCard: {
    flexDirection: 'row',
  },
  productImageContainer: {
    width: '80@s',
    height: '100@s',
    backgroundColor: COLORS.gray1025,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: '8@s',
  },
  productInfo: {
    flex: 1,
    marginLeft: '12@s',
    alignItems: 'flex-start',
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4@vs',
  },
  productName: {
    fontSize: '14@ms',
    width: '75%',
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: '4@vs',
  },
  assignButton: {
    backgroundColor: COLORS.primary,
    borderRadius: '4@s',
    paddingHorizontal: '10@s',
    paddingVertical: '4@vs',
  },
  assignButtonText: {
    color: COLORS.white,
    fontSize: '11@ms',
    fontWeight: '600',
  },
  productSeller: {
    fontSize: '10@ms',
    color: COLORS.textSubtle,
    marginBottom: '6@vs',
  },
  productMeta: {
    // width: '50%',
    // flexDirection: 'row',
    // alignItems: 'center',
    marginBottom: '8@vs',
    backgroundColor: COLORS.gray850,
    paddingHorizontal: '2@s',
  },
  productQuantity: {
    fontSize: '12@ms',
    color: COLORS.black,
    textAlign: 'center',
  },
  deliveryBadge: {
    // alignSelf: 'flex-start',
    backgroundColor: COLORS.accentClay,
    paddingHorizontal: '8@s',
    paddingVertical: '4@vs',
    borderRadius: '4@s',
  },
  deliveryBadgeText: {
    fontSize: '10@ms',
    color: COLORS.white,
    fontWeight: '600',
  },
  productPrice: {
    fontSize: '15@ms',
    fontWeight: '700',
    color: COLORS.black,
    alignSelf: 'flex-end',
  },
  sectionTitle: {
    fontSize: '14@ms',
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: '8@vs',
  },
  addressText: {
    fontSize: '13@ms',
    color: COLORS.black,
    fontWeight: '500',
    marginBottom: '4@vs',
    lineHeight: '18@vs',
  },
  paymentMethod: {
    fontSize: '13@ms',
    color: COLORS.accentClay,
    marginTop: '8@vs',
    fontWeight: '500',
  },
  continueSection: {
    backgroundColor: COLORS.white,
    paddingVertical: '16@vs',
    marginBottom: '20@vs',
  },
  continueSectionTitle: {
    fontSize: '14@ms',
    fontWeight: '700',
    color: COLORS.black,
    paddingHorizontal: '16@s',
    marginBottom: '16@vs',
  },
  recommendedList: {
    paddingHorizontal: '16@s',
  },
  recommendedCard: {
    width: '160@s',
    backgroundColor: COLORS.white,
    borderRadius: '12@s',
    marginRight: '12@s',
    marginBottom: '10@vs',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: COLORS.black,
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
    backgroundColor: COLORS.primary,
    paddingHorizontal: '8@s',
    paddingVertical: '4@vs',
    borderRadius: '4@s',
    zIndex: 2,
  },
  discountText: {
    color: COLORS.white,
    fontSize: '11@ms',
    fontWeight: '600',
  },
  recommendedImageContainer: {
    width: '100%',
    height: '140@vs',
    backgroundColor: COLORS.gray1025,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendedImage: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: '100@vs',
    right: '8@s',
    backgroundColor: COLORS.white,
    borderRadius: '20@s',
    padding: '6@s',
    elevation: 2,
    shadowColor: COLORS.black,
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
    color: COLORS.black,
    marginBottom: '4@vs',
    lineHeight: '16@vs',
  },
  recommendedDescription: {
    fontSize: '11@ms',
    color: COLORS.textSubtle,
    marginBottom: '8@vs',
  },
  recommendedDeliveryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accentClay,
    paddingHorizontal: '8@s',
    paddingVertical: '4@vs',
    borderRadius: '4@s',
  },
  recommendedDeliveryText: {
    fontSize: '10@ms',
    color: COLORS.white,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlayStrong,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: COLORS.white,
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
    color: COLORS.black,
    marginTop: '10@vs',
  },
  modalSubtitle: {
    fontSize: '11@ms',
    color: COLORS.textAsh,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: '4@vs',
    marginBottom: '20@vs',
  },
  modalButtonPrimary: {
    backgroundColor: COLORS.primary,
    borderRadius: '6@s',
    width: '45%',
    paddingVertical: '8@vs',
    marginBottom: '10@vs',
  },
  modalButtonText: {
    color: COLORS.white,
    textAlign: 'center',
    fontSize: '13@ms',
    fontWeight: '600',
  },
  modalButtonSecondary: {
    backgroundColor: COLORS.primary,
    borderRadius: '6@s',
    width: '45%',
    paddingVertical: '8@vs',
    marginBottom: '10@vs',
  },
  modalButtonSecondaryText: {
    color: COLORS.white,
    textAlign: 'center',
    fontSize: '13@ms',
    fontWeight: '600',
  },
});
