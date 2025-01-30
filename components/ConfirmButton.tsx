import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ConfirmButtonProps {
  onPress: () => void; // Функция, вызываемая при нажатии
  text: string; // Текст кнопки
  disabled?: boolean;
}

const ConfirmButton: React.FC<ConfirmButtonProps> = ({ onPress, text, disabled  }) => {
  return (
    <TouchableOpacity disabled={disabled} onPress={onPress}>
      <View style={styles.button}>
        <Text style={styles.buttonText}>{text}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
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

export default ConfirmButton;
