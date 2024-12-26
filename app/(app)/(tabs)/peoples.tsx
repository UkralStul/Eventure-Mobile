import {Button, StyleSheet, Text, View} from 'react-native'
import React, {useEffect, useState} from 'react'
import UserTile from "@/components/UserTile";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

interface NearbyUser {
    distance: number;
    user_id: string;
}

const peoples = () => {
    const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
    useEffect(() => {
        const fetchPeoples = async () => {
            const apiUrl = process.env.EXPO_PUBLIC_API_URL_GEO;
            const token = await AsyncStorage.getItem('authToken');
            const maxDistance = 5000;
            try {
                const response = await axios.get(`${apiUrl}/api/v1/userGeo/nearbyUsers`, {
                    params: {
                        token: token,
                        max_distance: maxDistance,
                    },
                });
                console.log('Nearby users:', response.data);
                setNearbyUsers(response.data);
            } catch (error) {
                console.error('Error fetching nearby users:', error);
            }
        }
        fetchPeoples();
    }, []);
    return (
    <View style={styles.container}>
        {nearbyUsers.map((user) => (
            <UserTile
                key={user.user_id}
                userId={user.user_id.toString()}
                distance={Math.round(user.distance).toString()}
            />
        ))}
    </View>
    )
}

export default peoples

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
    },
})