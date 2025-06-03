import {View, ScrollView, ActivityIndicator, StyleSheet, Text, SafeAreaView} from 'react-native';
import React, { useEffect, useState } from 'react';
import ChatList from '../../../components/ChatList';
import axios from 'axios'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useWebSocket} from "@/context/webSocketContext";
import {Header} from "react-native/Libraries/NewAppScreen";
import {StatusBar} from "expo-status-bar";


export default function Chats() {
  const [chats, setChats] = useState([]);
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  const [loading, setLoading] = useState(true);
  const { messages: wsMessages } = useWebSocket();
  const fetchChats = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        const response = await axios.get(`${apiUrl}/api/v1/chat/getConversations`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        //if(response.status === 401){
        //
        //}
        setChats(response.data);
        setLoading(false);
      } catch (error) {
        console.log('There is an error: ', error);
      } finally {
        setLoading(false);
      }
    };
  useEffect(() => {
    fetchChats();
  }, [wsMessages]);
  return (
      <>
    <SafeAreaView style={{flex: 1}}>
      {loading ? (
        <View style={styles.activityIndicator}>
          <ActivityIndicator size="large" color="gray" />
        </View>
      ) : chats.length > 0 ? ( // Проверяем длину массива
        <ScrollView>
          <ChatList chats={chats} />
        </ScrollView>
      ) : (
        <View style={styles.noChatsContainer}>
          <Text style={styles.noChatsText}>Нет чатов</Text>
        </View>
      )}
    </SafeAreaView>
      </>
  );
}

const styles = StyleSheet.create({
  activityIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noChatsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noChatsText: {
    fontSize: 16,
    color: 'gray',
  },
});