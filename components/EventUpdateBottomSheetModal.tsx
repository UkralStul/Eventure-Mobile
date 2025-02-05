import {View, StyleSheet, Text, TouchableOpacity, Alert, Image} from 'react-native';
import React, {forwardRef, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetTextInput,
    BottomSheetView,
    useBottomSheetSpringConfigs
} from '@gorhom/bottom-sheet';
import ConfirmButton from "@/components/ConfirmButton";
import * as ImagePicker from 'expo-image-picker'; // 🚨 NEW: Image picker
import {Platform} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { AxiosResponse } from 'axios';



interface EventUpdateProps {
    id: number;
    name: string;
    description: string;
    onClose?: () => void;
}

const EventCreationBottomSheetModal = React.memo(forwardRef<BottomSheetModal, EventUpdateProps>((props, ref) => {
    const { name, description, onClose, id } = props;
    const localNameRef = useRef(name);
    const localDescriptionRef = useRef(description);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleNameChange = useCallback((text: string) => {
        localNameRef.current = text;
    }, []);

    const handleDescriptionChange = useCallback((text: string) => {
        localDescriptionRef.current = text;
    }, []);

    useEffect(() => {
        (async () => {
            if (Platform.OS !== 'web') {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Разрешение требуется', 'Нужен доступ к галерее для загрузки изображений');
                }
            }
        })();
        console.log('Update BottomSheet opened with props name:', name, 'description: ', description, 'id: ', id);
    }, []);

    const handleUpdateSave = async () => {
        Alert.alert(
            'Подтверждение сохранения',
            'Вы точно хотите сохранить изменения? Это действие нельзя отменить.',
            [
                {
                    text: 'Отмена',
                    style: 'cancel',
                },
                {
                    text: 'Сохранить',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setIsSubmitting(true);
                            const apiUrl = process.env.EXPO_PUBLIC_API_URL_GEO;
                            const token = await AsyncStorage.getItem('authToken');

                            const updateData = {
                                name: localNameRef.current,
                                description: localDescriptionRef.current
                            };

                            const response = await axios.patch(
                                `${apiUrl}/api/v1/events/${id}/`,
                                updateData,
                                {
                                    headers: {
                                        Authorization: `Bearer ${token}` // Передача токена в заголовке
                                    }
                                }
                            );
                            if(response.status === 200){
                                if (selectedImage) {
                                    console.log('[DEBUG] Starting image upload');
                                    await uploadImage(id);
                                    console.log('[DEBUG] Image upload completed');
                                }
                                (ref as any).current?.dismiss();
                            }

                        } catch (error) {
                            console.error('Ошибка сохранения:', error);
                            Alert.alert('Ошибка', 'Не удалось удалить событие');
                        } finally {
                            setIsSubmitting(false);
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    }

    const handleImagePick = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets) {
                setSelectedImage(result.assets[0].uri);
                console.log('selected image ', result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Ошибка при выборе изображения');
        }
    };

    const uploadImage = async (eventId: number) => {
        try {
            console.log('[DEBUG] Starting image upload process');

            // Проверка данных
            console.log('[DEBUG] selectedImage:', selectedImage);
            console.log('[DEBUG] eventId:', eventId);

            if (!selectedImage || !eventId) {
                console.error('[ERROR] Missing required data for upload');
                return;
            }

            const formData = new FormData();
            const filename = selectedImage.split('/').pop();

            // Формирование объекта файла
            const fileObject = {
                uri: selectedImage,
                name: filename || `event_${Date.now()}.jpg`,
                type: 'image/jpeg',
            };

            formData.append('file', fileObject as any);

            const apiUrl = process.env.EXPO_PUBLIC_API_URL_GEO;
            const token = await AsyncStorage.getItem('authToken');

            // Логирование критических параметров
            console.log('[DEBUG] API URL:', apiUrl);
            console.log('[DEBUG] Token exists:', !!token);

            // Вызов API
            const response = await axios.post(
                `${apiUrl}/api/v1/events/uploadEventPreview?event_id=${eventId}&token=${token}`, // eventId передаем как query параметр
                formData,
                {
                    timeout: 10000, // Таймаут 10 секунд
                }
            );

            console.log('[DEBUG] Upload response:', response);
            return response.data;
        } catch (error) {
            console.error('[ERROR] Image upload failed:', error);
            throw error;
        }
    };

    const snapPoints = useMemo(() => ['90%'], []);

    const animationConfigs = useBottomSheetSpringConfigs({
        damping: 80,
        overshootClamping: true,
        restDisplacementThreshold: 0.1,
        restSpeedThreshold: 0.1,
        stiffness: 200,
    });

    const renderBackdrop = useCallback(
        (props: any) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />,
        []
    );

    return (
        <BottomSheetModal
            ref={ref}
            index={0}
            snapPoints={snapPoints}
            enablePanDownToClose={false}
            animationConfigs={animationConfigs}
            backdropComponent={renderBackdrop}
            android_keyboardInputMode={'adjustResize'}
            keyboardBehavior={'extend'}
            onDismiss={onClose}
        >
            <BottomSheetView style={styles.contentContainer}>
                <Text style={styles.containerHeadline}>Изменение события</Text>
                <TouchableOpacity
                    style={styles.imagePicker}
                    onPress={handleImagePick}
                    disabled={isSubmitting}
                >
                    {selectedImage ? (
                        <Image
                            source={{uri: selectedImage}}
                            style={styles.imagePreview}
                            resizeMode="cover"
                        />
                    ) : (
                        <Text style={styles.imagePickerText}>
                            {isSubmitting ? 'Загрузка...' : 'Нажмите чтобы добавить обложку'}
                        </Text>
                    )}
                </TouchableOpacity>

                <Text style={styles.inputText}>Название события</Text>
                <BottomSheetTextInput
                    style={styles.input}
                    placeholder="Введите название"
                    maxLength={30}
                    defaultValue={name}  // Используем localName для значения поля
                    onChangeText={handleNameChange}
                    editable={!isSubmitting}
                />

                <Text style={styles.inputText}>Описание события</Text>
                <BottomSheetTextInput
                    style={[styles.input, {height: 100}]}
                    placeholder="Опишите событие"
                    multiline={true}
                    numberOfLines={4}
                    defaultValue={description}   // Используем localDescription для значения поля
                    onChangeText={handleDescriptionChange}
                    editable={!isSubmitting}
                />
                <ConfirmButton
                    onPress={handleUpdateSave}
                    text={'Сохранить изменения'}
                    disabled={isSubmitting}
                />
            </BottomSheetView>
        </BottomSheetModal>
    );
}));

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        padding: 5,
    },
    containerHeadline: {
        fontSize: 20,
        fontWeight: '600',
        padding: 10,
    },
    input: {
        marginTop: 8,
        marginBottom: 10,
        borderRadius: 10,
        fontSize: 16,
        lineHeight: 20,
        width: '80%',
        padding: 8,
        backgroundColor: 'rgba(151, 151, 151, 0.25)',
    },
    inputText: {
        fontSize: 14,
        alignSelf: 'flex-start',
        paddingLeft: '10%',
    },
    // 🚨 NEW STYLES
    imagePicker: {
        width: '80%',
        height: 150,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        marginVertical: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        opacity: 1,
    },
    imagePreview: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
    imagePickerText: {
        color: '#666',
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
});

export default EventCreationBottomSheetModal;