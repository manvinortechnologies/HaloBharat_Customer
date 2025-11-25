import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/MaterialIcons';
import NormalHeader from '../component/NormalHeader';
import COLORS from '../constants/colors';
import { getNotifications } from '../api/notifications';

type TabType = 'All' | 'Deals' | 'Updates';

interface NotificationItem {
  id: string;
  type: 'promotion' | 'order' | 'update';
  title: string;
  description: string;
  image?: any;
  images?: any[];
  time: string;
  hasButton?: boolean;
  buttonText?: string;
  icon?: string;
  iconColor?: string;
}

const Notification = ({ navigation }: any) => {
  const [activeTab, setActiveTab] = useState<TabType>('All');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatTime = (dateString?: string | null) => {
    if (!dateString) return 'Just now';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      if (diffHours < 24)
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

      const isToday =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

      if (isToday) {
        return `Today, ${date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })}`;
      }

      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return 'Just now';
    }
  };

  const normalizeNotification = useCallback(
    (item: any, index: number): NotificationItem => {
      // Determine notification type based on API response
      const notificationType =
        item?.type?.toLowerCase() === 'promotion' ||
        item?.category === 'promotion' ||
        item?.category === 'deal'
          ? 'promotion'
          : item?.type?.toLowerCase() === 'order' || item?.category === 'order'
          ? 'order'
          : 'update';

      return {
        id: String(item?.id ?? `notification-${index}`),
        type: notificationType,
        title: item?.title ?? item?.subject ?? item?.message ?? 'Notification',
        description:
          item?.description ??
          item?.body ??
          item?.message ??
          item?.content ??
          '',
        image: item?.image ? { uri: item.image } : undefined,
        images: Array.isArray(item?.images)
          ? item.images.map((img: any) =>
              typeof img === 'string' ? { uri: img } : img,
            )
          : undefined,
        time: formatTime(item?.created_at ?? item?.timestamp ?? item?.date),
        hasButton: Boolean(item?.has_button ?? item?.action_url),
        buttonText: item?.button_text ?? item?.action_text ?? 'Shop Now',
        icon:
          notificationType === 'order'
            ? 'check-circle'
            : notificationType === 'update'
            ? 'info'
            : undefined,
        iconColor:
          notificationType === 'order'
            ? COLORS.successBright
            : notificationType === 'update'
            ? COLORS.primary
            : undefined,
      };
    },
    [],
  );

  const fetchNotifications = useCallback(
    async (mode: 'default' | 'refresh' = 'default') => {
      if (mode === 'refresh') {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      try {
        const payload = await getNotifications();
        const listSource = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
          ? payload
          : [];
        setNotifications(listSource.map(normalizeNotification));
      } catch (err: any) {
        setError(err?.message || 'Unable to load notifications.');
        setNotifications([]);
      } finally {
        if (mode === 'refresh') {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [normalizeNotification],
  );

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filterNotifications = () => {
    if (activeTab === 'All') return notifications;
    if (activeTab === 'Deals')
      return notifications.filter(n => n.type === 'promotion');
    if (activeTab === 'Updates')
      return notifications.filter(
        n => n.type === 'order' || n.type === 'update',
      );
    return notifications;
  };

  const renderNotificationCard = (item: NotificationItem) => {
    if (item.type === 'promotion') {
      return (
        <View key={item.id} style={styles.notificationCard}>
          {/* Single Large Image */}
          {item.image && (
            <Image
              source={item.image}
              style={styles.promoImage}
              resizeMode="cover"
            />
          )}

          {/* Multiple Small Images */}
          {item.images && (
            <View style={styles.multiImageContainer}>
              {item.images.map((img, index) => (
                <View key={index} style={styles.smallImageWrapper}>
                  <Image
                    source={img}
                    style={styles.smallImage}
                    resizeMode="cover"
                  />
                  {index === 0 && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountBadgeText}>30%</Text>
                      <Text style={styles.discountBadgeSubtext}>OFF</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Content */}
          <View style={styles.promoContent}>
            <Text style={styles.promoTitle}>{item.title}</Text>
            <Text style={styles.promoDescription}>{item.description}</Text>

            <View style={styles.promoFooter}>
              {item.hasButton && (
                <TouchableOpacity
                  style={styles.shopNowButton}
                  onPress={() => navigation.navigate('ProductList')}
                >
                  <Text style={styles.shopNowText}>{item.buttonText}</Text>
                </TouchableOpacity>
              )}
              <Text style={styles.timeText}>{item.time}</Text>
            </View>
          </View>
        </View>
      );
    }

    // Order/Update notification
    return (
      <View key={item.id} style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View style={styles.orderTitleRow}>
            {item.icon && (
              <Icon name={item.icon} size={20} color={item.iconColor} />
            )}
            <Text style={styles.orderTitle}>{item.title}</Text>
          </View>
        </View>
        <Text style={styles.orderDescription}>{item.description}</Text>
        <Text style={styles.timeText}>{item.time}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <NormalHeader title="Notification" />

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'All' && styles.activeTab]}
          onPress={() => setActiveTab('All')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'All' && styles.activeTabText,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'Deals' && styles.activeTab]}
          onPress={() => setActiveTab('Deals')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'Deals' && styles.activeTabText,
            ]}
          >
            Deals
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'Updates' && styles.activeTab]}
          onPress={() => setActiveTab('Updates')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'Updates' && styles.activeTabText,
            ]}
          >
            Updates
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notification List */}
      {error && !loading && (
        <TouchableOpacity
          style={styles.errorBanner}
          onPress={() => fetchNotifications()}
        >
          <Icon name="error-outline" size={18} color={COLORS.accentRed} />
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.retryText}>Tap to retry</Text>
        </TouchableOpacity>
      )}

      {loading && notifications.length === 0 ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loaderText}>Loading notifications...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchNotifications('refresh')}
              colors={[COLORS.primary]}
            />
          }
        >
          {filterNotifications().length > 0 ? (
            filterNotifications().map(item => renderNotificationCard(item))
          ) : (
            <View style={styles.emptyContainer}>
              <Icon
                name="notifications-none"
                size={48}
                color={COLORS.textAsh}
              />
              <Text style={styles.emptyText}>No notifications</Text>
              <Text style={styles.emptySubtext}>
                {activeTab === 'All'
                  ? "You're all caught up!"
                  : `No ${activeTab.toLowerCase()} notifications`}
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default Notification;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray975,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: '16@s',
    paddingTop: '12@vs',
    paddingBottom: '8@vs',
    gap: '8@s',
    alignSelf: 'center',
  },
  tab: {
    paddingHorizontal: '20@s',
    paddingVertical: '8@vs',
    borderRadius: '5@s',
    backgroundColor: COLORS.white,
    minWidth: '80@s',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: COLORS.textAsh,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: '14@ms',
    color: COLORS.textAsh,
    fontWeight: '400',
  },
  activeTabText: {
    color: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: '16@s',
  },
  notificationCard: {
    backgroundColor: COLORS.white,
    borderRadius: '12@s',
    marginBottom: '12@vs',
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
  promoImage: {
    width: '100%',
    height: '140@vs',
    backgroundColor: COLORS.white,
  },
  multiImageContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.whiteSoft,
    padding: '12@s',
    gap: '8@s',
  },
  smallImageWrapper: {
    flex: 1,
    position: 'relative',
    borderRadius: '12@s',
    overflow: 'hidden',
  },
  smallImage: {
    width: '100%',
    height: '100@vs',
    borderRadius: '12@s',
    backgroundColor: COLORS.gray1025,
  },
  discountBadge: {
    position: 'absolute',
    top: '8@vs',
    left: '8@s',
    backgroundColor: COLORS.accentOrange,
    borderRadius: '50@s',
    width: '45@s',
    height: '45@s',
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountBadgeText: {
    fontSize: '14@ms',
    fontWeight: '700',
    color: COLORS.white,
    lineHeight: '16@vs',
  },
  discountBadgeSubtext: {
    fontSize: '10@ms',
    fontWeight: '600',
    color: COLORS.white,
  },
  promoContent: {
    padding: '16@s',
  },
  promoTitle: {
    fontSize: '15@ms',
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: '6@vs',
  },
  promoDescription: {
    fontSize: '13@ms',
    color: COLORS.textSubtle,
    lineHeight: '18@vs',
    marginBottom: '12@vs',
  },
  promoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shopNowButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: '28@s',
    paddingVertical: '6@vs',
    borderRadius: '5@s',
  },
  shopNowText: {
    color: COLORS.white,
    fontSize: '14@ms',
    fontWeight: '500',
  },
  timeText: {
    alignSelf: 'flex-end',
    fontSize: '11@ms',
    color: COLORS.textAsh,
  },
  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: '12@s',
    paddingHorizontal: '16@s',
    paddingVertical: '8@vs',
    marginBottom: '12@vs',
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '4@vs',
  },
  orderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8@s',
    flex: 1,
  },
  orderTitle: {
    fontSize: '14@ms',
    fontWeight: '600',
    color: COLORS.black,
  },
  orderDescription: {
    fontSize: '11@ms',
    color: COLORS.textAsh,
    lineHeight: '18@vs',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.infoSurface,
    borderRadius: '10@s',
    marginHorizontal: '16@s',
    marginTop: '10@vs',
    paddingHorizontal: '12@s',
    paddingVertical: '8@vs',
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: '40@vs',
    gap: '12@vs',
  },
  loaderText: {
    fontSize: '14@ms',
    color: COLORS.textMedium,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: '60@vs',
    gap: '12@vs',
  },
  emptyText: {
    fontSize: '16@ms',
    fontWeight: '600',
    color: COLORS.black,
  },
  emptySubtext: {
    fontSize: '14@ms',
    color: COLORS.textAsh,
    textAlign: 'center',
  },
});
