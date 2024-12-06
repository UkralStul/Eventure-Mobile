import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Image } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MessageButtonProps {
  friendStatus: string;
  userId: string;
  friend_request_sent_by: string
}

const AddToFriendsButton: React.FC<MessageButtonProps> = ({ userId, friendStatus, friend_request_sent_by }) => {
  // Инициализируем состояние buttonStatus значением friendStatus.
  const [buttonStatus, setButtonStatus] = useState<string | null>(friendStatus);
  useEffect(() => {
    // Обновляем состояние buttonStatus при изменении friendStatus
    setButtonStatus(friendStatus);
  }, [friendStatus]); // Зависимость от friendStatus

  const makeApiCall = async (method: string, userId: string) => {
    const apiUrl = process.env.EXPO_PUBLIC_API_URL;
    const token = await AsyncStorage.getItem('authToken');
    if (method === 'post') {
      const response = await axios.post(
        `${apiUrl}/api/v1/friends/sendFriendsRequest?target_user_id=${userId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } else {
      const response = await axios.delete(
        `${apiUrl}/api/v1/friends/removeFriend?target_user_id=${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      return response.data;
    }
  };

  const handlePress = async (userId: string, friendStatus: string | null) => {
    if ((friendStatus === 'accepted' || friendStatus === 'pending') && (friend_request_sent_by != userId)) {
      const response = await makeApiCall('delete', userId);
      if (response.message === 'Friendship removed.') {
        setButtonStatus(null); // После успешного удаления друга обновляем статус кнопки
      }
    } else if(((friendStatus === 'accepted' || friendStatus === 'pending') && (friend_request_sent_by == userId))){
      const response = await makeApiCall('post', userId);
      if (response.message === 'Friendship established.') {
        setButtonStatus('accepted'); // После успешного удаления друга обновляем статус кнопки
      }
    } else {
      const response = await makeApiCall('post', userId);
      if (response.message === 'Friend request sent.') {
        setButtonStatus('pending'); // После отправки запроса на дружбу обновляем статус кнопки
      }
    }
  };

  return (
    <TouchableOpacity onPress={() => handlePress(userId, buttonStatus)}>
      <View style={styles.container}>
        <Image
          source={
            buttonStatus === 'accepted'
              ? require('../assets/images/deleteFriend.png') // Картинка для статуса "accepted"
              : buttonStatus === 'pending'
              ? require('../assets/images/alreadyFriend.png') // Картинка для статуса "pending"
              : require('../assets/images/addToFriends.png') // Картинка по умолчанию
          }
          style={styles.image}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 75,
    height: 50,
    borderRadius: 15,
    backgroundColor: '#b0b0b0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 50,
    height: 50,
  },
});

export default AddToFriendsButton;
