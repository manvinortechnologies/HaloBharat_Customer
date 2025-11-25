import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/MaterialIcons';
import NormalHeader from '../component/NormalHeader';
import COLORS from '../constants/colors';
import { getFaqs } from '../api/support';
import { NavigationProp, useNavigation } from '@react-navigation/native';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string | null;
}

interface RootStackParamList {
  ChatsScreen: undefined;
}

const HelpSupport = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [searchQuery, setSearchQuery] = useState('');
  const userName = 'Rahul Sharma'; // TODO: wire to profile/user context
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  const normalizeFaq = useCallback((item: any, index: number): FaqItem => {
    return {
      id: String(item?.id ?? item?.faq_id ?? `faq-${index}`),
      question: item?.question ?? item?.title ?? 'Frequently asked question',
      answer:
        item?.answer ??
        item?.description ??
        'We are working on adding the answer for this question.',
      category: item?.category ?? item?.topic ?? null,
    };
  }, []);

  const fetchFaqs = useCallback(
    async (mode: 'default' | 'refresh' = 'default') => {
      if (mode === 'refresh') {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      try {
        setError(null);
        const payload = await getFaqs();
        const listSource = payload?.results || [];
        setFaqs(listSource.map(normalizeFaq));
      } catch (err: any) {
        setError(err?.message || 'Unable to load FAQs.');
        setFaqs([]);
      } finally {
        if (mode === 'refresh') {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [normalizeFaq],
  );

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  const filteredFaqs = useMemo(() => {
    const query = (searchQuery ?? '').toString().toLowerCase();
    if (!query) {
      return faqs;
    }
    return faqs.filter(item => item.question.toLowerCase().includes(query));
  }, [faqs, searchQuery]);

  const handleFaqPress = (item: FaqItem) => {
    setExpandedFaqId(prev => (prev === item.id ? null : item.id));
  };

  const handleCallPress = () => {
    Linking.openURL('tel:+918450992233');
    // Handle call action
    console.log('Call pressed');
  };

  const handleChatPress = () => {
    navigation.navigate('ChatsScreen');
    // Handle chat action
    console.log('Chat pressed');
  };

  return (
    <SafeAreaView style={styles.container}>
      <NormalHeader title="Help & Support" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchFaqs('refresh')}
            tintColor={COLORS.primary}
          />
        }
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
              color={COLORS.textDark}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search help"
              placeholderTextColor={COLORS.textDark}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* FAQ Section */}
          <Text style={styles.sectionTitle}>
            Frequently Asked Questions (FAQs)
          </Text>
        </View>

        {error ? (
          <TouchableOpacity
            style={styles.errorBanner}
            onPress={() => fetchFaqs()}
          >
            <Icon name="error-outline" size={20} color={COLORS.accentRed} />
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.retryText}>Tap to retry</Text>
          </TouchableOpacity>
        ) : null}

        {loading && faqs.length === 0 ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loaderText}>Loading FAQs...</Text>
          </View>
        ) : null}

        <View style={styles.faqList}>
          {filteredFaqs.map((item, index) => {
            const isExpanded = expandedFaqId === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.faqItem,
                  index === filteredFaqs.length - 1 && styles.faqItemLast,
                ]}
                onPress={() => handleFaqPress(item)}
                activeOpacity={0.85}
              >
                <View style={styles.faqHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.faqText}>{item.question}</Text>
                    {item.category ? (
                      <Text style={styles.faqCategory}>{item.category}</Text>
                    ) : null}
                  </View>
                  <Icon
                    name={isExpanded ? 'expand-less' : 'expand-more'}
                    size={24}
                    color={COLORS.black}
                  />
                </View>
                {isExpanded ? (
                  <Text style={styles.faqAnswer}>{item.answer}</Text>
                ) : null}
              </TouchableOpacity>
            );
          })}

          {!loading && filteredFaqs.length === 0 && !error ? (
            <View style={styles.emptyState}>
              <Icon name="search-off" size={32} color={COLORS.gray500} />
              <Text style={styles.emptyTitle}>No results</Text>
              <Text style={styles.emptySubtitle}>
                Try searching with different keywords.
              </Text>
            </View>
          ) : null}
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
    backgroundColor: COLORS.gray975,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: COLORS.white,
  },
  welcomeSection: {
    marginVertical: '20@vs',
    marginHorizontal: '20@vs',
  },

  welcomeText: {
    fontSize: '18@ms',
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: '8@vs',
  },
  welcomeSubtext: {
    fontSize: '13@ms',
    color: COLORS.textAsh,
    lineHeight: '20@vs',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray1000,
    borderRadius: '12@s',
    paddingHorizontal: '16@s',
    paddingVertical: '12@vs',
    marginBottom: '24@vs',
    borderWidth: 0.5,
    borderColor: COLORS.gray750,
    marginHorizontal: '20@vs',
  },
  searchIcon: {
    marginRight: '8@s',
  },
  searchInput: {
    flex: 1,
    fontSize: '15@ms',
    color: COLORS.black,
    padding: 0,
  },
  sectionTitle: {
    fontSize: '16@ms',
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: '16@vs',
    marginHorizontal: '20@vs',
  },
  faqList: {
    marginTop: '8@vs',
  },
  faqItem: {
    // flexDirection: 'row',
    // justifyContent: 'space-between',
    // alignItems: 'center',
    paddingVertical: '16@vs',
    paddingHorizontal: '16@s',
    backgroundColor: COLORS.white,
    marginBottom: '12@vs',
  },
  faqItemLast: {
    borderBottomWidth: 0,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: '8@s',
  },
  faqText: {
    flex: 1,
    fontSize: '15@ms',
    color: COLORS.black,
    marginRight: '12@s',
  },
  faqCategory: {
    marginTop: '4@vs',
    fontSize: '11@ms',
    color: COLORS.textAsh,
  },
  faqAnswer: {
    marginTop: '12@vs',
    fontSize: '13@ms',
    color: COLORS.textSemiDark,
    lineHeight: '20@vs',
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
    backgroundColor: COLORS.primaryMuted,
    paddingVertical: '12@vs',
    borderRadius: '12@s',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: '16@ms',
    fontWeight: '600',
    color: COLORS.white,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.infoSurface,
    borderRadius: '10@s',
    paddingHorizontal: '12@s',
    paddingVertical: '8@vs',
    marginHorizontal: '20@s',
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
    paddingVertical: '16@vs',
  },
  loaderText: {
    fontSize: '13@ms',
    color: COLORS.textDark,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: '20@vs',
  },
  emptyTitle: {
    marginTop: '8@vs',
    fontSize: '14@ms',
    fontWeight: '600',
    color: COLORS.textDark,
  },
  emptySubtitle: {
    fontSize: '12@ms',
    color: COLORS.gray500,
    marginTop: '4@vs',
    textAlign: 'center',
  },
});
