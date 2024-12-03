import React, { useEffect, useState, useContext, useRef } from 'react';
import {View, ActivityIndicator, Image, GestureResponderEvent, Button, StyleSheet} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'; // Используем MapView из react-native-maps
import fetchEventsInArea from '../../../constants/fetchEventsInArea';
import { AuthContext } from '../../../context/authContext';
import { useGeoWebSocket } from '../../../context/geoWebSocketContext';
import useLocation from '../../../hooks/userLocation';
import FriendOnMap from '../../../components/FriendOnMap';
import EventCreationBottomSheetModal from "../../../components/EventCreationBottomSheetModal";
import BottomSheet, { BottomSheetModal } from "@gorhom/bottom-sheet";
import fetchFriendsGeo from "@/constants/fetchFriendsGeo";
import userLocation from "../../../hooks/userLocation";
import EventDescriptionBottomSheet from "@/components/EventDescriptionBottomSheet";
import fetchEventData from "@/constants/fetchEventData";


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

interface FriendGeo {
  user_id: string;
  latitude: number;
  longitude: number;
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface EventMarker {
  id: string;
  latitude: number;
  longitude: number;
}

const MyMapComponent: React.FC = () => {
  const { location,initialLocation, errorMsg } = useLocation();
  const [mapRef, setMapRef] = useState<MapView | null>(null);
  const [markers, setMarkers] = useState<EventMarker[]>([]);
  const { user } = useContext(AuthContext);
  const { requestUserGeos, updateUserGeo, userGeos, friendsGeos, setFriendsGeos } = useGeoWebSocket();
  const eventCreationBottomSheetRef = useRef<BottomSheetModal>(null);
  const eventDescriptionBottomSheetRef = useRef<BottomSheetModal>(null);
  const [eventCreationLocation, setEventCreationLocation] = useState<{ lat: number; lon: number } | null>(null);
  const friendsMarkerRefs = useRef<{ [key: string]: any }>({});
  const [eventDescription, setEventDescription] = useState<Event | string | null>(null)
  const [loadingMarkerId, setLoadingMarkerId] = useState<string | null>(null);
  // Запрос на обновление локации пользователя на сервере при изменении локации пользователя
  useEffect(() => {
    if (location) {
      updateUserGeo(user.id, { latitude: location.latitude, longitude: location.longitude });
    }
  }, [location]);
  // Получение маркеров ивентов
  useEffect(() => {
    if (mapRef?.state.isReady) {
      handleRegionChangeComplete();
    }
  }, [mapRef]);
  // Получение начальных координат
  useEffect(() => {
    if (initialLocation) {
      mapRef?.animateToRegion({
        latitude: initialLocation.latitude,
        longitude: initialLocation.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  }, [initialLocation]);
  // Начало создания ивента
  useEffect(() => {
    if (eventCreationLocation) {
      eventCreationBottomSheetRef.current?.present();
    }
  }, [eventCreationLocation]);
  // Начальная локация друзей
  useEffect(() => {
    const fetchFriendsGeosData = async () => {
      const friendsGeos = await fetchFriendsGeo();
      console.log('initial friends geos: ', friendsGeos);
      setFriendsGeos(friendsGeos);
    };
    fetchFriendsGeosData();
  }, []);

  const handleEventMarkerPress = async (markerId: string) => {
    setLoadingMarkerId(markerId); // Устанавливаем текущий маркер как "загружающийся"
    try {
      const eventData = await fetchEventData(markerId); // Получение данных о событии
      setEventDescription(eventData); // Передача данных в EventDescriptionBottomSheet
    } catch (error) {
      console.error("Ошибка при получении данных об ивенте:", error);
    } finally {
      setLoadingMarkerId(null); // Сбрасываем состояние загрузки
    }
  };
  // Рендер ивентов при перемещении карты
  const handleRegionChangeComplete = async () => {
    if (mapRef?.state.isReady) {
      try {
        const events = await fetchEventsInArea(mapRef);
        setMarkers(events); // Обновляем маркеры на карте
      } catch (error) {
        console.error("Ошибка при обновлении маркеров:", error);
      }
    }
  };

  // Отображение описания ивента
  useEffect(() => {
    if (eventDescription) {
      eventDescriptionBottomSheetRef.current?.present();
    }
  }, [eventDescription]);

  return (
    <View style={{ flex: 1 }}>
        <MapView
          ref={(ref) => setMapRef(ref)}
          style={{ width: '100%', height: '100%' }}
          showsUserLocation={false} // Показываем текущую локацию пользователя
          onPress={(e) => {
            const centerLat = e.nativeEvent.coordinate.latitude;
            const centerLon = e.nativeEvent.coordinate.longitude;
            console.log('latitude: ', centerLat, 'longitude', centerLon);
          }}
          onLongPress={(e) => {
            const lat = e.nativeEvent.coordinate.latitude;
            const lon = e.nativeEvent.coordinate.longitude;
            setEventCreationLocation({ lat, lon });
          }}
          onRegionChangeComplete={handleRegionChangeComplete} // Обработчик завершения изменения региона
        >
          {/* User Marker */}
          {location && (
              <Marker
                  key={user.id}
                  coordinate={{latitude: location.latitude, longitude: location.longitude}}>
                <FriendOnMap user_id={user.id} />
              </Marker>
          )}
          {/* Event markers */}
          {markers && markers.map((marker) => (
            <Marker
              key={marker.id}
              coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
              onPress={() => handleEventMarkerPress(marker.id)}
            >
                {loadingMarkerId === marker.id ? (
                  <ActivityIndicator size="small" color="#0000ff" style={{ position: 'absolute', top: -20, left: -20, zIndex: 10 }}  />
                ) : (
                  <Image
                    source={require('../../../assets/images/map-point-icon.png')}
                    style={{ width: 40, height: 40 }}
                  />
                )}
            </Marker>
          ))}  
          {/* Friends Markers */}
          {friendsGeos && friendsGeos.map((friendGeo: FriendGeo) => (
            <Marker
              key={friendGeo.user_id}
              coordinate={{ latitude: friendGeo.latitude, longitude: friendGeo.longitude }}
              ref={(ref) => (friendsMarkerRefs.current[friendGeo.user_id] = ref)}
              onPress={() => {console.log(friendsMarkerRefs)}}
            >
                <FriendOnMap user_id={friendGeo.user_id} />
            </Marker>
          ))}
        </MapView>
      {eventCreationLocation && (
        <EventCreationBottomSheetModal
          ref={eventCreationBottomSheetRef}
          lat={eventCreationLocation.lat}
          lon={eventCreationLocation.lon}
        />
      )}
      {eventDescription && (
          <EventDescriptionBottomSheet
            ref={eventDescriptionBottomSheetRef}
            event={eventDescription as Event}
            onClose={() => setEventDescription(null)}
          />
      )}
    </View>
  );
};

export default MyMapComponent;
