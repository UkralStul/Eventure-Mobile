import {View, Text, TouchableOpacity, StyleSheet} from 'react-native'
import React, {useContext} from 'react'
import { Image } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import {useNavigation} from "@react-navigation/native";
import {AuthContext} from "@/context/authContext";




const MessageButton = ({ userId, bottomSheetRef  }) => {
    const navigation = useNavigation();
    const startConversation = async () => {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL;
        const token = await AsyncStorage.getItem('authToken');
        const response = await axios.post(
            `${apiUrl}/api/v1/chat/createConversation/${userId}`,
            {},
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            }
        );
        return response
    }
    const handlePress = async () => {
        const response = await startConversation()
        if(response.status === 401){
            const {  handleTokenRefresh } = useContext(AuthContext);
            handleTokenRefresh();
            const response = startConversation()
        }
        const item = response.data
        navigation.navigate('chat', {item});
        bottomSheetRef.current?.dismiss();
    }



    return (
      <TouchableOpacity  onPress={handlePress}>
          <View style={styles.container}>
            <Image source={require('../assets/images/message_image.png')} style={styles.image} />
          </View>
      </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        width: 75,
        height: 50,
        borderRadius: 15,
        backgroundColor: '#b0b0b0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: 50,
        height: 50,
    }
})

export default MessageButton;