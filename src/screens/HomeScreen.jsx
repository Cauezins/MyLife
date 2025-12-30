import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Habit, Player } from '../types';
import { HabitCard } from '../components/HabitCard';
import { storageService } from '../services/storageService';
import { notificationService } from '../services/notificationService';
import { DEFAULT_HABITS } from '../utils/defaultHabits';
import { RETRO_THEME } from '../utils/theme';
import { PixelAvatar } from '../components/PixelAvatar';
import { deserializeCharacter } from '../utils/pixelCharacter';
import { translations, Language } from '../utils/translations';

export const HomeScreen = () => {
  const navigation = useNavigation();
  const [habits, setHabits] = useState([]);
  const [player, setPlayer] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const progressValue = useSharedValue(0);
  const language = ((global ).appLanguage ) || 'pt';
  const t = translations[language];

  useEffect(() => {
    loadData();
    initializeNotifications();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  useEffect(() => {
    const completed = habits.filter(h => h.completed).length;
    const progress = habits.length > 0 ? completed / habits.length : 0;
    progressValue.value = withSpring(progress, {
      damping: 15,
    });
  }, [habits]);

  const initializeNotifications = async () => {
    const hasPermission = await notificationService.requestPermission();
    if (hasPermission) {
      await notificationService.createChannel();
    }
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const savedPlayer = await storageService.getPlayer();
      setPlayer(savedPlayer);
      await loadHabits();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadHabits = async () => {
    const savedHabits = await storageService.getHabits();
    if (savedHabits.length === 0) {
      const initialHabits = DEFAULT_HABITS.map((h, index) => ({
        ...h,
        id: `habit-${index}`,
        completed: false,
        streak: 0,
        createdAt: new Date(),
        lastCompletedDate: null,
      }));
      await storageService.saveHabits(initialHabits);
      setHabits(initialHabits);
      
      initialHabits.forEach(habit => {
        notificationService.scheduleHabitNotification(habit);
      });
    } else {
      const today = new Date().toDateString();
      const lastCheckDate = await storageService.getLastCheckDate();
      
      if (lastCheckDate !== today) {
        const resetHabits = savedHabits.map(habit => ({
          ...habit,
          completed: false,
          waterAmount: habit.trackingType === 'water' ? 0 : habit.waterAmount,
        }));
        await storageService.saveHabits(resetHabits);
        await storageService.saveLastCheckDate(today);
        setHabits(resetHabits);
      } else {
        setHabits(savedHabits);
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const toggleHabit = async (habitId) => {
    const updatedHabits = habits.map(habit => {
      if (habit.id === habitId) {
        const newCompleted = !habit.completed;
        const newStreak = newCompleted ? habit.streak + 1 : habit.streak;
        
        if (newCompleted) {
          if (player) {
            const newXp = player.xp + 10;
            const newLevel = Math.floor(newXp / 100) + 1;
            const updatedPlayer = { ...player, xp: newXp, level: newLevel };
            setPlayer(updatedPlayer);
            storageService.savePlayer(updatedPlayer);
          }
        }
        
        return { ...habit, completed: newCompleted, streak: newStreak };
      }
      return habit;
    });
    
    setHabits(updatedHabits);
    
    const completed = updatedHabits.filter(h => h.completed).length;
    const progress = updatedHabits.length > 0 ? completed / updatedHabits.length : 0;
    progressValue.value = withSpring(progress, {
      damping: 15,
    });
    
    await storageService.saveHabits(updatedHabits);
  };

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value * 100}%`,
  }), []);

  const completedCount = habits.filter(h => h.completed).length;
  const totalCount = habits.length;
  const xpToNextLevel = player ? 100 - (player.xp % 100) : 100;

  const getPlayerCharacter = () => {
    if (!player || !player.avatar) return null;
    try {
      return deserializeCharacter(player.avatar);
    } catch (error) {
      return null;
    }
  };

  const playerCharacter = getPlayerCharacter();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>▸ Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={RETRO_THEME.colors.background} />
      
      <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
        <TouchableOpacity 
          style={styles.playerInfo}
          onPress={() => navigation.navigate('StatsTab')}
          activeOpacity={0.8}>
          {playerCharacter ? (
            <PixelAvatar character={playerCharacter} size={64} />
          ) : (
            <View style={styles.placeholderAvatar}>
              <Text style={styles.placeholderText}>👤</Text>
            </View>
          )}
          <View style={styles.playerDetails}>
            <Text style={styles.playerName}>{player?.name || 'JOGADOR'}</Text>
            <Text style={styles.playerLevel}>LVL {player?.level || 1} | {xpToNextLevel} XP p/ próximo</Text>
          </View>
        </TouchableOpacity>
        
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{t.dailyTasks}</Text>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, progressBarStyle]} />
          </View>
          <Text style={styles.progressText}>
            [ {completedCount}/{totalCount} {t.complete} ]
          </Text>
        </View>
      </Animated.View>

      <FlatList
        data={habits}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeIn.delay(index * 100)}>
            <HabitCard
              habit={item}
              onToggle={() => toggleHabit(item.id)}
              onPress={() => navigation.navigate('HabitDetail', { habit: item })}
              onUpdate={loadData}
            />
          </Animated.View>
        )}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={RETRO_THEME.colors.primary}
          />
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddHabit')}
        activeOpacity={0.8}>
        <Text style={styles.fabIcon}>{t.newTask}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RETRO_THEME.colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: RETRO_THEME.colors.cardBackground,
    borderBottomWidth: 2,
    borderBottomColor: RETRO_THEME.colors.primary,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: RETRO_THEME.colors.background,
    borderWidth: 2,
    borderColor: RETRO_THEME.colors.border,
    gap: 12,
  },
  playerDetails: {
    flex: 1,
  },
  placeholderAvatar: {
    width: 64,
    height: 64,
    backgroundColor: RETRO_THEME.colors.cardBackground,
    borderWidth: 2,
    borderColor: RETRO_THEME.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
  },
  playerName: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 16,
    color: RETRO_THEME.colors.primary,
    marginBottom: 4,
    letterSpacing: 1,
  },
  playerLevel: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 14,
    color: RETRO_THEME.colors.accent,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 18,
    color: RETRO_THEME.colors.primary,
    letterSpacing: 2,
  },
  progressContainer: {
    marginTop: 12,
  },
  progressBar: {
    height: 24,
    backgroundColor: RETRO_THEME.colors.background,
    borderWidth: 2,
    borderColor: RETRO_THEME.colors.border,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: RETRO_THEME.colors.primary,
  },
  progressText: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 12,
    color: RETRO_THEME.colors.accent,
    textAlign: 'center',
  },
  list: {
    paddingTop: 16,
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: RETRO_THEME.colors.cardBackground,
    borderWidth: 2,
    borderColor: RETRO_THEME.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: RETRO_THEME.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  fabIcon: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 14,
    color: RETRO_THEME.colors.primary,
    letterSpacing: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 16,
    color: RETRO_THEME.colors.text,
    letterSpacing: 2,
  },
});

