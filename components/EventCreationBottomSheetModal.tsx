import {View, StyleSheet, Text, TouchableOpacity, Alert, Image} from 'react-native';
import React, {forwardRef, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
  useBottomSheetSpringConfigs
} from '@gorhom/bottom-sheet';
import createEvent from "@/constants/createEvent";
import {AuthContext} from "@/context/authContext";
import ConfirmButton from "@/components/ConfirmButton";
import * as ImagePicker from 'expo-image-picker'; // 🚨 NEW: Image picker
import {Platform} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { AxiosResponse } from 'axios';


interface EventCreationProps {
  lat: number;
  lon: number;
}

const EventCreationBottomSheetModal = React.memo(forwardRef<BottomSheetModal, EventCreationProps>((props, ref) => {
  const { lat, lon } = props;
  const nameRef = useRef('');
  const descriptionRef = useRef('');
  const { user } = useContext(AuthContext);

  // 🚨 NEW STATES
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🚨 NEW: Image picker permissions
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Разрешение требуется', 'Нужен доступ к галерее для загрузки изображений');
        }
      }
    })();
  }, []);

  // 🚨 MODIFIED: Updated create handler with image upload
  const handleCreateEvent = async () => {
    if (!user) {
      Alert.alert('Ошибка', 'Требуется авторизация');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('[DEBUG] Starting event creation');

      const createEventResponse: AxiosResponse = await createEvent(
          nameRef.current,
          descriptionRef.current,
          lat,
          lon,
          user.id.toString(),
      );

      console.log('[DEBUG] Event created:', createEventResponse);
      console.log('createEventResponse.status ',createEventResponse.status);
      console.log('selectedImage before upload ',selectedImage);
      if (createEventResponse && createEventResponse.status === 200) {
        const newEventId = createEventResponse.data.id;
        if (selectedImage) {
          console.log('[DEBUG] Starting image upload');
          await uploadImage(newEventId);
          console.log('[DEBUG] Image upload completed');
        }

        Alert.alert('Успех', 'Событие создано!');
        (ref as any).current?.dismiss();
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Ошибка создания:', error.message);
      } else {
        console.error('Неизвестная ошибка');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🚨 NEW: Image selection handler
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

  // 🚨 MODIFIED: Track input changes
  const handleNameChange = (text: string) => {
    nameRef.current = text;
    setHasUnsavedChanges(!!text || !!descriptionRef.current || !!selectedImage);
  };

  const handleDescriptionChange = (text: string) => {
    descriptionRef.current = text;
    setHasUnsavedChanges(!!nameRef.current || !!text || !!selectedImage);
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
      >
        <BottomSheetView style={styles.contentContainer}>
          <Text style={styles.containerHeadline}>Создание события</Text>

          {/* 🚨 NEW: Image picker section */}
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
              onChangeText={handleNameChange}
              editable={!isSubmitting}
          />

          <Text style={styles.inputText}>Описание события</Text>
          <BottomSheetTextInput
              style={[styles.input, {height: 100}]}
              placeholder="Опишите событие"
              multiline={true}
              numberOfLines={4}
              onChangeText={handleDescriptionChange}
              editable={!isSubmitting}
          />

          <ConfirmButton
              onPress={handleCreateEvent}
              text={isSubmitting ? "Создание..." : "Создать событие"}
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