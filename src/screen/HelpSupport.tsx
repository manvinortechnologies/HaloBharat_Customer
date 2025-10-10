import React, { useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/MaterialIcons';
import NormalHeader from '../component/NormalHeader';

const HelpSupport = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const userName = 'Rahul Sharma'; // This should come from user context/props

  const faqItems = [
    {
      id: 1,
      question: 'How Can I Track My Order?',
      category: 'orders',
    },
    {
      id: 2,
      question: 'What Payment Methods Are Available?',
      category: 'payment',
    },
    {
      id: 3,
      question: 'Can I Cancel Or Return An Order?',
      category: 'orders',
    },
    {
      id: 4,
      question: 'How Do I Save Items For Later?',
      category: 'shopping',
    },
    {
      id: 5,
      question: 'What If I Face An Issue With My Order?',
      category: 'orders',
    },
    {
      id: 6,
      question: 'Can I Buy From Multiple Vendors In One Order?',
      category: 'shopping',
    },
    {
      id: 7,
      question: 'How Do I Place An Order?',
      category: 'shopping',
    },
  ];

  const filteredFaqs = faqItems.filter(item => {
    const query = (searchQuery ?? '').toString().toLowerCase();
    return item.question.toLowerCase().includes(query);
  });

  const handleFaqPress = (item: (typeof faqItems)[0]) => {
    // Navigate to detailed FAQ answer page
    console.log('FAQ pressed:', item.question);
  };

  const handleCallPress = () => {
    // Handle call action
    console.log('Call pressed');
  };

  const handleChatPress = () => {
    // Handle chat action
    console.log('Chat pressed');
  };

  return (
    <SafeAreaView style={styles.container}>
      <NormalHeader title="Help & Support" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Hey, {userName}!</Text>
            <Text style={styles.welcomeSubtext}>
              Fast answers, right at your fingertips—because your time is
              valuable.
            </Text>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Icon
              name="search"
              size={20}
              color="#303030"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search help"
              placeholderTextColor="#303030"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* FAQ Section */}
          <Text style={styles.sectionTitle}>
            Frequently Asked Questions (FAQs)
          </Text>
        </View>

        <View style={styles.faqList}>
          {filteredFaqs.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.faqItem,
                index === filteredFaqs.length - 1 && styles.faqItemLast,
              ]}
              onPress={() => handleFaqPress(item)}
            >
              <Text style={styles.faqText}>{item.question}</Text>
              <Icon name="chevron-right" size={24} color="#000" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Spacing for bottom buttons */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleCallPress}>
          <Text style={styles.actionButtonText}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleChatPress}>
          <Text style={styles.actionButtonText}>Chat</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default HelpSupport;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F7F8',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
  },
  welcomeSection: {
    marginVertical: '20@vs',
    marginHorizontal: '20@vs',
  },

  welcomeText: {
    fontSize: '18@ms',
    fontWeight: '600',
    color: '#000',
    marginBottom: '8@vs',
  },
  welcomeSubtext: {
    fontSize: '13@ms',
    color: '#696969',
    lineHeight: '20@vs',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
    borderRadius: '12@s',
    paddingHorizontal: '16@s',
    paddingVertical: '12@vs',
    marginBottom: '24@vs',
    borderWidth: 0.5,
    borderColor: '#D9D9D9',
    marginHorizontal: '20@vs',
  },
  searchIcon: {
    marginRight: '8@s',
  },
  searchInput: {
    flex: 1,
    fontSize: '15@ms',
    color: '#000',
    padding: 0,
  },
  sectionTitle: {
    fontSize: '16@ms',
    fontWeight: '600',
    color: '#000',
    marginBottom: '16@vs',
    marginHorizontal: '20@vs',
  },
  faqList: {
    marginTop: '8@vs',
  },
  faqItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: '16@vs',
    paddingHorizontal: '16@s',
    backgroundColor: '#fff',
    marginBottom: '12@vs',
  },
  faqItemLast: {
    borderBottomWidth: 0,
  },
  faqText: {
    flex: 1,
    fontSize: '15@ms',
    color: '#000',
    marginRight: '12@s',
  },
  bottomSpacing: {
    height: '100@vs',
  },
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: '20@s',
    paddingVertical: '16@vs',
    paddingBottom: '20@vs',
    gap: '12@s',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#1C3D5A',
    paddingVertical: '12@vs',
    borderRadius: '12@s',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: '16@ms',
    fontWeight: '600',
    color: '#fff',
  },
});
