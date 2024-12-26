import {
    ScrollView,
    StyleSheet,
    Text,
    View,
    RefreshControl,
} from 'react-native';
import React, {useContext, useEffect, useRef, useState} from 'react'
import UserTile from "@/components/UserTile";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import UserProfileBottomSheetModal from "@/components/UserProfileBottomSheetModal";
import {BottomSheetModal} from "@gorhom/bottom-sheet";
import fetchUserData from "@/constants/fetchUserData";
import {AuthContext} from "@/context/authContext";

interface NearbyUser {
    distance: number;
    user_id: string;
}

interface targetUser {
    id: number
    username: string
    profile_photo: string
    created_at: Date
    birth_date: Date
    about_me: string
    last_seen: Date
    is_friend: string
    friend_request_sent_by: string
}

const peoples = () => {
    const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
    const userProfileBottomSheetRef = useRef<BottomSheetModal>(null);
    const { handleTokenRefresh } = useContext(AuthContext);
    const [userProfile, setUserProfile] = useState<targetUser | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    // UserProfileOpen
    useEffect(() => {
        userProfileBottomSheetRef.current?.present();
    }, [userProfile]);

    const handleUserMarkerPress = async (userId: string) => {
        try{
            const userData = await fetchUserData(userId);
            if(userData.status == 401){
                await handleTokenRefresh();
                const response = await fetchUserData(userId);
                setUserProfile(response.data);
            } else {
                setUserProfile(userData.data);
            }
        } catch (error) {
            console.error("Ошибка при получении данных об пользователе:", error);
        }
    }
    useEffect(() => {
        fetchPeoples();
    }, []);

    const fetchPeoples = async () => {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL_GEO;
        const token = await AsyncStorage.getItem('authToken');
        const maxDistance = 5000;
        try {
            const response = await axios.get(`${apiUrl}/api/v1/userGeo/nearbyUsers`, {
                params: {
                    token: token,
                    max_distance: maxDistance,
                },
            });
            console.log('Nearby users:', response.data);
            setNearbyUsers(response.data);
        } catch (error) {
            console.error('Error fetching nearby users:', error);
        }
    }

    const onRefresh = async () => {
        setRefreshing(true); // Начинаем загрузку
        await fetchPeoples()
        setRefreshing(false); // Загрузка завершена
    };

    return (
        <ScrollView
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                />
            }
        >
            <View style={styles.container}>
                {nearbyUsers.map((user) => (
                    <UserTile
                        key={user.user_id}
                        userId={user.user_id.toString()}
                        distance={Math.round(user.distance).toString()}
                        onPress={() => {handleUserMarkerPress(user.user_id)}}
                    />
                ))}
                {userProfile && (
                    <UserProfileBottomSheetModal
                        ref={userProfileBottomSheetRef}
                        targetUser={userProfile}
                        onClose={() => setUserProfile(null)}
                    />
                )}
            </View>
        </ScrollView>
    )
}

export default peoples

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
})