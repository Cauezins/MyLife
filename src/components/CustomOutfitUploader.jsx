import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { RETRO_THEME } from '../utils/theme';
import { translations } from '../utils/translations';

export const CustomCharacterUploader = ({
  currentImage,
  onImageSelected,
  onRemoveImage,
}) => {
  const [loading, setLoading] = useState(false);
  const language = (global.appLanguage) || 'pt';
  const t = translations[language];

  const handleImagePicker = async () => {
    if (Platform.OS === 'web') {
      // Para web: usar input file
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/png';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          if (file.size > 1024 * 1024) { // 1MB max
            Alert.alert(t.error, t.imageTooLarge);
            return;
          }
          const reader = new FileReader();
          reader.onload = (event) => {
            onImageSelected(event.target.result);
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    } else {
      Alert.alert(
        t.uploadCharacter,
        t.uploadInDevelopment,
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>▸ {t.customCharacter}:</Text>
      <Text style={styles.subtitle}>
        {t.customCharacterDesc1}{'\n'}
        {t.customCharacterDesc2}{'\n'}
        {t.customCharacterDesc3}
      </Text>

      {currentImage ? (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: currentImage }}
            style={styles.preview}
            resizeMode="contain"
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.changeButton}
              onPress={handleImagePicker}
              activeOpacity={0.8}>
              <Text style={styles.buttonText}>{t.change}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={onRemoveImage}
              activeOpacity={0.8}>
              <Text style={styles.buttonText}>{t.remove}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handleImagePicker}
          activeOpacity={0.8}>
          <Text style={styles.uploadIcon}>⬆</Text>
          <Text style={styles.uploadText}>{t.uploadPng}</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.hint}>
        {t.customCharacterHint}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 10,
    color: RETRO_THEME.colors.accent,
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 8,
    color: RETRO_THEME.colors.textDark,
    marginBottom: 12,
    lineHeight: 14,
  },
  imageContainer: {
    backgroundColor: RETRO_THEME.colors.cardBackground,
    borderWidth: 2,
    borderColor: RETRO_THEME.colors.primary,
    padding: 15,
    alignItems: 'center',
  },
  preview: {
    width: 128,
    height: 128,
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  changeButton: {
    flex: 1,
    backgroundColor: RETRO_THEME.colors.cardBackground,
    borderWidth: 2,
    borderColor: RETRO_THEME.colors.accent,
    padding: 10,
    alignItems: 'center',
  },
  removeButton: {
    flex: 1,
    backgroundColor: RETRO_THEME.colors.cardBackground,
    borderWidth: 2,
    borderColor: '#ff0055',
    padding: 10,
    alignItems: 'center',
  },
  uploadButton: {
    backgroundColor: RETRO_THEME.colors.cardBackground,
    borderWidth: 2,
    borderColor: RETRO_THEME.colors.border,
    borderStyle: 'dashed',
    padding: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  uploadText: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 10,
    color: RETRO_THEME.colors.text,
    letterSpacing: 1,
  },
  buttonText: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 9,
    color: RETRO_THEME.colors.text,
    letterSpacing: 1,
  },
  hint: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 8,
    color: RETRO_THEME.colors.textDark,
    marginTop: 8,
    textAlign: 'center',
  },
});
