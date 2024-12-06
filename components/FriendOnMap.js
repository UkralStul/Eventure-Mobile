import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

export default function FriendOnMap({ user_id }) {
    const apiUrl = process.env.EXPO_PUBLIC_API_URL;
    // Формируем URI аватарки
    const avatarUri = `${apiUrl}/api/v1/images/avatar/${user_id}`;

    return (
        <View style={styles.avatarContainer}>
            <Image
                source={avatarUri}
                style={styles.avatar}
                contentFit="cover" // Устанавливаем как изображение будет обрезано
                transition={1000} // Добавляем анимацию перехода при загрузке
                cachePolicy={'none'}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    avatarContainer: {
        width: 32, // Размер круга
        height: 32,
        borderRadius: 15, // Половина ширины и высоты для получения круга
        overflow: 'hidden', // Обрезаем изображение, чтобы оно не выходило за границы круга
        borderWidth: 1,
        borderColor: 'black', // Цвет границы
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatar: {
        width: 50, // Размер аватарки
        height: 50,
        borderRadius: 25, // Половина ширины и высоты для получения круга
    },
});
