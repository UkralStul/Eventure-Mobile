import {Alert, ScrollView, StyleSheet, Text, View, FlatList, RefreshControl, TouchableOpacity} from 'react-native'
import React, {useEffect, useRef, useState} from 'react'
import { useAuth } from "@/context/authContext";
import { Image } from 'expo-image';
import ChangeProfilePictureButton from "@/components/ChangeProfilePictureButton";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import EventUpdateBottomSheetModal from "@/components/EventUpdateBottomSheetModal";
import {BottomSheetModal} from "@gorhom/bottom-sheet";

interface UpdateEvent {
    name: string
    description: string
    id: number;
}

const Profile = () => {
    const { logout, user } = useAuth();
    const [imageVersion, setImageVersion] = useState(0);
    const [userEvents, setUserEvents] = useState<any[]>([]);
    const [loadingEvents, setLoadingEvents] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const apiUrl = process.env.EXPO_PUBLIC_API_URL;
    const apiUrlGeo = process.env.EXPO_PUBLIC_API_URL_GEO;
    const eventUpdateBottomSheetRef = useRef<BottomSheetModal>(null);
    const [updateEvent, setUpdateEvent] = useState<UpdateEvent | null>(null);

    const onUpdatePress = (name: string, description: string, id: number) => {
        setUpdateEvent({name, description, id});
        console.log('onUpdatePress', name, description);
    }

    useEffect(() => {
        if (updateEvent) { // Проверяем, что updateEvent не null
            eventUpdateBottomSheetRef.current?.present();
        }
    }, [updateEvent]);

    const onDeletePress = async (eventId: number) => {
        Alert.alert(
            'Подтверждение удаления',
            'Вы точно хотите удалить это событие? Это действие нельзя отменить.',
            [
                {
                    text: 'Отмена',
                    style: 'cancel',
                },
                {
                    text: 'Удалить',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem('authToken');

                            const response = await axios.delete(
                                `${apiUrlGeo}/api/v1/events/${eventId}`,
                                { params: { token } }
                            );

                            // Обновление состояния или навигация
                            Alert.alert('Успех', 'Событие успешно удалено');
                            loadUserEvents();
                        } catch (error) {
                            console.error('Ошибка удаления:', error);
                            Alert.alert('Ошибка', 'Не удалось удалить событие');
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };

    const loadUserEvents = async () => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            const response = await axios.get(`${apiUrlGeo}/api/v1/events/userMadeEvents`, {
                params: {
                    token,
                },
            });
            setUserEvents(response.data);
        } catch (error) {
            Alert.alert('Ошибка', 'Не удалось загрузить мероприятия');
            console.error('Events load error:', error);
        } finally {
            setLoadingEvents(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            // Обновляем и мероприятия и аватар
            await Promise.all([
                loadUserEvents(),
                setImageVersion(v => v + 1) // Форсируем обновление аватара
            ]);
        } catch (error) {
            Alert.alert('Ошибка', 'Не удалось обновить данные');
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadUserEvents();
    }, []);

    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const handleImagePick = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets) {
                setSelectedImage(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Ошибка при выборе изображения');
        }
    };

    useEffect(() => {
        const uploadImage = async () => {
            try {
                if (!selectedImage) return;

                const formData = new FormData();
                const filename = selectedImage.split('/').pop();

                const fileObject = {
                    uri: selectedImage,
                    name: filename || `avatar_${Date.now()}.jpg`,
                    type: 'image/jpeg',
                };

                formData.append('file', fileObject as any);

                const token = await AsyncStorage.getItem('authToken');
                if (!token) return;

                const response = await axios.post(
                    `${apiUrl}/api/v1/images/uploadAvatar`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data',
                        }
                    }
                );

                if (response.status === 200) {
                    Alert.alert('Успех', 'Аватар обновлен');
                    setImageVersion(v => v + 1);
                }
            } catch (error) {
                Alert.alert('Ошибка загрузки', error instanceof Error ? error.message : 'Неизвестная ошибка');
            }
        };

        if (selectedImage) {
            uploadImage();
        }
    }, [selectedImage]);

    const renderEventItem = ({ item }: { item: any }) => (
        <View style={styles.eventCard}>
            <Image
                source={{ uri: `${apiUrlGeo}/api/v1/events/preview/${item.id}` }}
                style={styles.eventImage}
                cachePolicy={'none'}
            />
            <Text style={styles.eventTitle}>{item.name}</Text>
            <Text style={styles.eventDescription}>{item.description}</Text>
            <View style={{flexDirection: 'row'}}>
                <TouchableOpacity
                    style={{ marginHorizontal: 15}}
                    onPress={() => {onUpdatePress(item.name, item.description, item.id)}}
                >
                    <Text>Изменить</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onDeletePress(item.id)}>
                    <Text>Удалить</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <ScrollView
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    colors={['#2c3e50']}
                    tintColor="#2c3e50"
                />
            }
        >
            <View style={styles.container}>
                <Image
                    cachePolicy={"none"}
                    source={{ uri: `${apiUrl}/api/v1/images/avatar/${user.id}?v=${imageVersion}` }}
                    style={styles.profileImage}
                />
                <Text style={styles.nicknameText}>{user.username}</Text>
                <ChangeProfilePictureButton onPress={handleImagePick} />

                <Text style={styles.sectionTitle}>Мои мероприятия</Text>

                {loadingEvents ? (
                    <Text>Загрузка мероприятий...</Text>
                ) : userEvents.length === 0 ? (
                    <Text style={styles.emptyText}>Нет созданных мероприятий</Text>
                ) : (
                    <FlatList
                        data={userEvents}
                        renderItem={renderEventItem}
                        keyExtractor={(item) => item.id.toString()}
                        scrollEnabled={false}
                    />
                )}
            </View>
            {updateEvent && (
                <EventUpdateBottomSheetModal
                    ref={eventUpdateBottomSheetRef}
                    name={updateEvent?.name}
                    description={updateEvent?.description}
                    id={updateEvent.id}
                    onClose={() => setUpdateEvent(null)}
                />
            )}
        </ScrollView>

    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        padding: 20,
    },

    eventImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 12,
    },
    profileImage: {
        marginVertical: 20,
        width: 200,
        height: 200,
        borderRadius: 100,
    },
    nicknameText: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#2c3e50',
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginVertical: 20,
        color: '#2c3e50',
        alignSelf: 'flex-start',
    },
    eventCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        width: 300,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    eventTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
        color: '#2c3e50',
    },
    eventDescription: {
        fontSize: 16,
        color: '#666',
        marginBottom: 12,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        marginVertical: 20,
    },
});

export default Profile;