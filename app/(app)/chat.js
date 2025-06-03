import {
  View,
  Text,
  FlatList,
  TextInput,
  Button,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform, SafeAreaView, Keyboard
} from 'react-native';
import React, { useEffect, useState, useContext, useRef } from 'react';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useWebSocket } from '../../context/webSocketContext';
import MessageItem from '../../components/MessageItem';
import { AuthContext } from '../../context/authContext';
import { useHeaderHeight } from '@react-navigation/elements';

const Chat = () => {
  const { user } = useContext(AuthContext);
  const { messages: wsMessages, sendMessage } = useWebSocket();
  const route = useRoute();
  const { item } = route.params;
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef(null);

  const fetchMessages = async (page) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.get(`${apiUrl}/api/v1/chat/getMessages/${item.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        params: {
          page: page,
        },
      });
      const sortedMessages = response.data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      setMessages(sortedMessages);
      setLoading(false);
      scrollToBottom();
    } catch (error) {
      console.log('There is an error: ', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(1);
    console.log('item in chat: ', item.users[0].username);
  }, []);

  useEffect(() => {
    // Подписываемся на события клавиатуры
    const keyboardDidShowListener = Keyboard.addListener(
        Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow', // На Android 'keyboardWillShow' может быть ненадежным
        () => {
          scrollToBottom();
        }
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, [scrollToBottom]);

  useEffect(() => {
    if (wsMessages) {
      const messagesArray = Array.isArray(wsMessages) ? wsMessages : [wsMessages];
      if (messagesArray.length > 0) {
        const parsedMessages = messagesArray.map((msg) =>
            typeof msg === 'string' ? JSON.parse(msg) : msg
        );
        setMessages((prevMessages) => [...prevMessages, ...parsedMessages]);
        scrollToBottom();
      }
    }
  }, [wsMessages]);

  const handlePress = () => {
  if (messageInput.length !== 0) {
    const receiver = item.users.find(u => u.id !== user.id);
    if (!receiver) {
      console.error("Получатель не найден!");
      return;
    }
    sendMessage(item.id, messageInput, receiver.id);
    setMessageInput('');
    scrollToBottom();
  }
};

  const renderMessageItem = ({ item }) => {
    const newItem = {
      ...item,
      isSender: user.id === item.sender_id,
    };
    return <MessageItem content={newItem} />;
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({ animated: true });
      }
    }, 100);
  };

  const headerHeight = useHeaderHeight();

  return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.outerContainer}>
          {loading ? (
              <View style={styles.activityIndicator}>
                <ActivityIndicator size="large" color="gray" />
              </View>
          ) : (
              <>
                {messages.length === 0 && !loading ? (
                    <Text style={styles.noMessagesText}>Сообщений нет</Text>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderMessageItem}
                        keyExtractor={(item, index) => item.id?.toString() || `msg-${index}`}
                        style={styles.flatList} // Важно, чтобы FlatList мог растягиваться
                        contentContainerStyle={styles.flatListContent}

                    />
                )}

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    keyboardVerticalOffset={headerHeight}
                >
                  <View style={styles.inputContainer}>
                    <TextInput
                        value={messageInput}
                        onChangeText={setMessageInput}
                        placeholder="Введите сообщение"
                        style={styles.input}
                        multiline
                    />
                    <Button title="Отправить" onPress={handlePress} />
                  </View>
                </KeyboardAvoidingView>
              </>
          )}
        </View>
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  outerContainer: {
    flex: 1,
  },
  activityIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flatListContent: {
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 8,
  },
  noMessagesText: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 16,
    color: 'gray',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  input: {
    borderColor: '#D1D5DB',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    paddingHorizontal: 12,
    flex: 1,
    marginRight: 8,
    backgroundColor: 'white',
    fontSize: 16,
  },
});

export default Chat;