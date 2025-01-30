import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import { Image } from 'expo-image';
type EventTileProps = {
    id: number;
    name: string;
    description: string;
    distance: number;
    participants: number[];
    preview_picture?: string;
    created_by: number;
    onPress: () => void;
};

const EventTile = ({
                       id,
                       name,
                       description,
                       distance,
                       participants,
                       preview_picture,
                       created_by,
                       onPress,
                   }: EventTileProps) => {
    const apiUrl = process.env.EXPO_PUBLIC_API_URL_GEO;
    const avatarUri = `${apiUrl}/api/v1/events/preview/${id}`;
    return (
        <TouchableOpacity onPress={onPress} style={styles.container}>
            {preview_picture && (
                <Image source={{ uri: avatarUri }} style={styles.image} />
            )}
            <Text style={styles.title}>{name}</Text>
            <Text style={styles.description}>{description}</Text>
            <View style={styles.details}>
                <Text style={styles.detailText}>Distance: {Math.round(distance)}m</Text>
                <Text style={styles.detailText}>
                    Participants: {participants.length}
                </Text>
                <Text style={styles.detailText}>Created by: {created_by}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    details: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    detailText: {
        fontSize: 12,
        color: '#888',
    },
});

export default EventTile;