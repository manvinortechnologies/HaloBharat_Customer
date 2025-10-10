import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/MaterialIcons';
import NormalHeader from '../component/NormalHeader';

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

  const notifications: NotificationItem[] = [
    {
      id: '1',
      type: 'promotion',
      title: 'Shop. Sparkle. Save Big this Diwali! upto 10%',
      description:
        'Unwrap happiness with exclusive deals, festive combos, and free gifts on every purchase.',
      image: require('../assets/notificationImg1.png'), // Replace with your image
      time: 'Today, 12:45 pm',
      hasButton: true,
      buttonText: 'Shop Now',
    },
    {
      id: '2',
      type: 'promotion',
      title: 'Shop. Sparkle. Save Big this Diwali! upto 10%',
      description:
        'Unwrap happiness with exclusive deals, festive combos, and free gifts on every purchase.',
      image: require('../assets/notificationImg2.png'),
      time: 'Today, 12:45 pm',
      hasButton: true,
      buttonText: 'Shop Now',
    },
    {
      id: '3',
      type: 'order',
      title: 'Order Dispatched',
      description: 'Good news! Your cement order has been dispatched 📦',
      time: 'Today, 12:45 pm',
      icon: 'check-circle',
      iconColor: '#4CAF50',
    },
    {
      id: '4',
      type: 'order',
      title: 'Order Dispatched',
      description: 'Good news! Your cement order has been dispatched 📦',
      time: 'Today, 12:45 pm',
      icon: 'check-circle',
      iconColor: '#4CAF50',
    },
  ];

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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filterNotifications().map(item => renderNotificationCard(item))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Notification;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F7F8',
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
    backgroundColor: '#FFF',
    minWidth: '80@s',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#696969',
  },
  activeTab: {
    backgroundColor: '#1C3452',
  },
  tabText: {
    fontSize: '14@ms',
    color: '#696969',
    fontWeight: '400',
  },
  activeTabText: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: '16@s',
  },
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: '12@s',
    marginBottom: '12@vs',
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
  promoImage: {
    width: '100%',
    height: '140@vs',
    backgroundColor: '#FFF',
  },
  multiImageContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF5F0',
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
    backgroundColor: '#F5F5F5',
  },
  discountBadge: {
    position: 'absolute',
    top: '8@vs',
    left: '8@s',
    backgroundColor: '#FF6B35',
    borderRadius: '50@s',
    width: '45@s',
    height: '45@s',
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountBadgeText: {
    fontSize: '14@ms',
    fontWeight: '700',
    color: '#fff',
    lineHeight: '16@vs',
  },
  discountBadgeSubtext: {
    fontSize: '10@ms',
    fontWeight: '600',
    color: '#fff',
  },
  promoContent: {
    padding: '16@s',
  },
  promoTitle: {
    fontSize: '15@ms',
    fontWeight: '600',
    color: '#000',
    marginBottom: '6@vs',
  },
  promoDescription: {
    fontSize: '13@ms',
    color: '#666',
    lineHeight: '18@vs',
    marginBottom: '12@vs',
  },
  promoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shopNowButton: {
    backgroundColor: '#1C3452',
    paddingHorizontal: '28@s',
    paddingVertical: '6@vs',
    borderRadius: '5@s',
  },
  shopNowText: {
    color: '#fff',
    fontSize: '14@ms',
    fontWeight: '500',
  },
  timeText: {
    alignSelf: 'flex-end',
    fontSize: '11@ms',
    color: '#696969',
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: '12@s',
    paddingHorizontal: '16@s',
    paddingVertical: '8@vs',
    marginBottom: '12@vs',
    elevation: 2,
    shadowColor: '#000',
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
    color: '#000',
  },
  orderDescription: {
    fontSize: '11@ms',
    color: '#696969',
    lineHeight: '18@vs',
  },
});
