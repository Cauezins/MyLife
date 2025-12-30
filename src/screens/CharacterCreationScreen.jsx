import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RETRO_THEME } from '../utils/theme';
import { Player } from '../types';
import { storageService } from '../services/storageService';
import { PixelAvatar } from '../components/PixelAvatar';
import { ColorSelector, OptionSelector } from '../components/CustomizationSelectors';
import { CustomCharacterUploader } from '../components/CustomOutfitUploader';
import {
  PixelCharacter,
  SKIN_TONES,
  HAIR_COLORS,
  EYE_COLORS,
  OUTFIT_COLORS,
  serializeCharacter,
} from '../utils/pixelCharacter';
import { translations, Language } from '../utils/translations';



export const CharacterCreationScreen = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [step, setStep] = useState(0);
  const language = ((global ).appLanguage ) || 'pt';
  const t = translations[language];
  
  const HAIR_STYLES = [
    t.hairShort, t.hairMedium, t.hairLong, t.hairMohawk,
    t.hairBald, t.hairAfro, t.hairPonytail, t.hairPompadour, t.hairBangs
  ];
  
  const OUTFITS = [
    t.outfitBasic, t.outfitJacket, t.outfitArmor, t.outfitHoodie, t.outfitCape,
    t.outfitVest, t.outfitTank, t.outfitSuit, t.outfitDress, t.outfitKimono
  ];
  
  const ACCESSORIES = [
    t.accessoryNone, t.accessoryGlasses, t.accessoryHat, t.accessoryScar,
    t.accessoryEarring, t.accessoryMask, t.accessoryBandana, t.accessoryPiercing
  ];
  const [character, setCharacter] = useState({
    skinTone: SKIN_TONES[0],
    hairStyle: 0,
    hairColor: HAIR_COLORS[0],
    eyeColor: EYE_COLORS[0],
    outfit: 0,
    outfitColor: OUTFIT_COLORS[0],
    accessory: 0,
    customCharacterImage: null,
  });

  React.useEffect(() => {
    if (step < 3) {
      const timer = setTimeout(() => setStep(step + 1), 800);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleComplete = async () => {
    if (!name.trim()) return;

    const player = {
      name: name.trim(),
      avatar: serializeCharacter(character),
      level: 1,
      xp: 0,
      createdAt: new Date(),
    };

    await storageService.savePlayer(player);
    await AsyncStorage.setItem('player', JSON.stringify(player));
    onComplete(player);
  };

  const messages = [
    `> ${t.startingSystem}`,
    `> ${t.loadingModules}`,
    `> ${t.welcome}`,
  ];

  if (step < 3) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.terminalContainer}>
          {messages.slice(0, step + 1).map((msg, idx) => (
            <Text key={idx} style={styles.terminalText}>
              {msg}
            </Text>
          ))}
          <Text style={styles.cursor}>_</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t.createCharacter}</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.previewContainer}>
          <PixelAvatar character={character} size={128} />
        </View>

        <ColorSelector
          title={`▸ ${t.skinTone}:`}
          colors={SKIN_TONES}
          selectedColor={character.skinTone}
          onSelect={(color) => setCharacter({ ...character, skinTone: color })}
        />

        <OptionSelector
          title={`▸ ${t.hairStyle}:`}
          options={HAIR_STYLES}
          selectedIndex={character.hairStyle}
          onSelect={(idx) => setCharacter({ ...character, hairStyle: idx })}
        />

        <ColorSelector
          title={`▸ ${t.hairColor}:`}
          colors={HAIR_COLORS}
          selectedColor={character.hairColor}
          onSelect={(color) => setCharacter({ ...character, hairColor: color })}
        />

        <ColorSelector
          title={`▸ ${t.eyeColor}:`}
          colors={EYE_COLORS}
          selectedColor={character.eyeColor}
          onSelect={(color) => setCharacter({ ...character, eyeColor: color })}
        />

        <OptionSelector
          title={`▸ ${t.outfit}:`}
          options={OUTFITS}
          selectedIndex={character.outfit}
          onSelect={(idx) => setCharacter({ ...character, outfit: idx })}
        />

        <ColorSelector
          title={`▸ ${t.outfitColor}:`}
          colors={OUTFIT_COLORS}
          selectedColor={character.outfitColor}
          onSelect={(color) => setCharacter({ ...character, outfitColor: color })}
        />

        <OptionSelector
          title={`▸ ${t.accessory}:`}
          options={ACCESSORIES}
          selectedIndex={character.accessory}
          onSelect={(idx) => setCharacter({ ...character, accessory: idx })}
        />

        <CustomCharacterUploader
          currentImage={character.customCharacterImage}
          onImageSelected={(uri) => setCharacter({ ...character, customCharacterImage: uri })}
          onRemoveImage={() => setCharacter({ ...character, customCharacterImage })}
        />

        <View style={styles.nameSection}>
          <Text style={styles.nameTitle}>▸ {t.characterName}:</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputPrefix}>{'> '}</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder={t.enterName}
              placeholderTextColor={RETRO_THEME.colors.textDark}
              maxLength={20}
              autoCapitalize="characters"
            />
          </View>
          <Text style={styles.charCount}>{name.length}/20</Text>
        </View>

        <TouchableOpacity
          style={[styles.startButton, !name.trim() && styles.startButtonDisabled]}
          onPress={handleComplete}
          disabled={!name.trim()}
          activeOpacity={0.8}>
          <Text style={styles.startButtonText}>
            {name.trim() ? `▶ ${t.startAdventure} ◀` : `[ ${t.enterName} ]`}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RETRO_THEME.colors.background,
  },
  terminalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  terminalText: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 16,
    color: RETRO_THEME.colors.primary,
    marginBottom: 8,
  },
  cursor: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 16,
    color: RETRO_THEME.colors.primary,
    marginTop: 8,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: RETRO_THEME.colors.cardBackground,
    borderBottomWidth: 2,
    borderBottomColor: RETRO_THEME.colors.primary,
  },
  title: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 18,
    color: RETRO_THEME.colors.primary,
    letterSpacing: 2,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 20,
    backgroundColor: RETRO_THEME.colors.cardBackground,
    borderWidth: 2,
    borderColor: RETRO_THEME.colors.border,
  },
  nameSection: {
    marginTop: 20,
    marginBottom: 24,
  },
  nameTitle: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 14,
    color: RETRO_THEME.colors.accent,
    marginBottom: 8,
    letterSpacing: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: RETRO_THEME.colors.cardBackground,
    borderWidth: 2,
    borderColor: RETRO_THEME.colors.border,
    padding: 12,
  },
  inputPrefix: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 16,
    color: RETRO_THEME.colors.primary,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 16,
    color: RETRO_THEME.colors.text,
    padding: 0,
  },
  charCount: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 12,
    color: RETRO_THEME.colors.textDark,
    marginTop: 4,
    textAlign: 'right',
  },
  startButton: {
    backgroundColor: RETRO_THEME.colors.cardBackground,
    borderWidth: 2,
    borderColor: RETRO_THEME.colors.primary,
    padding: 16,
    alignItems: 'center',
  },
  startButtonDisabled: {
    borderColor: RETRO_THEME.colors.border,
    opacity: 0.5,
  },
  startButtonText: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 16,
    color: RETRO_THEME.colors.primary,
    letterSpacing: 2,
  },
});

