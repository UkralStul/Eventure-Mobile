import {
  View,
  Text,
  FlatList,
  TextInput,
  Button,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import React, { useEffect, useState, useContext, useRef } from 'react';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useWebSocket } from '../../context/webSocketContext';
import MessageItem from '../../components/MessageItem';
import { AuthContext } from '../../context/authContext';

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
    console.log('item in chat: ', item);
  }, []);

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

  return (
      <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0} // Настройте значение offset, если необходимо
      >
        {loading ? (
            <View style={styles.activityIndicator}>
              <ActivityIndicator size="large" color="gray" />
            </View>
        ) : (
            <View style={styles.chatContainer}>
              <Text style={styles.chatTitle}>{item.name}</Text>

              {messages.length === 0 ? (
                  <Text style={styles.noMessagesText}>Сообщений нет</Text>
              ) : (
                  <FlatList
                      ref={flatListRef}
                      data={messages}
                      renderItem={renderMessageItem}
                      keyExtractor={(item) => item.id.toString()}
                  />
              )}

              <View style={styles.inputContainer}>
                <TextInput
                    value={messageInput}
                    onChangeText={setMessageInput}
                    placeholder="Введите сообщение"
                    style={styles.input}
                />
                <Button title="Отправить" onPress={handlePress} />
              </View>
            </View>
        )}
      </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  activityIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatContainer: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 16,
  },
  noMessagesText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: 'gray',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    flex: 1,
    marginRight: 8,
  },
});

export default Chat;
