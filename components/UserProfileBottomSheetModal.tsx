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
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {AuthContext} from "@/context/authContext";
import MessageButton from "@/components/MessageButton";
import AddToFriendButton from "@/components/AddToFriendButton";

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

interface UserProfileBottomSheetModalProps {
  targetUser: targetUser;
  onClose: () => void;
}

const UserProfileBottomSheetModal = React.memo(forwardRef<BottomSheetModal, UserProfileBottomSheetModalProps>((props, ref) => {
  const snapPoints = useMemo(() => ['90%'], []);
  const { targetUser, onClose } = props;
  const animationConfigs = useBottomSheetSpringConfigs({
    damping: 80,
    overshootClamping: true,
    restDisplacementThreshold: 0.1,
    restSpeedThreshold: 0.1,
    stiffness: 200,
  });
  const { user } = useContext(AuthContext);
  const apiUrlUsers = process.env.EXPO_PUBLIC_API_URL;
  const userProfilePhotoUri = `${apiUrlUsers}/api/v1/images/avatar/${props.targetUser.id}`;



  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />,
    []
  );

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
        <Image cachePolicy={'none'} source={{ uri: userProfilePhotoUri}} style={styles.profileImage} />
        <Text style={styles.containerHeadline}>{props.targetUser.username}</Text>
        <Text style={styles.lastSeen}>
          Последний раз в сети:{" "}
          {props.targetUser.last_seen
            ? props.targetUser.last_seen.toLocaleString()
            : "Давно"}
        </Text>
        <View style={{flexDirection: 'row', gap: 15,}}>
          <MessageButton userId={targetUser.id} bottomSheetRef={ref} />
          <AddToFriendButton friend_request_sent_by={props.targetUser.friend_request_sent_by} userId={props.targetUser.id.toString()} friendStatus={props.targetUser.is_friend} />
        </View>
        <Text style={styles.aboutMe} >{props.targetUser.about_me}</Text>
      </BottomSheetView>
    </BottomSheetModal>
  );
}));

const styles = StyleSheet.create({
  lastSeen: {
    fontSize: 16,
  },
  aboutMe: {
    fontSize: 20,
  },
  profileImage: {
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 5,
  },
  containerHeadline: {
    fontSize: 26,
    fontWeight: '600',
    padding: 10,
  },
});

export default UserProfileBottomSheetModal;
