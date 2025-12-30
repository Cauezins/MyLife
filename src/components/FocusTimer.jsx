import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { RETRO_THEME } from '../utils/theme';
import { storageService } from '../services/storageService';
import { notificationService } from '../services/notificationService';

export const FocusTimer = ({ habit, onUpdate }) => {
  const [visible, setVisible] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const intervalRef = useRef(null);
  const notificationIntervalRef = useRef(null);

  const defaultDuration = habit.timerMinutes || 25;

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (notificationIntervalRef.current) {
      clearInterval(notificationIntervalRef.current);
    }

    if (isRunning && timeLeft > 0) {
      // Interval do timer
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      notificationIntervalRef.current = setInterval(() => {
        updateTimerNotification();
      }, 5000);
      
      updateTimerNotification();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (notificationIntervalRef.current) {
        clearInterval(notificationIntervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const updateTimerNotification = async () => {
    if (!isRunning || timeLeft <= 0) return;
    
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    await notificationService.updateOngoingNotification(
      `timer-${habit.id}`,
      `⏱️ ${habit.name} - ${timeString}`,
      `Tempo restante: ${minutes}min ${seconds}s`
    );
  };

  const startTimer = async (minutes) => {
    const seconds = minutes * 60;
    setTimeLeft(seconds);
    setTotalTime(seconds);
    setIsRunning(true);
    setVisible(true);
    
    await notificationService.displayOngoingNotification(
      `timer-${habit.id}`,
      `⏱️ ${habit.name} - ${minutes}:00`,
      `Timer de ${minutes} minutos iniciado`
    );
  };

  const handleComplete = async () => {
    setIsRunning(false);
    setTimeLeft(0);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (notificationIntervalRef.current) {
      clearInterval(notificationIntervalRef.current);
    }
    
    await notificationService.cancelOngoingNotification(`timer-${habit.id}`);
    
    const habits = await storageService.getHabits();
    const updated = habits.map(h => {
      if (h.id === habit.id) {
        return {
          ...h,
          completed: true,
          streak: h.streak + 1,
        };
      }
      return h;
    });
    await storageService.saveHabits(updated);

    await storageService.logHabitCompletion({
      habitId: habit.id,
      completedAt: new Date(),
      timerUsed: true,
    });

    const player = await storageService.getPlayer();
    if (player) {
      const focusMinutes = totalTime / 60;
      await storageService.savePlayer({
        ...player,
        xp: player.xp + 20, 
        stats: {
          ...player.stats,
          totalFocusMinutes: (player.stats?.totalFocusMinutes || 0) + focusMinutes,
        },
      });
    }

    Alert.alert(
      '✓ FOCO COMPLETADO',
      `Você focou por ${Math.round(totalTime / 60)} minutos!\n+20 XP ganho!`,
      [{ text: 'OK', onPress: () => setVisible(false) }]
    );

    onUpdate();
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resumeTimer = () => {
    if (timeLeft > 0) {
      setIsRunning(true);
    }
  };

  const cancelTimer = async () => {
    Alert.alert(
      'CANCELAR TIMER',
      'Tem certeza? Seu progresso será perdido.',
      [
        { text: 'CONTINUAR', style: 'cancel' },
        {
          text: 'CANCELAR',
          style: 'destructive',
          onPress: async () => {
            setIsRunning(false);
            setTimeLeft(0);
            setVisible(false);
            await notificationService.cancelOngoingNotification(`timer-${habit.id}`);
          },
        },
      ]
    );
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.title}>◎ TEMPORIZADOR DE FOCO</Text>

        <View style={styles.presets}>
          <TouchableOpacity
            style={styles.presetButton}
            onPress={() => startTimer(15)}
            activeOpacity={0.8}>
            <Text style={styles.presetText}>15 MIN</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.presetButton}
            onPress={() => startTimer(defaultDuration)}
            activeOpacity={0.8}>
            <Text style={styles.presetText}>{defaultDuration} MIN</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.presetButton}
            onPress={() => startTimer(45)}
            activeOpacity={0.8}>
            <Text style={styles.presetText}>45 MIN</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.presetButton}
            onPress={() => startTimer(60)}
            activeOpacity={0.8}>
            <Text style={styles.presetText}>60 MIN</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.hint}>
          💡 Use para não ser interrompido durante a atividade
        </Text>
      </View>

      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>═ MODO FOCO ═</Text>
            
            <View style={styles.timerDisplay}>
              <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
            </View>

            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>

            <Text style={styles.taskName}>{habit.name}</Text>

            <View style={styles.controls}>
              {isRunning ? (
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={pauseTimer}
                  activeOpacity={0.8}>
                  <Text style={styles.controlText}>■ PAUSAR</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={resumeTimer}
                  activeOpacity={0.8}>
                  <Text style={styles.controlText}>▶ RETOMAR</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.controlButton, styles.cancelButton]}
                onPress={cancelTimer}
                activeOpacity={0.8}>
                <Text style={styles.controlText}>× CANCELAR</Text>
              </TouchableOpacity>
            </View>

            {!isRunning && timeLeft > 0 && (
              <Text style={styles.pausedText}>▌▌ PAUSADO</Text>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: RETRO_THEME.colors.cardBackground,
    borderWidth: 2,
    borderColor: RETRO_THEME.colors.border,
    padding: 15,
    marginVertical: 10,
  },
  title: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 10,
    color: RETRO_THEME.colors.accent,
    letterSpacing: 1,
    marginBottom: 15,
  },
  presets: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  presetButton: {
    flex: 1,
    backgroundColor: RETRO_THEME.colors.background,
    borderWidth: 2,
    borderColor: RETRO_THEME.colors.primary,
    padding: 12,
    alignItems: 'center',
  },
  presetText: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 9,
    color: RETRO_THEME.colors.text,
    letterSpacing: 1,
  },
  hint: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 8,
    color: RETRO_THEME.colors.textDark,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: RETRO_THEME.colors.cardBackground,
    borderWidth: 3,
    borderColor: RETRO_THEME.colors.primary,
    padding: 30,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 14,
    color: RETRO_THEME.colors.primary,
    textAlign: 'center',
    marginBottom: 30,
    letterSpacing: 2,
  },
  timerDisplay: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timerText: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 48,
    color: RETRO_THEME.colors.primary,
    letterSpacing: 4,
    textShadowColor: RETRO_THEME.colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  progressBar: {
    height: 10,
    backgroundColor: RETRO_THEME.colors.background,
    borderWidth: 2,
    borderColor: RETRO_THEME.colors.border,
    marginBottom: 20,
  },
  progressFill: {
    height: '100%',
    backgroundColor: RETRO_THEME.colors.primary,
  },
  taskName: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 12,
    color: RETRO_THEME.colors.text,
    textAlign: 'center',
    marginBottom: 30,
  },
  controls: {
    gap: 10,
  },
  controlButton: {
    backgroundColor: RETRO_THEME.colors.background,
    borderWidth: 2,
    borderColor: RETRO_THEME.colors.primary,
    padding: 15,
    alignItems: 'center',
  },
  cancelButton: {
    borderColor: RETRO_THEME.colors.danger,
  },
  controlText: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 11,
    color: RETRO_THEME.colors.text,
    letterSpacing: 2,
  },
  pausedText: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 10,
    color: RETRO_THEME.colors.warning,
    textAlign: 'center',
    marginTop: 15,
  },
});
