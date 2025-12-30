import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { storageService } from '../services/storageService';
import { RETRO_THEME } from '../utils/theme';

export const DebugMenu = () => {
  const handleResetPlayer = () => {
    Alert.alert(
      'Resetar Personagem',
      'Deseja deletar seu personagem e criar um novo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resetar',
          style: 'destructive',
          onPress: async () => {
            const habits = await storageService.getHabits();
            await storageService.clearAll();
            await storageService.saveHabits(habits);
            // Recarregar a página
            if (typeof window !== 'undefined') {
              window.location.reload();
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handleResetPlayer}>
        <Text style={styles.buttonText}>🔄 RESETAR PERSONAGEM</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  button: {
    backgroundColor: RETRO_THEME.colors.cardBackground,
    borderWidth: 2,
    borderColor: RETRO_THEME.colors.danger,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  buttonText: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 10,
    color: RETRO_THEME.colors.danger,
  },
});
