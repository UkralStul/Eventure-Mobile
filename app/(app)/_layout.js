import React from 'react'
import { Slot, Stack } from 'expo-router'
import { WebSocketProvider } from '../../context/webSocketContext';
import { GeoWebSocketProvider } from '../../context/geoWebSocketContext';
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {BottomSheetModalProvider} from "@gorhom/bottom-sheet";


export default function TabLayout() {
  return (
    <WebSocketProvider>
      <GeoWebSocketProvider>
        <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
                name="chat"
                options={({ route }) => {
                    const params = route.params || {};
                    let title = 'Чат';
                    if (params.item.users[0].username) {
                        title = params.item.users[0].username;
                    }

                    return {
                        presentation: 'modal',
                        // headerBackTitleVisible: false, // Если не нужна текстовая метка "Назад" на iOS
                        title: title, // Устанавливаем заголовок
                        // Вы можете добавить другие опции хедера здесь
                        // headerStyle: { backgroundColor: '#f4511e' },
                        // headerTintColor: '#fff',
                        // headerTitleStyle: { fontWeight: 'bold' },
                    };
                }}
            />
        </Stack>
      </GeoWebSocketProvider>
    </WebSocketProvider>
  );
}