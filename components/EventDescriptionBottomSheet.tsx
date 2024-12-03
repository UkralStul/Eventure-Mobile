import { View, StyleSheet, Text } from 'react-native';
import { Image } from 'expo-image';
import React, { forwardRef, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  BottomSheetFlatList,
  useBottomSheetSpringConfigs,
} from '@gorhom/bottom-sheet';
import ConfirmButton from "@/components/ConfirmButton";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "@/context/authContext";

interface Event {
  id: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  participants: Array<{
    id: number;
    email?: string;
    username: string;
    profile_photo: string;
  }>;
}

interface EventDescriptionBottomSheetModalProps {
  event: Event;
  onClose: () => void;
}


const ParticipantsList = React.memo(({ participants }: { participants: Event['participants'] }) => {
  const apiUrlUsers = process.env.EXPO_PUBLIC_API_URL;

  const renderParticipant = ({ item }: { item: { username: string; profile_photo: string; id: number } }) => (
    <View style={styles.participantContainer}>
      <Image source={{ uri: `${apiUrlUsers}/api/v1/images/avatar/${item.id}` }} style={styles.participantImage} />
      <Text style={styles.participantName}>{item.username}</Text>
    </View>
  );

  const renderSeparator = () => <View style={styles.separator} />;

  return participants.length === 0 ? (
    <Text style={styles.noParticipantsText}>Нет участников</Text>
  ) : (
    <BottomSheetFlatList
      data={participants}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderParticipant}
      style={styles.flatlist}
      ItemSeparatorComponent={renderSeparator}
    />
  );
});


const EventDescriptionBottomSheetModal = React.memo(forwardRef<BottomSheetModal, EventDescriptionBottomSheetModalProps>((props, ref) => {
  const snapPoints = useMemo(() => ['90%'], []);
  const { event, onClose } = props;
  const animationConfigs = useBottomSheetSpringConfigs({
    damping: 80,
    overshootClamping: true,
    restDisplacementThreshold: 0.1,
    restSpeedThreshold: 0.1,
    stiffness: 200,
  });
  const { user } = useContext(AuthContext);

  const [participants, setParticipants] = useState(event.participants || []);

  const participateInEvent = useCallback(async (eventId: number) => {
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL_GEO;
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.post(`${apiUrl}/api/v1/events/addParticipant/${eventId}`, {}, {
        params: { token },
      });

      if (response.status === 200) {
        console.log("Added participant");
        if (user) {
          setParticipants((prev) => [
            ...prev,
            { id: user.id, username: user.username, profile_photo: user.profile_photo || '' },
          ]);
        }
      } else {
        console.log("Failed to add participant");
      }
    } catch (error) {
      console.error('Error adding participant to event:', error);
    }
  }, [user]);

  useEffect(() => {
    console.log('Bottom sheet rendered');
    console.log('with props: ', props);
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />,
    []
  );

  const apiUrlGeo = process.env.EXPO_PUBLIC_API_URL_GEO;
  const apiUrlUsers = process.env.EXPO_PUBLIC_API_URL;
  const eventPreviewPicUrl = `${apiUrlGeo}/api/v1/events/preview/${props.event.id}`;

  const renderParticipant = ({ item }: { item: { username: string, profile_photo: string, id: number } }) => (
    <View style={styles.participantContainer}>
      <Image source={{ uri: `${apiUrlUsers}/api/v1/images/avatar/${item.id}` }} style={styles.participantImage} />
      <Text style={styles.participantName}>{item.username}</Text>

    </View>
  );
  const renderSeparator = () => <View style={styles.separator} />;
  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      animationConfigs={animationConfigs}
      backdropComponent={renderBackdrop}
      android_keyboardInputMode={'adjustResize'}
      keyboardBehavior={'extend'}
      onDismiss={onClose}
      enableDynamicSizing={false}
    >
      <BottomSheetView style={styles.contentContainer}>
        <Text style={styles.containerHeadline}>{props.event.name}</Text>
        <Image source={{ uri: eventPreviewPicUrl }} style={{ width: '80%', height: 300 }} />
        <Text style={styles.containerHeadline}>{props.event.description}</Text>
        <ConfirmButton onPress={() => participateInEvent(event.id)} text={'Я участвую!'} />
        <Text style={styles.containerHeadline}>Участники</Text>
        <View style={styles.flatlistButtonContainer}>
          {participants.length === 0 ? (
            <Text style={styles.noParticipantsText}>Нет участников</Text>
          ) : (
            <View style={styles.flatListContainer}>
              <BottomSheetFlatList
                data={participants}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderParticipant}
                style={styles.flatlist}
                ItemSeparatorComponent={renderSeparator}
              />
            </View>
          )}
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}));

const styles = StyleSheet.create({
   separator: {
    height: 1, // Толщина линии
    backgroundColor: 'gray', // Цвет линии
    marginHorizontal: 10, // Отступы слева и справа
  },
  flatListContainer: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    borderRadius: 15,
    width: '40%',
    paddingRight: 20,
  },
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
  participantContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  participantImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '500',
  },
  flatlistButtonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 30,
  },
  flatlist: {
    flexGrow: 0,
  },
  noParticipantsText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'gray',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default EventDescriptionBottomSheetModal;
