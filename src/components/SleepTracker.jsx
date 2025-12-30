import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { RETRO_THEME } from '../utils/theme';
import { Habit } from '../types';
import { storageService } from '../services/storageService';
import { notificationService } from '../services/notificationService';



export const SleepTracker = ({ habit, onUpdate, compact = false }) => {
  const [bedTime, setBedTime] = useState(
    habit.sleepData?.bedTime ? new Date(habit.sleepData.bedTime) : null
  );
  const [wakeTime, setWakeTime] = useState(
    habit.sleepData?.wakeTime ? new Date(habit.sleepData.wakeTime) : null
  );

  useEffect(() => {
    if (bedTime && !wakeTime) {
      const interval = setInterval(() => {
        updateSleepNotification();
      }, 60000);
      
      updateSleepNotification();
      
      return () => clearInterval(interval);
    }
  }, [bedTime, wakeTime]);

  const updateSleepNotification = async () => {
    if (!bedTime || wakeTime) return;
    
    const now = new Date();
    const duration = Math.round((now.getTime() - bedTime.getTime()) / (1000 * 60));
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    
    await notificationService.updateOngoingNotification(
      `sleep-${habit.id}`,
      `💤 ${habit.name} - Dormindo`,
      `Tempo de sono: ${hours}h ${minutes}min`
    );
  };

  const handleBedTime = async () => {
    const now = new Date();
    const habits = await storageService.getHabits();
    
    const updated = habits.map(h => {
      if (h.id === habit.id) {
        return {
          ...h,
          sleepData: {
            ...h.sleepData,
            bedTime,
            wakeTime, 
          },
        };
      }
      return h;
    });
    
    await storageService.saveHabits(updated);
    setBedTime(now);
    setWakeTime(null);
    
    await notificationService.displayOngoingNotification(
      `sleep-${habit.id}`,
      `💤 ${habit.name} - Dormindo`,
      `Iniciado às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    );
    
    onUpdate();
  };

  const handleWakeTime = async () => {
    if (!bedTime) return;
    
    const now = new Date();
    const habits = await storageService.getHabits();
    
    const duration = Math.round((now.getTime() - bedTime.getTime()) / (1000 * 60));
    const hours = duration / 60;
    const goalHours = habit.sleepGoalHours || 8; 
    const goalReached = hours >= goalHours;
    
    const updated = habits.map(h => {
      if (h.id === habit.id) {
        return {
          ...h,
          sleepData: {
            ...h.sleepData,
            wakeTime,
          },
          completed,
          streak: completed ? h.streak + 1 : h.streak,
        };
      }
      return h;
    });
    
    await storageService.saveHabits(updated);
    
    await storageService.logHabitCompletion({
      habitId: habit.id,
      completedAt,
      sleepDuration,
    });
    
    await notificationService.cancelOngoingNotification(`sleep-${habit.id}`);
    
    setWakeTime(now);
    onUpdate();
  };

  const calculateSleepDuration = () => {
    if (!bedTime || !wakeTime) return null;
    
    const diff = wakeTime.getTime() - bedTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { hours, minutes };
  };

  const formatTime = (date) => {
    if (!date) return '--:--';
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const duration = calculateSleepDuration();

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        {duration ? (
          <View>
            <Text style={styles.compactTitle}>◢ SONO: {duration.hours}h {duration.minutes}m</Text>
            {duration.hours >= 7 && duration.hours <= 9 && (
              <Text style={styles.goodSleepCompact}>✓ IDEAL</Text>
            )}
          </View>
        ) : bedTime && !wakeTime ? (
          <Text style={styles.compactTitle}>◢ DORMINDO...</Text>
        ) : (
          <Text style={styles.compactTitle}>◢ SONO: --:--</Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>◢ CONTROLE DE SONO</Text>

      <View style={styles.timeContainer}>
        <View style={styles.timeBlock}>
          <Text style={styles.timeLabel}>▸ DORMIU:</Text>
          <Text style={styles.time}>{formatTime(bedTime)}</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={handleBedTime}
            activeOpacity={0.8}>
            <Text style={styles.buttonText}>
              {bedTime ? 'REDEFINIR' : '► MARCAR'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <View style={styles.timeBlock}>
          <Text style={styles.timeLabel}>▸ ACORDOU:</Text>
          <Text style={styles.time}>{formatTime(wakeTime)}</Text>
          <TouchableOpacity
            style={[styles.button, !bedTime && styles.buttonDisabled]}
            onPress={handleWakeTime}
            disabled={!bedTime || !!wakeTime}
            activeOpacity={0.8}>
            <Text style={styles.buttonText}>
              {wakeTime ? '✓ OK' : '► MARCAR'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {duration && (
        <View style={styles.durationContainer}>
          <Text style={styles.durationLabel}>DURAÇÃO DO SONO:</Text>
          <Text style={styles.duration}>
            {duration.hours}h {duration.minutes}m
          </Text>
          {duration.hours >= 7 && duration.hours <= 9 && (
            <Text style={styles.goodSleep}>✓ SONO IDEAL!</Text>
          )}
        </View>
      )}

      {bedTime && !wakeTime && (
        <Text style={styles.sleeping}>● DORMINDO...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  compactContainer: {
    backgroundColor: RETRO_THEME.colors.background,
    borderWidth: 2,
    borderColor: RETRO_THEME.colors.border,
    borderTopWidth: 0,
    padding: 12,
    marginHorizontal: 16,
    marginTop: -8,
    marginBottom: 8,
  },
  compactTitle: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 14,
    color: RETRO_THEME.colors.accent,
    letterSpacing: 1,
  },
  goodSleepCompact: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 12,
    color: RETRO_THEME.colors.success,
    marginTop: 4,
  },
  container: {
    backgroundColor: RETRO_THEME.colors.cardBackground,
    borderWidth: 2,
    borderColor: RETRO_THEME.colors.border,
    padding: 16,
    marginVertical: 8,
  },
  title: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 16,
    color: RETRO_THEME.colors.accent,
    letterSpacing: 1,
    marginBottom: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  timeBlock: {
    flex: 1,
  },
  divider: {
    width: 2,
    backgroundColor: RETRO_THEME.colors.border,
  },
  timeLabel: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 12,
    color: RETRO_THEME.colors.textDark,
    marginBottom: 4,
  },
  time: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 14,
    color: RETRO_THEME.colors.text,
    marginBottom: 8,
  },
  button: {
    backgroundColor: RETRO_THEME.colors.background,
    borderWidth: 2,
    borderColor: RETRO_THEME.colors.primary,
    padding: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    borderColor: RETRO_THEME.colors.border,
    opacity: 0.5,
  },
  buttonText: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 14,
    color: RETRO_THEME.colors.text,
    letterSpacing: 1,
  },
  durationContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: RETRO_THEME.colors.background,
    borderWidth: 2,
    borderColor: RETRO_THEME.colors.primary,
    alignItems: 'center',
  },
  durationLabel: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 12,
    color: RETRO_THEME.colors.textDark,
    marginBottom: 4,
  },
  duration: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 18,
    color: RETRO_THEME.colors.primary,
  },
  goodSleep: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 14,
    color: RETRO_THEME.colors.success,
    marginTop: 8,
  },
  sleeping: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 14,
    color: RETRO_THEME.colors.warning,
    textAlign: 'center',
    marginTop: 12,
  },
});

