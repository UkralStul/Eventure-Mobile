import {Button, ScrollView, StyleSheet, Text, View} from 'react-native'
import React, {useEffect} from 'react'
import {useAuth} from "@/context/authContext";
import { Image } from 'expo-image';


const profile = () => {
    const {logout, user} = useAuth();
    const handleLogout = () => {
        logout();
    }
    const apiUrl = process.env.EXPO_PUBLIC_API_URL;
    const profileImage = `${apiUrl}/api/v1/images/avatar/${user.id}`;
    useEffect(() => {
        console.log('user - ', user)
    }, []);
    return (
    <ScrollView>
        <View style={styles.container}>
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
            <Text style={styles.nicknameText}>{user.username}</Text>
        </View>
    </ScrollView>
    )
}

export default profile

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    profileImage: {
        marginVertical: 20,
        width: '60%',
        aspectRatio: 1,
        borderRadius: 1000,
        overflow: 'hidden',
    },
    nicknameText: {
        marginVertical: 0,
        fontSize: 28,
        fontWeight: 'bold',
    },
})