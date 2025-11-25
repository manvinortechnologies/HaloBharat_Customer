import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { s, ScaledSheet } from 'react-native-size-matters';
import NormalHeader from '../component/NormalHeader';
import Icon from 'react-native-vector-icons/MaterialIcons';
import COLORS from '../constants/colors';
import { RouteProp, useRoute } from '@react-navigation/native';
import { getOrderDetail } from '../api/orders';
import Ionicons from 'react-native-vector-icons/Ionicons';

const OrderDetail = ({ navigation }: any) => {
  const route =
    useRoute<RouteProp<{ OrderDetail: { orderId: string } }, any>>();
  const orderId = route.params?.orderId;
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fallbackImage = useMemo(() => require('../assets/orderImg1.png'), []);

  const formatDate = useCallback((value?: string) => {
    if (!value) {
      return '';
    }
    const date = new Date(value);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }, []);

  const fetchOrderDetail = useCallback(
    async (mode: 'default' | 'refresh' = 'default') => {
      if (!orderId) {
        setError('Missing order id');
        return;
      }
      if (mode === 'refresh') {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        setError(null);
        const payload = await getOrderDetail(orderId);
        setOrder(payload);
      } catch (err: any) {
        setError(err?.message || 'Unable to load order details.');
        setOrder(null);
      } finally {
        if (mode === 'refresh') {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [orderId],
  );

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  const items = useMemo(
    () => (Array.isArray(order?.items) ? order?.items : []),
    [order?.items],
  );
  const status = order?.status_display ?? order?.status ?? 'Pending';
  const amountFormat = (value?: string | number) => {
    if (typeof value === 'number') return `₹${value.toFixed(2)}`;
    if (!value) return '₹0.00';
    return `₹${Number(value).toFixed(2)}`;
  };

  const getItemStatusStyle = (itemStatus: string) => {
    const statusLower = itemStatus.toLowerCase();
    if (
      statusLower.includes('delivered') ||
      statusLower.includes('completed') ||
      statusLower.includes('success')
    ) {
      return styles.itemStatusDelivered;
    }
    if (
      statusLower.includes('shipped') ||
      statusLower.includes('transit') ||
      statusLower.includes('dispatched')
    ) {
      return styles.itemStatusShipped;
    }
    if (
      statusLower.includes('processing') ||
      statusLower.includes('preparing') ||
      statusLower.includes('confirmed')
    ) {
      return styles.itemStatusProcessing;
    }
    if (statusLower.includes('cancelled') || statusLower.includes('canceled')) {
      return styles.itemStatusCancelled;
    }
    // Default: Pending
    return styles.itemStatusPending;
  };

  const handleAssignNavigation = useCallback(
    (product: any, action: 'new' | 'existing') => {
      if (!product) {
        return;
      }
      const targetId = product?.id ?? product?.product_id;
      if (!targetId) {
        Alert.alert(
          'Unavailable',
          'No order item identifier found for this product.',
        );
        return;
      }
      navigation.navigate('AssignProject', {
        orderId: order?.order_id ?? orderId,
        items,
        initialItemId: String(targetId),
        initialAction: action,
      });
    },
    [navigation, order?.order_id, orderId, items],
  );

  return (
    <SafeAreaView style={styles.container}>
      <NormalHeader title="Order Details" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchOrderDetail('refresh')}
            tintColor={COLORS.primary}
          />
        }
      >
        {error && !loading ? (
          <TouchableOpacity
            style={styles.errorBanner}
            onPress={() => fetchOrderDetail()}
          >
            <Icon name="error-outline" size={20} color={COLORS.accentRed} />
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.retryText}>Tap to retry</Text>
          </TouchableOpacity>
        ) : null}

        {loading && !order ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loaderText}>Loading order details...</Text>
          </View>
        ) : null}

        {order ? (
          <>
            <View style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>
                  Order ID {order?.order_id ?? orderId}
                </Text>
                <Text style={styles.orderDate}>
                  {formatDate(order?.created_at ?? order?.delivery_datetime)}
                </Text>
              </View>

              {items.map((product: any, idx: number) => (
                <View key={product?.id ?? product?.product_id ?? idx}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.productRow}
                  >
                    <View style={styles.leftSection}>
                      {product?.product_image ? (
                        <Image
                          source={
                            product?.product_image
                              ? { uri: product.product_image }
                              : fallbackImage
                          }
                          style={styles.productImage}
                        />
                      ) : (
                        <Ionicons
                          name="image-outline"
                          size={s(50)}
                          color={COLORS.primary}
                        />
                      )}
                    </View>
                    <View style={styles.rightSection}>
                      <Text style={styles.productName}>
                        {product?.product_name ?? 'Product'}
                      </Text>
                      <Text style={styles.productMeta}>
                        {product?.vendor_name ?? ''}
                      </Text>
                      <Text style={styles.productMeta}>
                        Qty: {product?.quantity ?? 1}
                      </Text>
                      <Text style={styles.productMeta}>
                        Line Total: {amountFormat(product?.line_total)}
                      </Text>
                    </View>
                    <View style={styles.statusSection}>
                      <View
                        style={[
                          styles.itemStatusBadge,
                          getItemStatusStyle(product?.status ?? 'Pending'),
                        ]}
                      >
                        <Text style={styles.itemStatusText}>
                          {product?.status
                            ? product.status.charAt(0).toUpperCase() +
                              product.status.slice(1).toLowerCase()
                            : 'Pending'}
                        </Text>
                      </View>
                      <Icon
                        name="chevron-right"
                        size={20}
                        color={COLORS.gray700}
                        style={styles.chevronIcon}
                      />
                    </View>
                  </TouchableOpacity>
                  <View style={styles.assignButtonRow}>
                    <TouchableOpacity
                      style={styles.assignButton}
                      onPress={() => handleAssignNavigation(product, 'new')}
                    >
                      <Text style={styles.assignButtonText}>
                        Add New Project
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.assignButton}
                      onPress={() =>
                        handleAssignNavigation(product, 'existing')
                      }
                    >
                      <Text style={styles.assignButtonText}>
                        Add to Existing Project
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {idx !== items.length - 1 ? (
                    <View style={styles.dashedLine} />
                  ) : null}
                </View>
              ))}

              <View
                style={[
                  styles.statusContainer,
                  status.toLowerCase().includes('delivered')
                    ? styles.delivered
                    : styles.inTransit,
                ]}
              >
                <Text style={styles.statusText}>{status}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Delivery To -{' '}
                <Text style={styles.name}>
                  {order?.delivery_to?.split(',')[0] ?? 'Customer'}
                </Text>
              </Text>
              <Text style={styles.text}>{order?.delivery_to}</Text>
              {order?.contact_phone ? (
                <Text style={styles.text}>Mobile - {order.contact_phone}</Text>
              ) : null}
              <Text style={[styles.text, styles.cod]}>
                {order?.payment_method ?? 'Cash on Delivery'}
              </Text>
              {order?.note ? (
                <Text style={styles.text}>Note - {order.note}</Text>
              ) : null}
            </View>

            <View style={styles.section}>
              <Text style={styles.billTitle}>BILL DETAILS</Text>
              <View style={styles.billBox}>
                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Item Total</Text>
                  <Text style={styles.billAmount}>
                    {amountFormat(order?.subtotal)}
                  </Text>
                </View>
                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Shipping</Text>
                  <Text style={styles.billAmount}>
                    {amountFormat(order?.shipping_amount)}
                  </Text>
                </View>
                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Tax</Text>
                  <Text style={styles.billAmount}>
                    {amountFormat(order?.tax_amount)}
                  </Text>
                </View>
                <View style={[styles.billRow, styles.totalRow]}>
                  <Text style={[styles.billLabel, styles.totalText]}>
                    Grand Total
                  </Text>
                  <Text style={[styles.billAmount, styles.totalText]}>
                    {amountFormat(order?.total_amount)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.rateContainer}>
              <View style={styles.starRow}>
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Icon
                      key={i}
                      name="star-border"
                      size={26}
                      color={COLORS.accentYellow}
                    />
                  ))}
              </View>
              <Text style={styles.rateText}>Rate & Review your order</Text>
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrderDetail;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray975,
  },
  scrollContainer: {
    paddingBottom: '30@vs',
  },
  orderCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray900,
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
    color: COLORS.textAsh,
    fontWeight: '500',
  },
  orderDate: {
    fontSize: '10@ms',
    color: COLORS.textAsh,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productName: {
    width: '60%',
    fontSize: '13@ms',
    color: COLORS.black,
    fontWeight: '500',
  },
  productMeta: {
    fontSize: '11@ms',
    color: COLORS.textAsh,
  },
  dashedLine: {
    borderBottomWidth: 1,
    borderColor: COLORS.gray850,
    borderStyle: 'dashed',
    marginVertical: '8@vs',
  },
  statusContainer: {
    marginTop: '8@vs',
    paddingVertical: '6@vs',
    paddingHorizontal: '12@s',
    borderRadius: '8@s',
    alignSelf: 'flex-start',
  },
  inTransit: {
    backgroundColor: COLORS.accentClay,
  },
  delivered: {
    backgroundColor: COLORS.success ?? COLORS.primary,
  },
  statusText: {
    fontSize: '10@ms',
    color: COLORS.white,
    fontWeight: '600',
  },
  section: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray925,
    paddingTop: '12@vs',
    marginBottom: '20@vs',
    paddingHorizontal: '20@s',
  },
  sectionTitle: {
    fontSize: '14@ms',
    color: COLORS.black,
    fontWeight: '600',
    marginBottom: '6@vs',
  },
  name: {
    color: COLORS.black,
    fontWeight: '600',
  },
  text: {
    fontSize: '13@ms',
    color: COLORS.textSemiDark,
    marginBottom: '3@vs',
  },
  cod: {
    color: COLORS.accentCrimson,
    fontWeight: '600',
  },
  rateContainer: {
    alignItems: 'flex-start',
    marginBottom: '20@vs',
    backgroundColor: COLORS.white,
    paddingHorizontal: '20@s',
    paddingVertical: '10@vs',
  },
  starRow: {
    flexDirection: 'row',
    marginBottom: '6@vs',
  },
  rateText: {
    fontSize: '12@ms',
    color: COLORS.black,
    fontWeight: '500',
  },
  billTitle: {
    fontSize: '14@ms',
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: '10@vs',
  },
  billBox: {
    backgroundColor: COLORS.white,
    borderRadius: '8@s',
    paddingHorizontal: '12@s',
    paddingVertical: '8@vs',
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: '6@vs',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray825,
  },
  totalRow: {
    borderBottomWidth: 0,
    marginTop: '6@vs',
  },
  billLabel: {
    fontSize: '13@ms',
    color: COLORS.black,
  },
  billAmount: {
    fontSize: '13@ms',
    color: COLORS.black,
  },
  totalText: {
    fontWeight: 'bold',
    color: COLORS.black,
    fontSize: '14@ms',
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: '10@vs',
  },
  leftSection: {
    width: '65@s',
    height: '45@s',
    borderRadius: '8@s',
    overflow: 'hidden',
    marginRight: '10@s',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
    gap: '4@vs',
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8@s',
  },
  itemStatusBadge: {
    paddingVertical: '4@vs',
    paddingHorizontal: '10@s',
    borderRadius: '12@s',
    minWidth: '70@s',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemStatusPending: {
    backgroundColor: COLORS.accentClay,
  },
  itemStatusProcessing: {
    backgroundColor: COLORS.infoSurface,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  itemStatusShipped: {
    backgroundColor: COLORS.accentClay,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  itemStatusDelivered: {
    backgroundColor: COLORS.success ?? COLORS.primary,
  },
  itemStatusCancelled: {
    backgroundColor: COLORS.accentRed ?? '#FFE5E5',
  },
  itemStatusText: {
    fontSize: '10@ms',
    color: COLORS.white,
    fontWeight: '600',
  },
  chevronIcon: {
    marginLeft: '4@s',
  },
  assignButtonRow: {
    flexDirection: 'row',
    gap: '8@s',
    marginTop: '8@vs',
  },
  assignButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: '6@s',
    paddingVertical: '6@vs',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  assignButtonText: {
    fontSize: '11@ms',
    fontWeight: '600',
    color: COLORS.primary,
    textAlign: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.infoSurface,
    borderRadius: '10@s',
    paddingHorizontal: '12@s',
    paddingVertical: '8@vs',
    marginHorizontal: '16@s',
    marginTop: '16@vs',
    gap: '8@s',
  },
  errorText: {
    flex: 1,
    fontSize: '12@ms',
    color: COLORS.textDark,
  },
  retryText: {
    fontSize: '12@ms',
    color: COLORS.primary,
    fontWeight: '600',
  },
  loaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8@s',
    paddingVertical: '24@vs',
  },
  loaderText: {
    fontSize: '13@ms',
    color: COLORS.textDark,
  },
});
