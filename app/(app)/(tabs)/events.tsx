import React, {useState, useEffect, useCallback, useRef, useContext} from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Platform } from 'react-native';
import EventTile from "@/components/EventTile";
import {fetchNearbyEvents} from "@/constants/fetchNearbyEvents";
import EventDescriptionBottomSheet from "@/components/EventDescriptionBottomSheet";
import UserProfileBottomSheetModal from "@/components/UserProfileBottomSheetModal";
import {BottomSheetModal} from "@gorhom/bottom-sheet";
import fetchUserData from "@/constants/fetchUserData";
import fetchEventData from "@/constants/fetchEventData";
import {useNavigation} from "@react-navigation/native";
import {AuthContext} from "@/context/authContext";

interface Event {
    id: number;
    name: string;
    description: string;
    latitude: number;
    longitude: number;
    participants: Array<{
        id: number;
        email: string;
        username: string;
        profile_photo: string;
    }>;
}

interface EventNearbyResponse {
    id: number;
    name: string;
    description: string;
    distance: number;
    participants: number[];
    preview_picture?: string;
    created_by: number;
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

const PeoplesScreen = ({ token }: { token: string }) => {
    const [events, setEvents] = useState<EventNearbyResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const eventDescriptionBottomSheetRef = useRef<BottomSheetModal>(null);
    const [eventDescription, setEventDescription] = useState<Event | string | null>(null)
    const [userProfile, setUserProfile] = useState<targetUser | null>(null);
    const navigation = useNavigation<any>();
    const { user, handleTokenRefresh } = useContext(AuthContext);
    const userProfileBottomSheetRef = useRef<BottomSheetModal>(null);

    // UserProfileOpen
    useEffect(() => {
        console.log('present')
        userProfileBottomSheetRef.current?.present();
    }, [userProfile]);

    const handleUserMarkerPress = async (userId: string) => {
        if (userId == user.id){
            navigation.navigate('profile');
            eventDescriptionBottomSheetRef.current?.dismiss();
        } else {
            try{
                const userData = await fetchUserData(userId);
                if(userData.status == 401){
                    handleTokenRefresh();
                    const userData = await fetchUserData(userId);
                    console.log('user profile:', userProfile);
                }
                setUserProfile(userData.data);
            } catch (error) {
                console.error("Ошибка при получении данных об пользователе:", error);
            }}
    }
    const handleEventPress = async (markerId: number) => {
        try {
            const eventData = await fetchEventData(markerId); // Получение данных о событии
            setEventDescription(eventData); // Передача данных в EventDescriptionBottomSheet
        } catch (error) {
            console.error("Ошибка при получении данных об ивенте:", error);
        }
    };
// Отображение описания ивента
    useEffect(() => {
        if (eventDescription) {
            eventDescriptionBottomSheetRef.current?.present();
        }
    }, [eventDescription]);

    // Загрузка данных при монтировании
    const loadData = useCallback(async () => {
        try {
            const nearbyEventsResponse = await fetchNearbyEvents();
            if(nearbyEventsResponse.status === 401){
                handleTokenRefresh();
            } else {
                setEvents(nearbyEventsResponse.data);
                setError(null);
            }

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [token]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Обновление при скролле вниз
    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        loadData();
    }, [loadData]);
    // Рендер элемента списка
    const renderEventItem = ({ item }: { item: EventNearbyResponse }) => (
        <EventTile
            id={item.id}
            name={item.name}
            description={item.description}
            distance={item.distance}
            participants={item.participants}
            preview_picture={item.preview_picture}
            created_by={item.created_by}
            onPress={() => handleEventPress(item.id)}
        />
    );

    if (loading) {
        return (
            <View style={styles.centered}>
                <Text>Loading events...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Text style={styles.error}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={events}
                renderItem={renderEventItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={['#0000ff']}
                        tintColor="#0000ff"
                    />
                }
                ListEmptyComponent={
                    <View style={styles.centered}>
                        <Text>No events found nearby</Text>
                    </View>
                }
            />
            {eventDescription && (
                <EventDescriptionBottomSheet
                    handleUserMarkerPress={handleUserMarkerPress}
                    userProfileBottomSheetRef={userProfileBottomSheetRef}
                    ref={eventDescriptionBottomSheetRef}
                    event={eventDescription as Event}
                    onClose={() => setEventDescription(null)}
                />
            )}
            {userProfile && (
                <UserProfileBottomSheetModal
                    ref={userProfileBottomSheetRef}
                    targetUser={userProfile}
                    onClose={() => setUserProfile(null)}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    listContent: {
        padding: 16,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    error: {
        color: 'red',
        fontSize: 16,
    },
});

export default PeoplesScreen;