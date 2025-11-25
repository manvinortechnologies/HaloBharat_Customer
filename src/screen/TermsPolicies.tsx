import React from 'react';
import { ScrollView, Text, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/MaterialIcons';
import NormalHeader from '../component/NormalHeader';
import COLORS from '../constants/colors';

const TermsPolicies = () => {
  // 🔹 Dynamic content array (you can later fetch from API)
  const sections = [
    {
      id: 1,
      title: 'Introduction',
      content:
        'Welcome to [App Name], a platform connecting customers with multiple vendors for construction materials. By using our app, you agree to comply with these Terms & Policies. Please read carefully.',
    },
    {
      id: 2,
      title: 'User Account',
      bullets: [
        'Users must provide accurate information during registration.',
        'You are responsible for maintaining confidentiality of your login credentials.',
        'You must be at least 18 years old to use the app.',
      ],
    },
    {
      id: 3,
      title: 'Vendor Responsibility',
      bullets: [
        'Vendors are responsible for accurate product descriptions, pricing, and stock availability.',
        'Vendors must adhere to safety and legal regulations for the products sold.',
        'The app does not assume liability for vendor misrepresentation.',
      ],
    },
    {
      id: 4,
      title: 'Orders & Payments',
      bullets: [
        'Users are responsible for providing correct delivery information.',
        'Payment gateways are secure; however, users must ensure proper authorization of payments.',
        'Orders are confirmed only after successful payment.',
      ],
    },
    {
      id: 5,
      title: 'Cancellations & Refunds',
      bullets: [
        'Users can cancel orders before dispatch, as per vendor-specific policies.',
        'Refunds will be processed through the original payment method within the stipulated time.',
        'Any disputes regarding product quality or delivery must be reported to Help & Support.',
      ],
    },
  ];

  const headerData = {
    title: 'Terms and Policies',
    introText:
      'These Terms & Policies govern your use of our app, which connects users with multiple vendors for construction materials. By accessing or using [App Name], you agree to follow these rules and guidelines. Please read them carefully to ensure a safe, fair, and smooth experience for everyone.',
    updatedDate: 'Updated on 20 Sept, 2025',
  };

  return (
    <SafeAreaView style={styles.container}>
      <NormalHeader title="" />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Terms and Policies</Text>
        <View style={styles.card}>
          <Text style={styles.introText}>{headerData.introText}</Text>
          <Text style={styles.updatedDate}>{headerData.updatedDate}</Text>
        </View>

        {/* 🔹 Dynamically render sections */}
        {sections.map((section, index) => (
          <View key={section.id} style={styles.section}>
            <View style={styles.sectionHeaderContainer}>
              <Text style={styles.sectionNumber}>{index + 1}. </Text>
              <Text style={styles.sectionHeader}>{section.title}</Text>
            </View>

            {section.content && (
              <Text style={styles.sectionContent}>{section.content}</Text>
            )}

            {section.bullets && (
              <View style={styles.bulletList}>
                {section.bullets.map((bullet, i) => (
                  <View key={i} style={styles.bulletItem}>
                    <Icon
                      name="circle"
                      size={8}
                      color={COLORS.black}
                      style={styles.bulletIcon}
                    />
                    <Text style={styles.bulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TermsPolicies;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: '16@s',
    marginVertical: '20@vs',
  },
  title: { color: COLORS.black, fontWeight: '700', fontSize: '16@s' },
  card: {
    marginBottom: '24@vs',
  },
  image: {
    width: '100@s',
    height: '80@vs',
    alignSelf: 'center',
    marginBottom: '10@vs',
  },
  introText: {
    fontSize: '12@ms',
    color: COLORS.textAsh,
    marginVertical: '8@vs',
    fontWeight: '400',
    textAlign: 'left',
  },
  updatedDate: {
    fontSize: '12@ms',
    color: COLORS.black,
    fontWeight: '500',
  },
  section: {
    marginBottom: '24@vs',
    backgroundColor: COLORS.white,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '4@vs',
  },
  sectionNumber: {
    fontSize: '14@ms',
    fontWeight: 'bold',
    color: COLORS.black,
    marginRight: '2@s',
    textAlign: 'center',
  },
  sectionHeader: {
    fontSize: '14@ms',
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'left',
  },
  sectionContent: {
    fontSize: '13@ms',
    color: COLORS.black,
    lineHeight: '20@vs',
    textAlign: 'left',
  },
  bulletList: {
    marginTop: '4@vs',
    marginLeft: '8@s',
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: '2@vs',
  },
  bulletIcon: {
    marginTop: '8@vs',
    marginRight: '8@s',
  },
  bulletText: {
    fontSize: '13@ms',
    color: COLORS.black,
    lineHeight: '20@vs',
    flex: 1,
    textAlign: 'left',
  },
});
