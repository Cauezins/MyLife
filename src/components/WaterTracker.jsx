import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
} from 'react-native';
import { RETRO_THEME } from '../utils/theme';
import { Habit } from '../types';
import { storageService } from '../services/storageService';



export const WaterTracker = ({ habit, onUpdate, compact = false }) => {
  const [visible, setVisible] = useState(false);
  const [amount, setAmount] = useState('0.25');
  const [currentAmount, setCurrentAmount] = useState(habit.waterAmount || 0);
  const goal = habit.waterGoal || 2; // Meta padrão 2L

  // Sincronizar com as mudanças do habit
  React.useEffect(() => {
    setCurrentAmount(habit.waterAmount || 0);
  }, [habit.waterAmount]);

  const addWater = async (liters) => {
    // Atualizar estado local imediatamente
    const newAmount = currentAmount + liters;
    setCurrentAmount(newAmount);
    setVisible(false);

    // Atualizar no storage
    const habits = await storageService.getHabits();
    const updated = habits.map(h => {
      if (h.id === habit.id) {
        const goalReached = newAmount >= (h.waterGoal || 2);
        
        return {
          ...h,
          waterAmount: newAmount,
          completed: goalReached, // Marca como completo se atingir meta
        };
      }
      return h;
    });
    await storageService.saveHabits(updated);
    
    // Log da atividade
    await storageService.logHabitCompletion({
      habitId: habit.id,
      completedAt: new Date(),
      waterAmount: liters,
    });
    
    onUpdate();
  };

  const percentage = Math.min((currentAmount / goal) * 100, 100);

  // Versão compacta para home
  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactHeader}>
          <Text style={styles.compactTitle}>◇ ÁGUA</Text>
          <Text style={styles.compactAmount}>{currentAmount.toFixed(1)}L / {goal}L</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${percentage}%` }]} />
        </View>
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>◇ ÁGUA HOJE</Text>
          <Text style={styles.amount}>{currentAmount.toFixed(2)}L / {goal}L</Text>
        </View>
        
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${percentage}%` }]} />
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => addWater(0.25)}
            activeOpacity={0.8}>
            <Text style={styles.buttonText}>+ 250ML</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => addWater(0.5)}
            activeOpacity={0.8}>
            <Text style={styles.buttonText}>+ 500ML</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => addWater(1)}
            activeOpacity={0.8}>
            <Text style={styles.buttonText}>+ 1L</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.customButton}
            onPress={() => setVisible(true)}
            activeOpacity={0.8}>
            <Text style={styles.buttonText}>CUSTOM</Text>
          </TouchableOpacity>
        </View>

        {percentage >= 100 && (
          <Text style={styles.goalReached}>✓ META ATINGIDA!</Text>
        )}
      </View>

      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>═ ADICIONAR ÁGUA ═</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputPrefix}>{'> '}</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="decimal-pad"
                placeholderTextColor={RETRO_THEME.colors.textDark}
              />
              <Text style={styles.inputSuffix}>LITROS</Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => addWater(parseFloat(amount) || 0)}
                activeOpacity={0.8}>
                <Text style={styles.modalButtonText}>▶ ADICIONAR</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setVisible(false)}
                activeOpacity={0.8}>
                <Text style={styles.modalButtonText}>CANCELAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
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
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  compactTitle: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 14,
    color: RETRO_THEME.colors.accent,
    letterSpacing: 1,
  },
  compactAmount: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 14,
    color: RETRO_THEME.colors.text,
  },
  container: {
    backgroundColor: RETRO_THEME.colors.cardBackground,
    borderWidth: 2,
    borderColor: RETRO_THEME.colors.border,
    padding: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 16,
    color: RETRO_THEME.colors.accent,
    letterSpacing: 1,
  },
  amount: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 14,
    color: RETRO_THEME.colors.text,
  },
  progressBar: {
    height: 24,
    backgroundColor: RETRO_THEME.colors.background,
    borderWidth: 2,
    borderColor: RETRO_THEME.colors.border,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: RETRO_THEME.colors.accent,
  },
  buttons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickButton: {
    width: '31%',
    backgroundColor: RETRO_THEME.colors.background,
    borderWidth: 2,
    borderColor: RETRO_THEME.colors.border,
    padding: 12,
    alignItems: 'center',
  },
  customButton: {
    width: '100%',
    backgroundColor: RETRO_THEME.colors.background,
    borderWidth: 2,
    borderColor: RETRO_THEME.colors.primary,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 14,
    color: RETRO_THEME.colors.text,
    letterSpacing: 1,
  },
  goalReached: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 14,
    color: RETRO_THEME.colors.success,
    textAlign: 'center',
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: RETRO_THEME.colors.cardBackground,
    borderWidth: 2,
    borderColor: RETRO_THEME.colors.primary,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 16,
    color: RETRO_THEME.colors.primary,
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: RETRO_THEME.colors.background,
    borderWidth: 2,
    borderColor: RETRO_THEME.colors.border,
    padding: 12,
    marginBottom: 16,
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
  modalButtons: {
    gap: 12,
  },
  modalButton: {
    backgroundColor: RETRO_THEME.colors.background,
    borderWidth: 2,
    borderColor: RETRO_THEME.colors.primary,
    padding: 12,
    alignItems: 'center',
  },
  cancelButton: {
    borderColor: RETRO_THEME.colors.border,
  },
  modalButtonText: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 14,
    color: RETRO_THEME.colors.text,
    letterSpacing: 1,
  },
});

