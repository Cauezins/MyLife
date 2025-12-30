import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { RETRO_THEME } from '../utils/theme';
import { Language, translations } from '../utils/translations';
import AsyncStorage from '@react-native-async-storage/async-storage';



export const LanguageSelectionScreen = ({ onComplete }) => {
  const [selectedLang, setSelectedLang] = useState('pt');

  const handleSelectLanguage = async (lang) => {
    setSelectedLang(lang);
    await AsyncStorage.setItem('app_language', lang);
    onComplete(lang);
  };

  const t = translations[selectedLang];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.View entering={FadeInDown.delay(100)}>
          <Text style={styles.title}>═══ {t.selectLanguage} ═══</Text>
        </Animated.View>

        <View style={styles.languageContainer}>
          <Animated.View entering={FadeInDown.delay(200)}>
            <TouchableOpacity
              style={[styles.languageButton, selectedLang === 'pt' && styles.languageButtonSelected]}
              onPress={() => handleSelectLanguage('pt')}
              activeOpacity={0.8}>
              <Text style={styles.languageFlag}>🇧🇷</Text>
              <Text style={styles.languageText}>{t.portuguese}</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300)}>
            <TouchableOpacity
              style={[styles.languageButton, selectedLang === 'en' && styles.languageButtonSelected]}
              onPress={() => handleSelectLanguage('en')}
              activeOpacity={0.8}>
              <Text style={styles.languageFlag}>🇺🇸</Text>
              <Text style={styles.languageText}>{t.english}</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400)}>
            <TouchableOpacity
              style={[styles.languageButton, selectedLang === 'es' && styles.languageButtonSelected]}
              onPress={() => handleSelectLanguage('es')}
              activeOpacity={0.8}>
              <Text style={styles.languageFlag}>🇪🇸</Text>
              <Text style={styles.languageText}>{t.spanish}</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RETRO_THEME.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 20,
    color: '#ffffff',
    letterSpacing: 2,
    marginBottom: 40,
    textAlign: 'center',
  },
  languageContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 16,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: RETRO_THEME.colors.cardBackground,
    borderWidth: 2,
    borderColor: RETRO_THEME.colors.border,
    padding: 20,
    gap: 16,
  },
  languageButtonSelected: {
    borderColor: RETRO_THEME.colors.primary,
    backgroundColor: RETRO_THEME.colors.secondary,
  },
  languageFlag: {
    fontSize: 32,
  },
  languageText: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 16,
    color: RETRO_THEME.colors.text,
    letterSpacing: 1,
  },
});

