import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Image,
} from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  useNavigation,
  useRoute,
  RouteProp,
  NavigationProp,
} from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  scale,
  verticalScale,
  moderateScale,
  s,
} from 'react-native-size-matters';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import { getSupportTicketById, sendTicketMessage } from '../api/support';

const ChatingScreen = () => {
  const route =
    useRoute<
      RouteProp<{ ChatingScreen: { ticketData: any; isNewTicket: boolean } }>
    >();
  const navigation = useNavigation<
    NavigationProp<{
      ChatingScreen: { ticketData: any; isNewTicket: boolean };
    }>
  >();

  // Get ticket data from navigation params
  const { ticketData, isNewTicket } = route.params || {};
  console.log('ticketData', ticketData);
  // State management
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [loading, setLoading] = useState(false);

  // User object for Gifted Chat
  const currentUser = {
    _id: 'customer',
    name: 'Customer',
    avatar: 'https://randomuser.me/api/portraits/men/85.jpg',
  };

  // Convert API message to Gifted Chat message format
  const convertAPIMessageToGiftedMessage = (apiMessage: any) => {
    if (!apiMessage) return null;

    const createdAt = apiMessage.created_at
      ? new Date(apiMessage.created_at)
      : new Date();
    // Check if message is from customer (not admin/support)
    const isCustomer =
      apiMessage.sender?.full_name !== 'admin' &&
      apiMessage.sender?.role !== 'admin';

    return {
      _id: apiMessage.id?.toString() || Math.random().toString(),
      text: apiMessage.message || apiMessage.text || '',
      createdAt,
      user: isCustomer
        ? currentUser
        : {
            _id: 'support',
            name: ticketData?.user || 'Support Agent',
            avatar: require('../assets/logo.png'),
          },
    };
  };

  // Fetch messages for the ticket
  const fetchMessages = async () => {
    if (!ticketData?.id) return;

    try {
      setLoading(true);
      const ticket = await getSupportTicketById(ticketData.id);

      if (ticket?.messages && Array.isArray(ticket.messages)) {
        const convertedMessages = ticket.messages
          .map(convertAPIMessageToGiftedMessage)
          .filter((msg: IMessage | null): msg is IMessage => msg !== null)
          .reverse(); // GiftedChat expects messages in reverse chronological order
        setMessages(convertedMessages);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  // Send message function for GiftedChat
  const onSend = useCallback(
    async (messages = []) => {
      if (!ticketData?.id) {
        Alert.alert('Error', 'Ticket ID not found. Cannot send message.');
        return;
      }

      const newMessage: any = messages[0];
      if (!newMessage || !newMessage.text) return;

      // Add the message to the local state immediately for optimistic UI
      setMessages(previousMessages =>
        GiftedChat.prepend(previousMessages, messages),
      );

      try {
        // Send message to API
        const response = await sendTicketMessage(ticketData.id, {
          message: newMessage.text,
        });

        // If API returns the message, update it with the real data
        if (response) {
          const realMessage = convertAPIMessageToGiftedMessage(response);
          if (realMessage) {
            setMessages(previousMessages =>
              previousMessages.map(msg =>
                msg._id === newMessage._id ? realMessage : msg,
              ),
            );
          }
        }

        // Refresh messages to get latest from server (including the sent message)
        await fetchMessages();
      } catch (error: any) {
        console.error('Error sending message:', error);
        // Remove the failed message
        setMessages(previousMessages =>
          previousMessages.filter((msg: any) => msg._id !== newMessage._id),
        );
        Alert.alert(
          'Error',
          error?.response?.data?.message ||
            'Failed to send message. Please try again.',
        );
      }
    },
    [ticketData?.id],
  );

  // Custom render functions for GiftedChat
  const renderBubble = (props: any) => {
    return (
      <View
        style={[
          props.position === 'left' ? styles.leftBubble : styles.rightBubble,
          props.containerStyle,
        ]}
      >
        <Text
          style={[
            props.position === 'left' ? styles.leftText : styles.rightText,
            props.textStyle,
          ]}
        >
          {props.currentMessage?.text}
        </Text>
        <View style={styles.timeContainer}>
          <Text style={[styles.timeText, { color: '#000' }]}>
            {new Date(props.currentMessage?.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }) || ''}
          </Text>
          {props.position === 'right' && (
            <View style={styles.tickContainer}>
              <Icon name="checkmark" size={12} color="#000" />
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderAvatar = (props: any) => {
    if (props.currentMessage?.user?._id === currentUser._id) {
      return null; // Don't show avatar for current user
    }
    return (
      <View style={styles.avatarContainer}>
        <Image
          source={require('../assets/logo.png')}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      </View>
    );
  };

  // Load messages on component mount
  useEffect(() => {
    if (ticketData?.id) {
      fetchMessages();
    } else {
      console.log('No ticket data available');
    }
  }, [ticketData?.id]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Icon name="chevron-back" size={moderateScale(20)} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.statusContainer}>
            <Text style={styles.username} numberOfLines={2}>
              Subject:{' '}
              <Text
                numberOfLines={2}
                style={{ fontSize: moderateScale(14), fontWeight: '400' }}
              >
                {ticketData?.message || ticketData?.subject || 'Support Agent'}
              </Text>
            </Text>
            <Text
              style={[
                styles.ticketStatus,
                { color: ticketData?.status === 'open' ? '#4CAF50' : '#999' },
              ]}
            >
              {ticketData?.status}
            </Text>
            {/* <Text style={styles.status}>{'Support Chat'}</Text> */}
          </View>
        </View>
      </View>

      {/* GiftedChat Interface */}
      <GiftedChat
        // @ts-expect-error - GiftedChat type inference issue with react-native-gifted-chat v3 alpha
        messages={messages}
        onSend={onSend}
        user={currentUser}
        renderBubble={renderBubble}
        renderAvatar={renderAvatar}
        // renderTime={renderTime}
        placeholder="Type a message..."
        alwaysShowSend
        isLoadingEarlier={loading}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4952FB" />
            <Text style={styles.loadingText}>Loading messages...</Text>
          </View>
        )}
        // inverted={false}
        textInputProps={{
          multiline: true,
          maxLength: 500,
          placeholderTextColor: '#999',
          style: {
            color: '#000',
            flex: 1,
            paddingLeft: scale(15),
            borderWidth: 1,
            borderColor: '#999',
            borderRadius: scale(20),
            backgroundColor: '#F1F1F1',
            marginVertical: verticalScale(5),
            marginHorizontal: scale(10),
          },
        }}
        renderSend={props => (
          <TouchableOpacity
            style={[
              styles.sendButton,
              !props.text?.trim() && styles.sendButtonDisabled,
            ]}
            onPress={() => {
              if (props.text?.trim() && props.onSend) {
                const message: IMessage = {
                  _id: Math.random().toString(),
                  text: props.text.trim(),
                  createdAt: new Date(),
                  user: currentUser,
                };
                // @ts-ignore - GiftedChat type inference issue
                props.onSend([message], true);
              }
            }}
            disabled={!props.text?.trim()}
          >
            <Icon name="send" size={moderateScale(18)} color="#fff" />
          </TouchableOpacity>
        )}
        keyboardShouldPersistTaps="never"
      />
    </SafeAreaView>
  );
};

export default ChatingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(10),
    paddingVertical: verticalScale(16),
    backgroundColor: '#E6F3FF',
    // paddingTop: verticalScale(40),
    borderBottomLeftRadius: scale(20),
    borderBottomRightRadius: scale(20),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  backBtn: {
    backgroundColor: '#4952FB',
    padding: scale(6),
    borderRadius: scale(20),
    // marginBottom: verticalScale(10),
  },
  headerInfo: {
    flex: 1,
    marginLeft: scale(10),
  },
  username: {
    fontWeight: '600',
    fontSize: moderateScale(14),
    color: '#000',
    maxWidth: '85%',
  },
  status: {
    fontSize: moderateScale(13),
    color: 'gray',
    fontWeight: '500',
  },
  ticketStatus: {
    fontSize: moderateScale(11),
    color: '#4CAF50',
    fontWeight: '500',
    marginTop: verticalScale(2),
  },
  headerIcon: {
    marginHorizontal: scale(6),
  },
  // Gifted Chat styles
  chatContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // Custom message bubble styles
  messageBubble: {
    maxWidth: '80%',
    padding: scale(12),
    borderRadius: scale(18),
    marginVertical: verticalScale(4),
    marginHorizontal: scale(8),
  },
  myBubble: {
    backgroundColor: '#F8E8FD',
    alignSelf: 'flex-end',
    borderBottomRightRadius: scale(4),
  },
  theirBubble: {
    backgroundColor: '#f0f0f0',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: scale(4),
  },
  messageText: {
    fontSize: moderateScale(14),
    lineHeight: moderateScale(20),
  },
  myText: {
    color: '#fff',
  },
  theirText: {
    color: '#000',
  },
  messageTime: {
    fontSize: moderateScale(11),
    marginTop: verticalScale(4),
    opacity: 0.7,
  },
  tickContainer: {
    // position: 'absolute',
    // bottom: scale(4),
    // right: scale(8),
  },
  // Fallback styles
  chatList: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chatContent: {
    paddingVertical: verticalScale(10),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(10),
    backgroundColor: '#E6F3FF',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: scale(20),
    paddingHorizontal: scale(15),
    paddingVertical: verticalScale(10),
    marginRight: scale(10),
    maxHeight: verticalScale(100),
    fontSize: moderateScale(14),
  },
  sendButton: {
    backgroundColor: '#4952FB',
    // width: scale(40),
    // height: scale(40),
    padding: scale(11),
    borderRadius: scale(20),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    // marginTop: verticalScale(5),
    marginVertical: verticalScale(5),
    marginRight: scale(10),
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  // Empty state styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: verticalScale(40),
  },
  emptyText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#666',
    marginTop: verticalScale(10),
    marginBottom: verticalScale(5),
  },
  emptySubText: {
    fontSize: moderateScale(14),
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: scale(20),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: verticalScale(40),
  },
  loadingText: {
    marginTop: verticalScale(10),
    fontSize: moderateScale(14),
    color: '#666',
  },
  // GiftedChat specific styles
  leftBubble: {
    backgroundColor: '#E0F3FF',
    borderRadius: scale(10),
    // borderBottomLeftRadius: scale(4),
    padding: scale(12),
    marginVertical: verticalScale(2),
    minWidth: '50%',
    marginRight: s(38),
  },
  rightBubble: {
    // backgroundColor: '#4952FB',
    backgroundColor: '#F8E8FD',
    borderRadius: scale(10),
    // borderBottomRightRadius: scale(4),
    padding: scale(12),
    marginVertical: verticalScale(2),
    minWidth: '50%',
    marginLeft: s(38),
  },
  leftText: {
    color: '#000',
    fontSize: moderateScale(14),
    // lineHeight: moderateScale(10),
  },
  rightText: {
    color: '#000',
    fontSize: moderateScale(14),
    // lineHeight: moderateScale(10),
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    justifyContent: 'flex-end',
  },
  timeText: {
    fontSize: moderateScale(10),
    color: '#999',
    marginTop: verticalScale(2),
  },
  avatarContainer: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    // backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
    // marginRight: scale(8),
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  inputToolbar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
  },
  textInputStyle: {
    flex: 1,
    fontSize: moderateScale(14),
    color: '#000',
    maxHeight: verticalScale(100),
    marginRight: scale(8),
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
