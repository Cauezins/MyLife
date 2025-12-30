import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { RETRO_THEME } from '../utils/theme';

export const HabitCard = ({
  habit,
  onToggle,
  onPress,
  onUpdate,
}) => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotateZ: `${rotation.value}deg` },
    ],
  }), []);

  const handleToggle = () => {
    scale.value = withSequence(
      withSpring(1.1, { damping: 10 }),
      withSpring(1, { damping: 10 })
    );
    rotation.value = withSequence(
      withTiming(5, { duration: 100 }),
      withTiming(-5, { duration: 100 }),
      withTiming(0, { duration: 100 })
    );
    onToggle();
  };

  const isSleeping = habit.trackingType === 'sleep' && habit.sleepData?.bedTime && !habit.sleepData?.wakeTime;
  const showCheckbox = !habit.trackingType || habit.trackingType === 'default';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <Animated.View
        style={[
          styles.card,
          animatedStyle,
          habit.completed && styles.completedCard,
          isSleeping && styles.sleepingCard,
        ]}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{habit.icon}</Text>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.title}>{habit.name.toUpperCase()}</Text>
          <Text style={styles.description}>{habit.description}</Text>
          {isSleeping && (
            <Text style={styles.sleepingStatus}>💤 DORMINDO...</Text>
          )}
          <View style={styles.footer}>
            {habit.recurrenceType !== 'interval' && habit.time && (
              <Text style={styles.time}>◎ {habit.time}</Text>
            )}
            {habit.recurrenceType === 'interval' && (
              <Text style={styles.time}>⟳ A cada {habit.intervalMinutes}min</Text>
            )}
            {habit.streak > 0 && (
              <Text style={styles.streak}>▲ {habit.streak}D</Text>
            )}
          </View>
        </View>

        {showCheckbox && (
          <TouchableOpacity
            onPress={handleToggle}
            style={[
              styles.checkbox,
              habit.completed && styles.checkboxCompleted,
            ]}>
            {habit.completed && <Text style={styles.checkmark}>■</Text>}
          </TouchableOpacity>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: RETRO_THEME.colors.cardBackground,
    borderWidth: 2,
    borderColor: RETRO_THEME.colors.border,
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 8,
    alignItems: 'center',
  },
  completedCard: {
    borderColor: RETRO_THEME.colors.primary,
    backgroundColor: RETRO_THEME.colors.cardBackground,
    shadowColor: RETRO_THEME.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  sleepingCard: {
    borderColor: '#6a6aaa',
    backgroundColor: '#3a3a5a',
  },
  sleepingStatus: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 11,
    color: '#a0a0ff',
    marginTop: 4,
    letterSpacing: 1,
  },
  iconContainer: {
    width: 50,
    height: 50,
    backgroundColor: RETRO_THEME.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: RETRO_THEME.colors.border,
  },
  icon: {
    fontSize: 32,
    color: RETRO_THEME.colors.text,
  },
  content: {
    flex: 1,
  },
  title: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 14,
    fontWeight: '700',
    color: RETRO_THEME.colors.text,
    marginBottom: 4,
    letterSpacing: 1,
  },
  description: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 10,
    color: RETRO_THEME.colors.textDark,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 10,
    color: RETRO_THEME.colors.accent,
    marginRight: 12,
  },
  streak: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 10,
    color: RETRO_THEME.colors.warning,
    fontWeight: '600',
  },
  checkbox: {
    width: 32,
    height: 32,
    borderWidth: 3,
    borderColor: RETRO_THEME.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: RETRO_THEME.colors.background,
  },
  checkboxCompleted: {
    backgroundColor: RETRO_THEME.colors.primary,
    borderColor: RETRO_THEME.colors.primary,
  },
  checkmark: {
    color: RETRO_THEME.colors.background,
    fontSize: 20,
    fontWeight: '700',
  },
});
