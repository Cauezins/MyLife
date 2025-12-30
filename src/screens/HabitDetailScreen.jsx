import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Habit } from '../types';
import { storageService } from '../services/storageService';
import { notificationService } from '../services/notificationService';
import { RETRO_THEME } from '../utils/theme';
import { WaterTracker } from '../components/WaterTracker';
import { SleepTracker } from '../components/SleepTracker';
import { FocusTimer } from '../components/FocusTimer';
import { translations } from '../utils/translations';

// ScrollView wrapper otimizado para web
const PlatformScrollView = Platform.OS === 'web' 
  ? ({ children, style, contentContainerStyle }) => (
      <View style={[style, { overflow: 'auto'  }]}>
        <View style={contentContainerStyle}>
          {children}
        </View>
      </View>
    )
  : ScrollView;

export const HabitDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const initialHabit = route.params?.habit;
  const [habit, setHabit] = React.useState(initialHabit);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const language = ((global ).appLanguage ) || 'pt';
  const t = translations[language];

  const handleUpdate = async () => {
    // Recarregar o hábito do storage
    const habits = await storageService.getHabits();
    const updatedHabit = habits.find(h => h.id === habit.id);
    if (updatedHabit) {
      setHabit(updatedHabit);
    }
    setRefreshKey(prev => prev + 1);
  };

  if (!habit) {
    navigation.goBack();
    return null;
  }

  const handleDelete = () => {
    Alert.alert(
      `═ ${t.deleteTask} ═`,
      `${t.confirmDelete} "${habit.name}"?`,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.delete,
          style: 'destructive',
          onPress: async () => {
            const habits = await storageService.getHabits();
            const updatedHabits = habits.filter(h => h.id !== habit.id);
            await storageService.saveHabits(updatedHabits);
            await notificationService.cancelHabitNotification(habit.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const toggleNotification = async () => {
    const habits = await storageService.getHabits();
    const updatedHabits = habits.map(h => {
      if (h.id === habit.id) {
        const newEnabled = !h.notificationEnabled;
        if (newEnabled) {
          notificationService.scheduleHabitNotification({
            ...h,
            notificationEnabled: newEnabled,
          });
        } else {
          notificationService.cancelHabitNotification(h.id);
        }
        return { ...h, notificationEnabled: newEnabled };
      }
      return h;
    });
    await storageService.saveHabits(updatedHabits);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t.taskDetail}</Text>
      </View>

      <PlatformScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
      >
        <Animated.View entering={FadeInDown.delay(100)} style={styles.iconContainer}>
          <View style={styles.iconBox}>
            <Text style={styles.icon}>{habit.icon}</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)}>
          <Text style={styles.questName}>{habit.name}</Text>
          <Text style={styles.description}>{habit.description}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300)} style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{habit.streak}</Text>
            <Text style={styles.statLabel}>▸ {t.streak}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{habit.time}</Text>
            <Text style={styles.statLabel}>▸ {t.time}</Text>
          </View>
        </Animated.View>

        {habit.trackingType === 'water' && (
          <View style={styles.trackerSection}>
            <WaterTracker key={refreshKey} habit={habit} onUpdate={handleUpdate} />
          </View>
        )}

        {habit.trackingType === 'sleep' && (
          <View style={styles.trackerSection}>
            <SleepTracker key={refreshKey} habit={habit} onUpdate={handleUpdate} />
          </View>
        )}

        {habit.trackingType === 'timer' && (
          <View style={styles.trackerSection}>
            <FocusTimer key={refreshKey} habit={habit} onUpdate={handleUpdate} />
          </View>
        )}

        <Animated.View entering={FadeInDown.delay(400)}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>═ {t.settings} ═</Text>
            
            <TouchableOpacity
              style={styles.option}
              onPress={toggleNotification}
              activeOpacity={0.8}>
              <View>
                <Text style={styles.optionTitle}>▸ {t.notifications}</Text>
                <Text style={styles.optionSubtitle}>
                  {habit.notificationEnabled ? '[  ON  ]' : '[ OFF ]'}
                </Text>
              </View>
              <Text style={styles.toggleIcon}>
                {habit.notificationEnabled ? '■' : '□'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500)}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            activeOpacity={0.8}>
            <Text style={styles.deleteButtonText}>× {t.deleteTask} ×</Text>
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}>
          <Text style={styles.backButtonText}>◀ {t.back}</Text>
        </TouchableOpacity>
      </PlatformScrollView>
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
    height: '100%',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 20,
    paddingBottom: 32,
    flexGrow: 1,
  },
  title: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 20,
    color: RETRO_THEME.colors.primary,
    letterSpacing: 2,
  },
  iconContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  iconBox: {
    width: 100,
    height: 100,
    backgroundColor: RETRO_THEME.colors.cardBackground,
    borderWidth: 2,
    borderColor: RETRO_THEME.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 48,
    color: RETRO_THEME.colors.text,
  },
  questName: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 18,
    color: RETRO_THEME.colors.text,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 1,
  },
  description: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 14,
    color: RETRO_THEME.colors.textDark,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: RETRO_THEME.colors.cardBackground,
    borderWidth: 2,
    borderColor: RETRO_THEME.colors.border,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 20,
    color: RETRO_THEME.colors.accent,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 12,
    color: RETRO_THEME.colors.textDark,
    letterSpacing: 1,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 16,
    color: RETRO_THEME.colors.primary,
    marginBottom: 12,
    letterSpacing: 2,
    textAlign: 'center',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: RETRO_THEME.colors.cardBackground,
    borderWidth: 2,
    borderColor: RETRO_THEME.colors.border,
    padding: 12,
  },
  optionTitle: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 14,
    color: RETRO_THEME.colors.text,
    marginBottom: 4,
    letterSpacing: 1,
  },
  optionSubtitle: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 12,
    color: RETRO_THEME.colors.accent,
  },
  toggleIcon: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 20,
    color: RETRO_THEME.colors.primary,
  },
  trackerSection: {
    marginHorizontal: 16,
    marginVertical: 16,
  },
  deleteButton: {
    backgroundColor: RETRO_THEME.colors.cardBackground,
    borderWidth: 2,
    borderColor: RETRO_THEME.colors.danger,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  deleteButtonText: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 14,
    color: RETRO_THEME.colors.danger,
    letterSpacing: 1,
  },
  backButton: {
    backgroundColor: RETRO_THEME.colors.cardBackground,
    borderWidth: 2,
    borderColor: RETRO_THEME.colors.border,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  backButtonText: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 14,
    color: RETRO_THEME.colors.text,
    letterSpacing: 1,
  },
});

