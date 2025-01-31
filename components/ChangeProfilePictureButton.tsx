import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Alert} from 'react-native';
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
interface Props {
    onPress: () => void;
}
const ChangeProfilePictureButton: React.FC<Props> = ({ onPress }) => {


    return (
        <TouchableOpacity onPress={onPress}>
            <View style={styles.button}>
                <Text style={styles.buttonText}>Изменить картинку профиля</Text>
            </View>
        </TouchableOpacity>
    );
};


const styles = StyleSheet.create({
    button: {
        marginTop: 10,
        width: 'auto',
        height: 50,
        backgroundColor: '#001169',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30,
        paddingHorizontal: 20, // Чтобы кнопка выглядела лучше
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ChangeProfilePictureButton;