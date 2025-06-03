import { View, Text, Platform, Image} from 'react-native'
import React from 'react'
import { Slot, Stack } from 'expo-router'
import { Tabs } from 'expo-router';
import { WebSocketProvider } from '../../../context/webSocketContext';
import {BottomSheetModalProvider} from "@gorhom/bottom-sheet";
import {StatusBar} from "expo-status-bar";


export default function TabLayout() {
  return (
      <>
          <StatusBar
              style="dark"
              translucent={false}
          />
          <Tabs
            detachInactiveScreens={Platform.OS === "android" ? false : true}
            screenOptions={{
                tabBarActiveTintColor: 'blue',
                headerShown: false,
        }}
        >
            <Tabs.Screen
                name="events"
                options={{
                    title: 'События',
                    tabBarIcon: ({ size }) => (
                        <Image
                            source={require('../../../assets/images/event-icon.png')}
                            style={{ width: size, height: size, resizeMode: 'contain'  }}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Профиль',
                    tabBarIcon: ({ size }) => (
                        <Image
                            source={require('../../../assets/images/profile-icon.png')}
                            style={{ width: size, height: size, resizeMode: 'contain'  }}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="map"
                options={{
                    title: 'Карта',
                    tabBarIcon: ({ size }) => (
                        <Image
                            source={require('../../../assets/images/map-icon.png')}
                            style={{ width: size, height: size, resizeMode: 'contain'  }}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="chats"
                options={{
                    title: 'Чаты',
                    tabBarIcon: ({ size }) => (
                        <Image
                            source={require('../../../assets/images/chat-icon.png')}
                            style={{ width: size, height: size, resizeMode: 'contain'  }}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="peoples"
                options={{
                    title: 'Люди',
                    tabBarIcon: ({ size }) => (
                        <Image
                            source={require('../../../assets/images/peoples-icon.png')}
                            style={{ width: size, height: size, resizeMode: 'contain'  }}
                        />
                    ),
                }}
            />
        </Tabs>
      </>
  );
}
