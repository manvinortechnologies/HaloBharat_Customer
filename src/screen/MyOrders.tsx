import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { s, ScaledSheet } from 'react-native-size-matters';
import NormalHeader from '../component/NormalHeader';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import COLORS from '../constants/colors';
import { getOrders } from '../api/orders';
import DatePicker from 'react-native-date-picker';

// 1. Define the param list for your stack navigator
type RootStackParamList = {
  MyOrders: undefined;
  OrderDetail: {
    orderId: string;
  };
  MyCart: undefined;
};

import type { StackNavigationProp } from '@react-navigation/stack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const MyOrders = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const fetchOrders = useCallback(
    async (mode: 'default' | 'refresh' = 'default') => {
      if (mode === 'refresh') {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      try {
        setError(null);
        const payload = await getOrders();
        const listSource = Array.isArray(payload?.results)
          ? payload.results
          : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
          ? payload
          : [];
        setOrders(listSource);
      } catch (err: any) {
        setError(err?.message || 'Unable to load orders.');
        setOrders([]);
      } finally {
        if (mode === 'refresh') {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    if (!Array.isArray(orders) || orders.length === 0) {
      return [];
    }
    if (!selectedDate) {
      return orders;
    }
    return orders.filter(order => {
      const rawDate = order?.created_at ?? order?.delivery_datetime;
      if (!rawDate) {
        return false;
      }
      const orderDate = new Date(rawDate);
      if (Number.isNaN(orderDate.getTime())) {
        return false;
      }
      return (
        orderDate.getFullYear() === selectedDate.getFullYear() &&
        orderDate.getMonth() === selectedDate.getMonth() &&
        orderDate.getDate() === selectedDate.getDate()
      );
    });
  }, [orders, selectedDate]);

  const formatOrderDate = useCallback((value?: string) => {
    if (!value) return '';
    const date = new Date(value);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }, []);

  const renderOrderCard = ({ item }: { item: any }) => {
    const orderId = item?.order_id ?? item?.orderId ?? 'Order';
    const orderDate = formatOrderDate(
      item?.created_at ?? item?.delivery_datetime,
    );
    const products = Array.isArray(item?.items) ? item.items : [];
    const itemsCount = products.length;
    const deliveryTo = item?.delivery_to ?? '';

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.orderCard}
        onPress={() =>
          navigation.navigate('OrderDetail', {
            orderId,
          })
        }
      >
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>Order ID {orderId}</Text>
          <Text style={styles.orderDate}>{orderDate}</Text>
        </View>

        <View style={styles.itemsInfoRow}>
          <Text style={styles.itemsCountText}>
            {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
          </Text>
        </View>

        {deliveryTo ? (
          <View style={styles.deliveryInfoRow}>
            <Icon
              name="location-on"
              size={16}
              color={COLORS.textAsh}
              style={styles.deliveryIcon}
            />
            <Text style={styles.deliveryText} numberOfLines={2}>
              {deliveryTo}
            </Text>
          </View>
        ) : null}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.imagesScrollContainer}
        >
          {products
            .filter((product: any) => product?.product_image)
            .map((product: any, index: number) => (
              <View
                key={product?.id ?? product?.product_id ?? index}
                style={styles.itemImageContainer}
              >
                {product?.product_image ? (
                  <Image
                    source={{ uri: product.product_image }}
                    style={styles.itemImage}
                  />
                ) : (
                  <MaterialIcons
                    name="image"
                    size={s(40)}
                    color={COLORS.primary}
                  />
                )}
              </View>
            ))}
        </ScrollView>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <NormalHeader
        title="My Orders"
        rightButton={
          <TouchableOpacity onPress={() => navigation.navigate('MyCart')}>
            <Ionicons name="bag-outline" size={24} color={COLORS.black} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchOrders('refresh')}
            tintColor={COLORS.primary}
          />
        }
      >
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setDatePickerOpen(true)}
          >
            <Ionicons name="calendar-outline" size={16} color={COLORS.black} />
            <Text style={styles.dateButtonText}>
              {selectedDate
                ? selectedDate.toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Select Date'}
            </Text>
          </TouchableOpacity>
          {selectedDate ? (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSelectedDate(null)}
            >
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {error ? (
          <TouchableOpacity
            style={styles.errorBanner}
            onPress={() => fetchOrders()}
          >
            <Icon name="error-outline" size={20} color={COLORS.accentRed} />
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.retryText}>Tap to retry</Text>
          </TouchableOpacity>
        ) : null}

        {loading && orders.length === 0 ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loaderText}>Loading your orders...</Text>
          </View>
        ) : null}

        {!loading && orders.length === 0 && !error ? (
          <View style={styles.emptyContainer}>
            <Icon name="inventory" size={80} color={COLORS.gray700} />
            <Text style={styles.emptyText}>No orders found</Text>
            <Text style={styles.emptySubtext}>
              Once you place an order it will appear here.
            </Text>
          </View>
        ) : filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="calendar-outline"
              size={60}
              color={COLORS.gray700}
            />
            <Text style={styles.emptyText}>No orders in this range</Text>
            <Text style={styles.emptySubtext}>
              Try a different date filter to see more orders.
            </Text>
          </View>
        ) : null}

        <FlatList
          data={filteredOrders}
          renderItem={renderOrderCard}
          keyExtractor={item => String(item?.id ?? item?.order_id)}
          scrollEnabled={false}
        />
      </ScrollView>

      <DatePicker
        modal
        mode="date"
        open={datePickerOpen}
        date={selectedDate ?? new Date()}
        onConfirm={date => {
          setDatePickerOpen(false);
          setSelectedDate(date);
        }}
        onCancel={() => setDatePickerOpen(false)}
      />
    </SafeAreaView>
  );
};

