import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import fetchUserData from '@/constants/fetchUserData';
import { AxiosResponse } from 'axios';
import MessageButton from "@/components/MessageButton";

interface UserData {
    profilePicture: string;
    username: string;
    about_me: string;
}

interface UserTileProps {
    userId: string;
    distance: string;
}

const UserTile = (props: UserTileProps) => {
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState<UserData | null>(null);

    useEffect(() => {
        const loadUserData = async () => {
            setLoading(true);
            try {
                const response: AxiosResponse<UserData> = await fetchUserData(props.userId);
                setUserData(response.data);
            } catch (error) {
                console.error("Failed to fetch user data", error);
            } finally {
                setLoading(false);
            }
        };
        loadUserData();
    }, [props.userId]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (!userData) {
        return (
            <View style={styles.container}>
                <Text>Could not load user data</Text>
            </View>
        );
    }

    const apiUrl = process.env.EXPO_PUBLIC_API_URL;
    const avatarUri = `${apiUrl}/api/v1/images/avatar/${props.userId}?t=${new Date().getTime()}`;
    return (
        <TouchableOpacity style={styles.container}>
            <View style={styles.avatarContainer}>
                <Image source={{ uri: avatarUri }} style={styles.avatar} />
            </View>
            <View style={styles.userInfoContainer}>
                <View style={{ flex: 1}}>
                    <Text style={styles.usernameText}>{userData.username}</Text>
                </View>
                {userData.about_me ? (
                    <Text style={styles.aboutMeText} numberOfLines={2}>
                        {userData.about_me}
                    </Text>
                ) : (
                    <Text style={styles.aboutMeText}>
                        Пользователь не указал информации о себе
                    </Text>
                )}
                <View style={{ flex: 1, flexDirection: "row"}}>
                    <Text style={styles.distanceText}>{props.distance}</Text>
                    <Text style={styles.aboutMeText}>метров от вас</Text>
                </View>
            </View>
            <View style={styles.buttonContainer}>
                <MessageButton userId={props.userId} bottomSheetRef={undefined} />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    userInfoContainer: {
        flex: 3,
        flexDirection: 'column',
        marginLeft: 10,
        marginRight: 10,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    avatarContainer: {
        flex: 1,
        alignItems: 'center',
        marginRight: 10,
    },
    buttonContainer: {
        flex: 1,
        alignItems: 'flex-end',
        marginLeft: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    usernameText: {
        fontWeight: 'bold',
        fontSize: 18,
    },
    aboutMeText: {
        color: 'gray',
        marginTop: 2,
        fontSize: 14,
    },
    distanceText: {
        fontSize: 18,
        color: 'green',
        fontWeight: 'bold',
        marginRight: 5,
    }
});

export default UserTile;