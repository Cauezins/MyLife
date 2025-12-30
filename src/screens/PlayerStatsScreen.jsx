import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Player } from '../types';
import { storageService } from '../services/storageService';
import { RETRO_THEME } from '../utils/theme';
import { PixelAvatar } from '../components/PixelAvatar';
import { deserializeCharacter } from '../utils/pixelCharacter';
import { translations, Language } from '../utils/translations';

export const PlayerStatsScreen = () => {
  const navigation = useNavigation();
  const language = ((global ).appLanguage ) || 'pt';
  const t = translations[language];
  const [player, setPlayer] = useState(null);
  const [stats, setStats] = useState({
    totalHabits: 0,
    completedToday: 0,
    totalStreak: 0,
    longestStreak: 0,
    totalCompletions: 0,
    totalWaterLiters: 0,
    totalSleepHours: 0,
    totalFocusMinutes: 0,
    averageWaterPerDay: 0,
    averageSleepPerDay: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedPlayer = await storageService.getPlayer();
      if (!savedPlayer) {
        navigation.navigate('Home');
        return;
      }
      setPlayer(savedPlayer);

      const habits = await storageService.getHabits();
      const completedToday = habits.filter(h => h.completed).length;
      const totalStreak = habits.reduce((sum, h) => sum + (h.streak || 0), 0);
      const longestStreak = Math.max(...habits.map(h => h.streak || 0), 0);
      
      const logs = await storageService.getLogs();
      
      const waterLogs = logs.filter(log => log.waterAmount !== undefined);
      const totalWaterLiters = waterLogs.reduce((sum, log) => sum + (log.waterAmount || 0), 0);
      const uniqueWaterDays = new Set(waterLogs.map(log => 
        new Date(log.completedAt).toDateString()
      )).size;
      
      const sleepLogs = logs.filter(log => log.sleepDuration !== undefined);
      const totalSleepMinutes = sleepLogs.reduce((sum, log) => sum + (log.sleepDuration || 0), 0);
      const totalSleepHours = totalSleepMinutes / 60;
      const uniqueSleepDays = new Set(sleepLogs.map(log => 
        new Date(log.completedAt).toDateString()
      )).size;
      
      const focusHabits = habits.filter(h => h.trackingType === 'timer');
      const totalFocusMinutes = focusHabits.reduce((sum, h) => {
        const completions = logs.filter(log => log.habitId === h.id).length;
        return sum + (completions * (h.timerMinutes || 0));
      }, 0);
      
      setStats({
        totalHabits: habits.length,
        completedToday,
        totalStreak,
        longestStreak,
        totalCompletions: logs.length,
        totalWaterLiters: Math.round(totalWaterLiters * 10) / 10,
        totalSleepHours: Math.round(totalSleepHours * 10) / 10,
        totalFocusMinutes,
        averageWaterPerDay: uniqueWaterDays > 0 ? Math.round((totalWaterLiters / uniqueWaterDays) * 10) / 10 : 0,
        averageSleepPerDay: uniqueSleepDays > 0 ? Math.round((totalSleepHours / uniqueSleepDays) * 10) / 10 : 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      navigation.navigate('Home');
    }
  };

  const handleDeleteCharacter = () => {
    Alert.alert(
      `⚠️ ${t.deleteCharacter}`,
      t.confirmDeleteCharacter,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.deleteAll,
          style: 'destructive',
          onPress: async () => {
            try {
              await storageService.clearAll();
              
              if (typeof (global ).resetApp === 'function') {
                (global ).resetApp();
              }
              
              navigation.navigate('Home');
            } catch (error) {
              console.error('Error deleting character:', error);
              Alert.alert(t.error, t.errorDeletingCharacter);
            }
          },
        },
      ]
    );
  };

  const handleChangeLanguage = () => {
    const languages = [
      { code: 'pt', name: '🇧🇷 Português' },
      { code: 'en', name: '🇺🇸 English' },
      { code: 'es', name: '🇪🇸 Español' },
    ];

    Alert.alert(
      t.changeLanguage,
      t.currentLanguage + ': ' + languages.find(l => l.code === language)?.name,
      [
        ...languages.map(lang => ({
          text: lang.name,
          onPress: async () => {
            await AsyncStorage.setItem('app_language', lang.code);
            (global ).appLanguage = lang.code;
            loadData();
          },
        })),
        { text: t.cancel, style: 'cancel' },
      ]
    );
  };

  const getPlayerCharacter = () => {
    if (!player || !player.avatar) return null;
    try {
      return deserializeCharacter(player.avatar);
    } catch (error) {
      console.error('Error deserializing avatar:', error);
      return null;
    }
  };

  const playerCharacter = getPlayerCharacter();
  const xpToNextLevel = ((player?.level || 1) * 100) - (player?.xp || 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t.statistics}</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <Animated.View entering={FadeInDown.delay(100)} style={styles.avatarSection}>
          {playerCharacter ? (
            <PixelAvatar character={playerCharacter} size={128} />
          ) : (
            <View style={styles.placeholderAvatar}>
              <Text style={styles.placeholderText}>👤</Text>
            </View>
          )}
          <Text style={styles.playerName}>{player?.name || 'JOGADOR'}</Text>
          <Text style={styles.playerLevel}>LEVEL {player?.level || 1}</Text>
          <Text style={styles.xpText}>{player?.xp || 0} XP | {xpToNextLevel} {t.xpToNext}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)} style={styles.statsSection}>
          <Text style={styles.sectionTitle}>▸ {t.generalStats}</Text>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>◇ {t.tasksCreated}:</Text>
            <Text style={styles.statValue}>{stats.totalHabits}</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>◇ {t.completedToday}:</Text>
            <Text style={styles.statValue}>{stats.completedToday}</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>◇ {t.totalStreak}:</Text>
            <Text style={styles.statValue}>{stats.totalStreak} {t.days}</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>◇ {t.longestStreak}:</Text>
            <Text style={styles.statValue}>{stats.longestStreak} {t.days}</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>◇ {t.totalCompletions}:</Text>
            <Text style={styles.statValue}>{stats.totalCompletions}</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(250)} style={styles.statsSection}>
          <Text style={styles.sectionTitle}>▸ {t.waterHydration}</Text>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>◇ {t.totalConsumed}:</Text>
            <Text style={styles.statValue}>{stats.totalWaterLiters}L</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>◇ {t.averagePerDay}:</Text>
            <Text style={styles.statValue}>{stats.averageWaterPerDay}L</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300)} style={styles.statsSection}>
          <Text style={styles.sectionTitle}>▸ {t.sleepRest}</Text>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>◇ {t.totalSleep}:</Text>
            <Text style={styles.statValue}>{stats.totalSleepHours}h</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>◇ {t.averagePerNight}:</Text>
            <Text style={styles.statValue}>{stats.averageSleepPerDay}h</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(350)} style={styles.statsSection}>
          <Text style={styles.sectionTitle}>▸ {t.focusProductivity}</Text>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>◇ {t.focusTime}:</Text>
            <Text style={styles.statValue}>{stats.totalFocusMinutes} min</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>◇ {t.inHours}:</Text>
            <Text style={styles.statValue}>{Math.round((stats.totalFocusMinutes / 60) * 10) / 10}h</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(375)} style={styles.languageSection}>
          <Text style={styles.sectionTitle}>▸ {t.currentLanguage}</Text>
          <TouchableOpacity
            style={styles.languageButton}
            onPress={handleChangeLanguage}
            activeOpacity={0.8}>
            <Text style={styles.languageButtonText}>{t.changeLanguage}</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400)} style={styles.dangerSection}>
          <Text style={styles.dangerTitle}>{t.dangerZone}</Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteCharacter}
            activeOpacity={0.8}>
            <Text style={styles.deleteButtonText}>{t.deleteCharacter}</Text>
          </TouchableOpacity>
          <Text style={styles.warningText}>
            * {t.warningIrreversible}
          </Text>
        </Animated.View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}>
          <Text style={styles.backButtonText}>◀ {t.back}</Text>
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
  header: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: RETRO_THEME.colors.cardBackground,
    borderBottomWidth: 2,
    borderBottomColor: RETRO_THEME.colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 20,
    paddingBottom: 32,
  },
  title: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 20,
    color: RETRO_THEME.colors.primary,
    letterSpacing: 2,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 20,
    backgroundColor: RETRO_THEME.colors.cardBackground,
    borderWidth: 2,
    borderColor: RETRO_THEME.colors.border,
  },
  placeholderAvatar: {
    width: 128,
    height: 128,
    backgroundColor: RETRO_THEME.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: RETRO_THEME.colors.border,
    marginBottom: 16,
  },
  placeholderText: {
    fontSize: 64,
  },
  playerName: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 18,
    color: RETRO_THEME.colors.text,
    marginTop: 12,
    letterSpacing: 1,
  },
  playerLevel: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 16,
    color: RETRO_THEME.colors.primary,
    marginTop: 8,
    letterSpacing: 2,
  },
  xpText: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 12,
    color: RETRO_THEME.colors.textDark,
    marginTop: 4,
  },
  statsSection: {
    backgroundColor: RETRO_THEME.colors.cardBackground,
    borderWidth: 2,
    borderColor: RETRO_THEME.colors.border,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 16,
    color: RETRO_THEME.colors.accent,
    marginBottom: 12,
    letterSpacing: 1,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: RETRO_THEME.colors.border,
  },
  statLabel: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 14,
    color: RETRO_THEME.colors.text,
    letterSpacing: 1,
  },
  statValue: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 14,
    color: RETRO_THEME.colors.primary,
    fontWeight: 'bold',
  },
  languageSection: {
    backgroundColor: RETRO_THEME.colors.cardBackground,
    borderWidth: 2,
    borderColor: RETRO_THEME.colors.border,
    padding: 16,
    marginBottom: 16,
  },
  languageButton: {
    backgroundColor: RETRO_THEME.colors.background,
    borderWidth: 2,
    borderColor: RETRO_THEME.colors.primary,
    padding: 12,
    alignItems: 'center',
  },
  languageButtonText: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 14,
    color: RETRO_THEME.colors.primary,
    letterSpacing: 1,
  },
  dangerSection: {
    backgroundColor: '#2a1a1a',
    borderWidth: 2,
    borderColor: RETRO_THEME.colors.danger,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  dangerTitle: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 16,
    color: RETRO_THEME.colors.danger,
    marginBottom: 12,
    letterSpacing: 2,
  },
  deleteButton: {
    backgroundColor: RETRO_THEME.colors.danger,
    borderWidth: 2,
    borderColor: '#ff0000',
    padding: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  deleteButtonText: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 14,
    color: '#ffffff',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  warningText: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 12,
    color: RETRO_THEME.colors.textDark,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  backButton: {
    backgroundColor: RETRO_THEME.colors.cardBackground,
    borderWidth: 2,
    borderColor: RETRO_THEME.colors.border,
    padding: 16,
    alignItems: 'center',
  },
  backButtonText: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 14,
    color: RETRO_THEME.colors.text,
    letterSpacing: 1,
  },
});

