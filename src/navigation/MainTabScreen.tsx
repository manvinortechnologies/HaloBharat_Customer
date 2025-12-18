import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import {
  scale,
  verticalScale,
  moderateScale,
  s,
} from 'react-native-size-matters';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import COLORS from '../constants/colors';

// 👉 Import your screens
import HomeScreen from '../screen/Home';
import More from '../screen/More';
import Categories from '../component/Categories';
import { RouteProp, useRoute } from '@react-navigation/native';
import MyOrders from '../screen/MyOrders';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProfile } from '../api/profile';

interface TabItem {
  id: string;
  label: string;
  icon: string;
  iconFamily:
    | 'MaterialIcons'
    | 'MaterialCommunityIcons'
    | 'Ionicons'
    | 'Custom';
}

type MainTabParamList = {
  MainTab: { screenName: string };
};

const MainTabScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('HOME');
  const route = useRoute<RouteProp<MainTabParamList, 'MainTab'>>();
  const insets = useSafeAreaInsets();
  useEffect(() => {
    console.log('route.params?.screenName', route.params?.screenName);
    if (route.params?.screenName) {
      setActiveTab(route.params.screenName);
    }
  }, [route.params?.screenName]);

  useEffect(() => {
    const fetchProfile = async () => {
      const data = await getProfile();
      await AsyncStorage.setItem('profile', JSON.stringify(data));
    };
    fetchProfile();
  }, []);

  const tabItems: TabItem[] = [
    {
      id: 'HOME',
      label: 'Home',
      icon: 'home',
      iconFamily: 'MaterialIcons',
    },
    {
      id: 'ORDERS',
      label: 'Orders',
      icon: 'bag-outline',
      iconFamily: 'Ionicons',
    },
    {
      id: 'CATEGORY',
      label: 'Categories',
      icon: 'custom-grid',
      iconFamily: 'Custom', // custom grid for 4 squares
    },
    {
      id: 'ACCOUNT',
      label: 'Account',
      icon: 'account-outline',
      iconFamily: 'MaterialCommunityIcons',
    },
  ];

  const renderScreen = () => {
    switch (activeTab) {
      case 'HOME':
        return <HomeScreen />;
      case 'ORDERS':
        return <MyOrders />;
      case 'CATEGORY':
        return <Categories />;
      case 'ACCOUNT':
        return <More />;
      default:
        return <HomeScreen />;
    }
  };

  const renderIcon = (item: TabItem, isActive: boolean) => {
    const iconColor = isActive ? COLORS.accentBronze : COLORS.textDark;
    const iconSize = moderateScale(24);

    if (item.iconFamily === 'MaterialCommunityIcons') {
      return (
        <MaterialCommunityIcons
          name={item.icon}
          size={iconSize}
          color={iconColor}
        />
      );
    }
    if (item.iconFamily === 'Ionicons') {
      return <Ionicons name={item.icon} size={iconSize} color={iconColor} />;
    }
    if (item.iconFamily === 'MaterialIcons') {
      return (
        <MaterialIcons name={item.icon} size={iconSize} color={iconColor} />
      );
    }

    // Custom 4-grid icon (3 squares + 1 circle)
    if (item.iconFamily === 'Custom' && item.icon === 'custom-grid') {
      const boxSize = moderateScale(6);
      return (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            width: moderateScale(20),
          }}
        >
          {[0, 1, 2, 3].map(i => (
            <View
              key={i}
              style={{
                width: boxSize,
                height: boxSize,
                borderRadius: i === 3 ? boxSize / 2 : 2, // last one is circle
                backgroundColor: iconColor,
                margin: 2,
              }}
            />
          ))}
        </View>
      );
    }

    return null;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>{renderScreen()}</View>

      <View
        style={[styles.tabContainer, { paddingBottom: insets.bottom + s(10) }]}
      >
        {tabItems.map(item => {
          const isActive = activeTab === item.id;

          return (
            <TouchableOpacity
              key={item.id}
              style={styles.tabItem}
              onPress={() => setActiveTab(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                {renderIcon(item, isActive)}
              </View>
              <Text
                style={[styles.tabLabel, isActive && styles.activeTabLabel]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default MainTabScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingVertical: verticalScale(6),
    paddingHorizontal: scale(12),
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: COLORS.gray650,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: verticalScale(2),
  },
  tabLabel: {
    fontSize: moderateScale(10),
    fontWeight: '400',
    color: COLORS.textDark,
    textAlign: 'center',
  },
  activeTabLabel: {
    color: COLORS.accentBronze,
    fontWeight: '600',
  },
});
