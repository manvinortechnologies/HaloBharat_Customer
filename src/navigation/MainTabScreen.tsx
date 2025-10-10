import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

// 👉 Import your screens
import HomeScreen from '../screen/Home';
import More from '../screen/More';
import Account from '../screen/Account';
import Categories from '../component/Categories';

interface TabItem {
  id: string;
  label: string;
  icon: string;
  iconFamily: 'MaterialIcons' | 'MaterialCommunityIcons' | 'Custom';
}

const MainTabScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('HOME');

  const tabItems: TabItem[] = [
    {
      id: 'HOME',
      label: 'Home',
      icon: 'home',
      iconFamily: 'MaterialIcons',
    },
    {
      id: 'MORE',
      label: 'More',
      icon: 'dots-horizontal',
      iconFamily: 'MaterialCommunityIcons',
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
      case 'MORE':
        return <More />;
      case 'CATEGORY':
        return <Categories />;
      case 'ACCOUNT':
        return <Account />;
      default:
        return <HomeScreen />;
    }
  };

  const renderIcon = (item: TabItem, isActive: boolean) => {
    const iconColor = isActive ? '#9E7946' : '#303030';
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>{renderScreen()}</View>

        <View style={styles.tabContainer}>
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
    </SafeAreaView>
  );
};

export default MainTabScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF',
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
    borderTopColor: '#C2C2C2',
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
    color: '#303030',
    textAlign: 'center',
  },
  activeTabLabel: {
    color: '#9E7946',
    fontWeight: '600',
  },
});
