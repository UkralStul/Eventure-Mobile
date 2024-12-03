import { View, StyleSheet, Image } from 'react-native';
import React, {useEffect, useState} from 'react';

import {ImageBackground} from "react-native";

export default function FriendOnMap({ user_id }) {
    const apiUrl = process.env.EXPO_PUBLIC_API_URL;
    // Формируем URI аватарки
    const avatarUri = `${apiUrl}/api/v1/images/avatar/${user_id}`;
    return (
        <View style={styles.avatarContainer}>
            <Image
                source={{ uri: avatarUri }}
                style={styles.avatar}
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
