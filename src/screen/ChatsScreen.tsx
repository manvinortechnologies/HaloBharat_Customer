import React, { useState, useMemo, useEffect } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { getSupportTickets, createSupportTicket } from '../api/support';
import Toast from 'react-native-toast-message';

const ChatsScreen = () => {
  const navigation = useNavigation<
    NavigationProp<{
      ChatingScreen: { ticketData: any; isNewTicket: boolean };
    }>
  >();
  const [chatData, setChatData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [subject, setSubject] = useState('');
  const [creatingTicket, setCreatingTicket] = useState(false);

  // Function to convert API response to chat items
  const convertTicketsToChatItems = (tickets: any) => {
    if (!Array.isArray(tickets)) {
      return [];
    }

    return tickets.map((ticket: any) => {
      const createdAt = ticket.created_at
        ? new Date(ticket.created_at)
        : new Date();
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - createdAt.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let timeString = '';
      let dateType = '';

      if (diffDays === 1) {
        timeString = 'Today';
        dateType = 'today';
      } else if (diffDays === 2) {
        timeString = 'Yesterday';
        dateType = 'yesterday';
      } else {
        timeString = createdAt.toLocaleDateString();
        dateType = 'older';
      }

      // Get user name from ticket (could be user object or string)
      const userName =
        typeof ticket.user === 'object'
          ? ticket.user?.name || ticket.user?.email || 'User'
          : ticket.user || 'User';

      // Get subject/title
      const subject =
        ticket.subject || ticket.title || ticket.message || 'No subject';

      // Get status
      const status = ticket.status || 'open';

      return {
        id: ticket.id?.toString() || Math.random().toString(),
        name: userName,
        message: subject,
        time: timeString,
        unreadCount: status === 'open' || status === 'pending' ? 1 : 0,
        pinned: status === 'open' || status === 'pending',
        dateType,
        category: ticket.category || 'Support',
        status: status,
        appointmentId: ticket.appointment || null,
        messages: ticket.messages || [],
        ticketData: ticket, // Store full ticket data for navigation
      };
    });
  };

  // Fetch customer support tickets
  const fetchChatData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const response = await getSupportTickets();
      const tickets = response?.results || response?.data || response || [];
      const chatItems = convertTicketsToChatItems(tickets);
      setChatData(chatItems);
    } catch (err) {
      console.error('Error fetching chat data:', err);
      setError('Failed to load chat data');
      if (!isRefresh) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load chat data. Please try again.',
        });
      }
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  // Handle pull to refresh
  const onRefresh = () => {
    fetchChatData(true);
  };

  // Create new ticket
  const handleCreateTicket = async () => {
    if (!subject.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation',
        text2: 'Please enter a subject for the ticket.',
      });
      return;
    }

    try {
      setCreatingTicket(true);
      const newTicket = await createSupportTicket({
        subject: subject.trim(),
      });

      // Close modal and reset subject
      setShowCreateModal(false);
      setSubject('');

      // Navigate to chat screen with new ticket
      navigation.navigate('ChatingScreen', {
        ticketData: newTicket,
        isNewTicket: true,
      });

      // Refresh ticket list
      await fetchChatData(true);
    } catch (error: any) {
      console.error('Error creating ticket:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          'Failed to create ticket. Please try again.',
      });
    } finally {
      setCreatingTicket(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchChatData();
  }, []);

  const renderChatItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() =>
        navigation.navigate('ChatingScreen', {
          ticketData: item.ticketData || item,
          isNewTicket: false,
        })
      }
    >
      <View style={styles.avatarContainer}>
        <Image
          source={require('../assets/logo.png')}
          style={styles.avatar}
          resizeMode="cover"
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.chatName}>{item.message}</Text>
        <Text style={styles.chatMsg}>{item.name}</Text>
        <View style={styles.statusContainer}>
          {item.status && (
            <Text
              style={[
                styles.statusText,
                { color: item.status === 'open' ? '#4CAF50' : '#999' },
              ]}
            >
              Status: {item.status}
            </Text>
          )}
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
      </View>
      {/* <View style={styles.rightInfo}>
        <Text style={styles.timeText}>{item.time}</Text>
        {item.unreadCount > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.unreadCount}</Text>
          </View>
        ) : (
          <Icon name="checkmark-done" size={moderateScale(18)} color="black" />
        )}
      </View> */}
    </TouchableOpacity>
  );

  // Loading component
  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#555BCE" />
      <Text style={styles.loadingText}>Loading chats...</Text>
    </View>
  );

  // Error component
  const renderError = () => (
    <View style={styles.errorContainer}>
      <Icon name="alert-circle" size={48} color="#ff6b6b" />
      <Text style={styles.errorText}>Failed to load chats</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => fetchChatData()}
      >
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  // Show loading state
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={styles.header}>
          <Text style={styles.title}>Chats</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconCircle}>
              <Icon name="add" size={20} color="#fff" />
            </TouchableOpacity>
            <Image
              source={require('../assets/logo.png')}
              style={styles.profileImg}
            />
          </View>
        </View>
        {renderLoading()}
      </SafeAreaView>
    );
  }

  // Show error state
  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={styles.header}>
          <Text style={styles.title}>Tickets</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconCircle}>
              <Icon name="add" size={20} color="#fff" />
            </TouchableOpacity>
            <Image
              source={require('../assets/logo.png')}
              style={styles.profileImg}
            />
          </View>
        </View>
        {renderError()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.header}>
        <Text style={styles.title}>Tickets</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.iconCircle}
            onPress={() => setShowCreateModal(true)}
          >
            <Icon name="add" size={20} color="#fff" />
          </TouchableOpacity>
          <Image
            source={require('../assets/logo.png')}
            style={styles.profileImg}
          />
        </View>
      </View>
      <FlatList
        data={chatData}
        keyExtractor={item => item.id}
        renderItem={renderChatItem}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#555BCE']}
            tintColor="#555BCE"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="chatbubbles-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No chats found</Text>
            <Text style={styles.emptySubText}>
              No support tickets available
            </Text>
          </View>
        }
      />

      {/* Create Ticket Modal */}
      <Modal
        visible={showCreateModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Ticket</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowCreateModal(false);
                  setSubject('');
                }}
              >
                <Icon name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Subject</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter ticket subject"
                placeholderTextColor="#9CA3AF"
                value={subject}
                onChangeText={setSubject}
                multiline={false}
                autoFocus={true}
              />

              <TouchableOpacity
                style={[
                  styles.startChatButton,
                  (creatingTicket || !subject.trim()) &&
                    styles.startChatButtonDisabled,
                ]}
                onPress={handleCreateTicket}
                disabled={creatingTicket || !subject.trim()}
              >
                {creatingTicket ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.startChatButtonText}>Start Chat</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ChatsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: moderateScale(16),
    paddingBottom: verticalScale(40),
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: moderateScale(16),
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(14),
    backgroundColor: '#fff',
  },
  title: {
    fontSize: moderateScale(20),
    fontWeight: '600',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    backgroundColor: '#4952FB',
    padding: scale(4),
    borderRadius: scale(20),
    marginRight: scale(10),
  },
  profileImg: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#B5B5B5',
    borderRadius: scale(20),
    paddingHorizontal: scale(12),
    marginBottom: verticalScale(14),
    // marginHorizontal: scale(15),
  },
  input: {
    flex: 1,
    paddingVertical: verticalScale(8),
    fontSize: moderateScale(14),
  },
  mic: {
    marginLeft: scale(10),
    tintColor: '#4952FB',
  },
  filters: {
    flexDirection: 'row',
    marginBottom: verticalScale(20),
    justifyContent: 'flex-start',
    marginLeft: scale(10),
  },
  filterBtn: {
    borderColor: '#555BCE',
    borderWidth: 1,
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(6),
    borderRadius: scale(20),
    marginHorizontal: scale(6),
  },
  filterBtnActive: {
    backgroundColor: '#555BCE',
  },
  filterText: {
    color: '#555BCE',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  sectionTitle: {
    fontWeight: '700',
    fontSize: moderateScale(14),
    marginVertical: verticalScale(10),
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(18),
    borderBottomWidth: 1,
    borderBottomColor: '#E6E4E4',
    paddingBottom: verticalScale(10),
  },
  avatarContainer: {
    width: scale(46),
    height: scale(46),
    borderRadius: scale(23),
    marginRight: scale(12),
    borderWidth: 1,
    borderColor: '#E6E4E4',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: scale(65),
    height: scale(65),
  },
  chatName: {
    // fontWeight: '600',
    fontSize: moderateScale(15),
    color: '#000',
  },
  chatMsg: {
    color: '#666',
    fontSize: moderateScale(13),
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rightInfo: {
    alignItems: 'flex-end',
    marginLeft: scale(10),
  },
  timeText: {
    color: '#888',
    fontSize: moderateScale(12),
    marginBottom: verticalScale(4),
  },
  badge: {
    backgroundColor: '#37B24D',
    borderRadius: scale(10),
    paddingHorizontal: scale(6),
    paddingVertical: verticalScale(2),
  },
  badgeText: {
    color: '#fff',
    fontSize: moderateScale(12),
  },
  statusText: {
    color: '#888',
    fontSize: moderateScale(11),
    marginTop: verticalScale(2),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: verticalScale(40),
  },
  loadingText: {
    marginTop: verticalScale(16),
    fontSize: moderateScale(16),
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: verticalScale(40),
    paddingHorizontal: scale(20),
  },
  errorText: {
    marginTop: verticalScale(16),
    fontSize: moderateScale(16),
    color: '#ff6b6b',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: verticalScale(20),
    backgroundColor: '#555BCE',
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(12),
    borderRadius: scale(8),
  },
  retryButtonText: {
    color: '#fff',
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: verticalScale(60),
    paddingHorizontal: scale(20),
  },
  emptyText: {
    marginTop: verticalScale(16),
    fontSize: moderateScale(18),
    color: '#666',
    fontWeight: '600',
  },
  emptySubText: {
    marginTop: verticalScale(8),
    fontSize: moderateScale(14),
    color: '#999',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: scale(12),
    width: '85%',
    maxWidth: scale(400),
    padding: scale(20),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  modalTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#000',
  },
  modalBody: {
    marginTop: verticalScale(10),
  },
  modalLabel: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: verticalScale(8),
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#9E9C9C',
    borderRadius: scale(8),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(12),
    fontSize: moderateScale(14),
    color: '#1F2937',
    marginBottom: verticalScale(20),
  },
  startChatButton: {
    backgroundColor: '#4952FB',
    paddingVertical: verticalScale(12),
    borderRadius: scale(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  startChatButtonDisabled: {
    opacity: 0.6,
  },
  startChatButtonText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
});
