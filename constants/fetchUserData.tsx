;import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import fetchEventsInArea from "@/constants/fetchEventsInArea";
import {useContext} from "react";
import {AuthContext} from "@/context/authContext";
const fetchUserData = async (userId: string) => {
 try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL;
        const token = await AsyncStorage.getItem('authToken');
        const response = await axios.get(`${apiUrl}/auth/getUser/${userId}`, {
            headers: {
            'Authorization': `Bearer ${token}`,
            }
        });
        return response
    } catch (error) {
        console.error('Error fetching friends geo:', error);
        throw error;
    }
}


export default fetchUserData;