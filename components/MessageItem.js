import { View, Text, Image, StyleSheet } from 'react-native';
import React from 'react';


export default function MessageItem({ content }) {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  const avatarUri = content.sender_id ? `${apiUrl}/api/v1/images/avatar/${content.sender_id}` : 'https://via.placeholder.com/150';

  const readableTimestamp = formatTimestamp(content.timestamp);

  return (
      <View style={[styles.container, content.isSender ? styles.justifyEnd : styles.justifyStart]}>
        {!content.isSender && (
            <Image
                source={{ uri: avatarUri }}
                style={styles.avatar}
                onError={(e) => console.log('Failed to load avatar:', e.nativeEvent.error, avatarUri)}
            />
        )}
        <View style={[styles.messageBox, content.isSender ? styles.senderBackground : styles.receiverBackground]}>
          <Text style={styles.messageText}>{content.content}</Text>
          <Text style={styles.timestamp}>{readableTimestamp}</Text>
        </View>
      </View>
  );
}

function formatTimestamp(timestampString) {
  if (!timestampString) {
    return '';
  }
  try {
    const date = new Date(timestampString);
    if (isNaN(date.getTime())) {
      // console.warn('Invalid timestamp for formatting:', timestampString);
      return timestampString; // Возвращаем как есть, если дата невалидна
    }
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    // Простая логика: если сегодня - только время, иначе - дата и время
    const today = new Date();
    if (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    ) {
      return `${hours}:${minutes}`; // Сегодня
    } else {
      // Для других дней можно добавить отображение даты
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Месяцы от 0 до 11
      // const year = date.getFullYear(); // Если нужен год
      return `${day}.${month} ${hours}:${minutes}`; // Например: 10.02 16:42
    }
  } catch (error) {
    // console.error('Error in formatTimestamp:', error);
    return timestampString; // Возвращаем как есть в случае ошибки
  }
}


const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  justifyEnd: {
    justifyContent: 'flex-end',
  },
  justifyStart: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#E5E7EB', // Плейсхолдер цвет для аватара, пока он грузится
  },
  messageBox: {
    paddingVertical: 8,
    paddingHorizontal: 12, // Увеличил немного горизонтальный padding
    borderRadius: 12, // Сделал чуть более скругленным
    maxWidth: '80%',
    elevation: 1, // Небольшая тень для Android
    shadowColor: '#000', // Тень для iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  senderBackground: {
    backgroundColor: '#A7F3D0', // светло-зеленый
    marginLeft: 'auto', // Добавлено для выравнивания вправо, если это единственный элемент в justifyEnd
  },
  receiverBackground: {
    backgroundColor: '#FFFFFF', // белый
  },
  messageText: {
    fontSize: 16,
    color: '#1F2937', // Чуть темнее для лучшей читаемости
  },
  timestamp: {
    fontSize: 11, // Уменьшил для компактности
    color: '#6B7280', // серый
    textAlign: 'right',
    marginTop: 4,
  },
});