export default MyOrders;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray975,
  },
  scrollContent: {
    paddingBottom: '20@vs',
  },
  dropdownContainer: {
    backgroundColor: COLORS.white,
    borderRadius: '8@s',
    paddingVertical: '10@vs',
    paddingHorizontal: '14@s',
    alignSelf: 'flex-start',
    marginHorizontal: '12@s',
    marginTop: '10@vs',
    marginBottom: '15@vs',
    borderWidth: 0.5,
    borderColor: COLORS.gray550,
  },
  dropdownText: {
    fontSize: '12@ms',
    color: COLORS.black,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8@s',
    marginHorizontal: '12@s',
    marginBottom: '12@vs',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: '12@s',
    paddingVertical: '8@vs',
    borderRadius: '20@s',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray700,
    gap: '6@s',
  },
  dateButtonText: {
    fontSize: '12@ms',
    color: COLORS.black,
    fontWeight: '500',
  },
  clearButton: {
    paddingHorizontal: '10@s',
    paddingVertical: '6@vs',
    borderRadius: '16@s',
    borderWidth: 1,
    borderColor: COLORS.accentRed,
  },
  clearButtonText: {
    fontSize: '11@ms',
    color: COLORS.accentRed,
    fontWeight: '600',
  },
  orderCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray875,
    padding: '12@s',
    marginBottom: '16@vs',
    shadowColor: COLORS.black,
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
    color: COLORS.textAsh,
    fontWeight: '500',
  },
  orderDate: {
    fontSize: '12@ms',
    color: COLORS.textAsh,
  },
  itemsInfoRow: {
    marginBottom: '8@vs',
  },
  itemsCountText: {
    fontSize: '13@ms',
    color: COLORS.textSemiDark,
    fontWeight: '500',
  },
  deliveryInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: '12@vs',
    gap: '6@s',
  },
  deliveryIcon: {
    marginTop: '2@vs',
  },
  deliveryText: {
    flex: 1,
    fontSize: '12@ms',
    color: COLORS.textAsh,
    lineHeight: '16@vs',
  },
  imagesScrollContainer: {
    gap: '8@s',
    paddingRight: '4@s',
  },
  itemImageContainer: {
    marginRight: '8@s',
  },
  itemImage: {
    width: '60@s',
    height: '60@s',
    borderRadius: '8@s',
    resizeMode: 'cover',
  },
  itemImagePlaceholder: {
    width: '60@s',
    height: '60@s',
    borderRadius: '8@s',
    backgroundColor: COLORS.gray900,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.infoSurface,
    borderRadius: '10@s',
    paddingHorizontal: '12@s',
    paddingVertical: '8@vs',
    marginHorizontal: '12@s',
    marginBottom: '12@vs',
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
    paddingVertical: '20@vs',
  },
  loaderText: {
    fontSize: '13@ms',
    color: COLORS.textDark,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: '40@vs',
  },
  emptyText: {
    fontSize: '18@ms',
    fontWeight: '600',
    color: COLORS.textSemiDark,
    marginTop: '12@vs',
  },
  emptySubtext: {
    fontSize: '14@ms',
    color: COLORS.textAsh,
    marginTop: '4@vs',
    textAlign: 'center',
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
    backgroundColor: COLORS.accentClay,
  },
  delivered: {
    backgroundColor: COLORS.accentClay,
  },
  statusText: {
    fontSize: '10@ms',
    color: COLORS.white,
    fontWeight: '500',
  },
});
