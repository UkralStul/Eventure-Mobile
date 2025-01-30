import axios, { AxiosResponse } from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface EventNearbyResponse {
    id: number;
    name: string;
    description: string;
    distance: number;
    participants: number[];
    preview_picture?: string;
    created_by: number;
}

interface FetchNearbyEventsResponse {
    data: EventNearbyResponse[];
    status: number;
}

export const fetchNearbyEvents = async (
    maxDistance: number = 5000,
): Promise<FetchNearbyEventsResponse> => {
    try {
        const token = await AsyncStorage.getItem('authToken');
        const apiUrl = process.env.EXPO_PUBLIC_API_URL_GEO;
        const response: AxiosResponse<EventNearbyResponse[]> = await axios.post<EventNearbyResponse[]>(
            `${apiUrl}/api/v1/events/nearbyEvents`,
            {
                token,
                max_distance: maxDistance,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            },
        );
        return {
            data: response.data,
            status: response.status,
        };
    } catch (error) {
        console.error('Error fetching events:', error);
        throw error;
    }
};