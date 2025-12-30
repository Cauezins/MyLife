import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { Habit, RecurrenceType } from '../types';
import { storageService } from '../services/storageService';
import { notificationService } from '../services/notificationService';
import { RETRO_THEME } from '../utils/theme';
import { PIXEL_ICON_LIST } from '../utils/pixelIcons';
import { RecurrenceSelector, DaySelector, TrackingTypeSelector } from '../components/RecurrenceSelectors';
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

export const AddHabitScreen = () => {
  const navigation = useNavigation();
  const language = ((global ).appLanguage ) || 'pt';
  const t = translations[language];
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(PIXEL_ICON_LIST[0]);
  const [time, setTime] = useState('09:00');
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [recurrenceType, setRecurrenceType] = useState('daily');
  const [specificDays, setSpecificDays] = useState([]);
  const [intervalMinutes, setIntervalMinutes] = useState('30');
  const [trackingType, setTrackingType] = useState('default');
  const [waterGoal, setWaterGoal] = useState('2');
  const [sleepGoalHours, setSleepGoalHours] = useState('8');
  const [timerMinutes, setTimerMinutes] = useState('25');

  const handleSave = async () => {
    if (!name.trim()) return;
    const newHabit = {
      id: `habit-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      icon: selectedIcon,
      time: time,
      completed: false,
      streak: 0,
      createdAt: new Date(),
      notificationEnabled,
      recurrenceType,
      specificDays: recurrenceType === 'specific-days' ? specificDays : [],
      intervalMinutes: trackingType === 'interval' ? parseInt(intervalMinutes) || 30 : null,
      trackingType,
      waterAmount: trackingType === 'water' ? 0 : undefined,
      waterGoal: trackingType === 'water' ? parseFloat(waterGoal) || 2 : undefined,
      sleepData: trackingType === 'sleep' ? {} : undefined,
      sleepGoalHours: trackingType === 'sleep' ? parseFloat(sleepGoalHours) || 8 : undefined,
      timerMinutes: trackingType === 'timer' ? parseInt(timerMinutes) || 25 : undefined,
    };

    const habits = await storageService.getHabits();
    const updatedHabits = [...habits, newHabit];
    await storageService.saveHabits(updatedHabits);

    if (notificationEnabled) {
      await notificationService.scheduleHabitNotification(newHabit);
    }

    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t.newTask}</Text>
      </View>

      <PlatformScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
      >
        <Animated.View entering={FadeInDown.delay(100)}>
          <Text style={styles.label}>▸ {t.icon}:</Text>
          <View style={styles.iconGrid}>
            {PIXEL_ICON_LIST.map(icon => (
              <TouchableOpacity
                key={icon}
                onPress={() => setSelectedIcon(icon)}
                style={[
                  styles.iconButton,
                  selectedIcon === icon && styles.iconButtonSelected,
                ]}
                activeOpacity={0.8}>
                <Text style={styles.iconText}>{icon}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)}>
          <Text style={styles.label}>▸ {t.taskName}:</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputPrefix}>{'> '}</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder={t.exampleTask}
              placeholderTextColor={RETRO_THEME.colors.textDark}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300)}>
          <Text style={styles.label}>▸ {t.description}:</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputPrefix}>{'> '}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder={t.describeTask}
              placeholderTextColor={RETRO_THEME.colors.textDark}
              multiline
              numberOfLines={3}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400)}>
          <RecurrenceSelector
            selected={recurrenceType}
            onSelect={setRecurrenceType}
          />
          {recurrenceType === 'specific-days' && (
            <DaySelector
              selectedDays={specificDays}
              onToggleDay={(day) => {
                if (specificDays.includes(day)) {
                  setSpecificDays(specificDays.filter(d => d !== day));
                } else {
                  setSpecificDays([...specificDays, day]);
                }
              }}
            />
          )}
          {recurrenceType === 'interval' && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputPrefix}>{'> '}</Text>
              <TextInput
                style={styles.input}
                value={intervalMinutes}
                onChangeText={setIntervalMinutes}
                placeholder="MINUTOS"
                keyboardType="number-pad"
                placeholderTextColor={RETRO_THEME.colors.textDark}
              />
              <Text style={styles.inputSuffix}>MIN</Text>
            </View>
          )}
          
          {recurrenceType !== 'interval' && (
            <>
              <Text style={styles.label}>▸ {t.time}:</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputPrefix}>{'> '}</Text>
                <TextInput
                  style={styles.input}
                  value={time}
                  onChangeText={setTime}
                  placeholder="HH:MM"
                  placeholderTextColor={RETRO_THEME.colors.textDark}
                  keyboardType="numbers-and-punctuation"
                />
              </View>
            </>
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500)}>
          <TrackingTypeSelector
            selected={trackingType}
            onSelect={setTrackingType}
          />
          {trackingType === 'water' && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputPrefix}>{'> META: '}</Text>
              <TextInput
                style={styles.input}
                value={waterGoal}
                onChangeText={setWaterGoal}
                placeholder="2.0"
                keyboardType="decimal-pad"
                placeholderTextColor={RETRO_THEME.colors.textDark}
              />
              <Text style={styles.inputSuffix}>LITROS</Text>
            </View>
          )}
          {trackingType === 'sleep' && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputPrefix}>{'> META: '}</Text>
              <TextInput
                style={styles.input}
                value={sleepGoalHours}
                onChangeText={setSleepGoalHours}
                placeholder="8"
                keyboardType="decimal-pad"
                placeholderTextColor={RETRO_THEME.colors.textDark}
              />
              <Text style={styles.inputSuffix}>HORAS</Text>
            </View>
          )}
          {trackingType === 'timer' && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputPrefix}>{'> DURAÇÃO: '}</Text>
              <TextInput
                style={styles.input}
                value={timerMinutes}
                onChangeText={setTimerMinutes}
                placeholder="25"
                keyboardType="number-pad"
                placeholderTextColor={RETRO_THEME.colors.textDark}
              />
              <Text style={styles.inputSuffix}>MIN</Text>
            </View>
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(700)}>
          <TouchableOpacity
            style={styles.notificationToggle}
            onPress={() => setNotificationEnabled(!notificationEnabled)}
            activeOpacity={0.8}>
            <View>
              <Text style={styles.notificationTitle}>▸ {t.notifications}</Text>
              <Text style={styles.notificationSubtitle}>
                {notificationEnabled ? '[  ON  ]' : '[ OFF ]'}
              </Text>
            </View>
            <Text style={styles.toggleIcon}>
              {notificationEnabled ? '■' : '□'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(800)}>
          <TouchableOpacity
            style={[styles.saveButton, !name.trim() && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!name.trim()}
            activeOpacity={0.8}>
            <Text style={styles.saveButtonText}>
              {name.trim() ? `▶ ${t.saveTask} ◀` : `[ ${t.enterName} ]`}
            </Text>
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
  label: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 14,
    color: RETRO_THEME.colors.accent,
    marginBottom: 8,
    marginTop: 16,
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
    padding: 8,
  },
  inputSuffix: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 14,
    color: RETRO_THEME.colors.textDark,
    marginLeft: 8,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconButton: {
    width: 64,
    height: 64,
    backgroundColor: RETRO_THEME.colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: RETRO_THEME.colors.border,
  },
  iconButtonSelected: {
    borderColor: RETRO_THEME.colors.primary,
    backgroundColor: RETRO_THEME.colors.background,
  },
  iconText: {
    fontSize: 32,
    color: RETRO_THEME.colors.text,
  },
  notificationToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: RETRO_THEME.colors.cardBackground,
    borderWidth: 2,
    borderColor: RETRO_THEME.colors.border,
    padding: 12,
    marginTop: 16,
  },
  notificationTitle: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 14,
    color: RETRO_THEME.colors.text,
    marginBottom: 4,
    letterSpacing: 1,
  },
  notificationSubtitle: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 12,
    color: RETRO_THEME.colors.accent,
  },
  toggleIcon: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 20,
    color: RETRO_THEME.colors.primary,
  },
  saveButton: {
    backgroundColor: RETRO_THEME.colors.cardBackground,
    borderWidth: 2,
    borderColor: RETRO_THEME.colors.primary,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  saveButtonDisabled: {
    borderColor: RETRO_THEME.colors.border,
    opacity: 0.5,
  },
  saveButtonText: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 14,
    color: RETRO_THEME.colors.primary,
    letterSpacing: 1,
  },
  backButton: {
    backgroundColor: RETRO_THEME.colors.cardBackground,
    borderWidth: 2,
    borderColor: RETRO_THEME.colors.border,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  backButtonText: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 14,
    color: RETRO_THEME.colors.text,
    letterSpacing: 1,
  },
});

