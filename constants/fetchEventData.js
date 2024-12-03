import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";

const fetchEventData = async (id) => {
    try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL_GEO;
        const token = await AsyncStorage.getItem('authToken');
        const response = await axios.post(`${apiUrl}/api/v1/events/${id}/`,{}, {params:{token}});
        return response.data;

    } catch (error) {
        console.error('Error fetching event data:', error);
        throw error;
    }
};

export default fetchEventData;
