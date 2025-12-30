import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { RETRO_THEME } from '../utils/theme';
import { RecurrenceType } from '../types';
import { translations, Language } from '../utils/translations';



export const RecurrenceSelector = ({
  selected,
  onSelect,
}) => {
  const language = ((global ).appLanguage ) || 'pt';
  const t = translations[language];
  
  const options = [
    { value: 'daily', label: t.recurrenceDaily, desc: t.recurrenceDescDaily },
    { value: 'specific-days', label: t.recurrenceSpecificDays, desc: t.recurrenceDescSpecificDays },
    { value: 'interval', label: t.recurrenceInterval, desc: t.recurrenceDescInterval },
    { value: 'temporary', label: t.recurrenceTemporary, desc: t.recurrenceDescTemporary },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>▸ {t.recurrence}:</Text>
      {options.map(option => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.option,
            selected === option.value && styles.optionSelected,
          ]}
          onPress={() => onSelect(option.value)}
          activeOpacity={0.8}>
          <View>
            <Text style={styles.optionLabel}>{option.label}</Text>
            <Text style={styles.optionDesc}>{option.desc}</Text>
          </View>
          <Text style={styles.checkbox}>
            {selected === option.value ? '■' : '□'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};



export const DaySelector = ({
  selectedDays,
  onToggleDay,
}) => {
  const language = ((global ).appLanguage ) || 'pt';
  const t = translations[language];
  
  const days = [
    t.sunday, t.monday, t.tuesday, t.wednesday,
    t.thursday, t.friday, t.saturday
  ];

  return (
    <View style={styles.dayContainer}>
      {days.map((day, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.dayButton,
            selectedDays.includes(index) && styles.dayButtonSelected,
          ]}
          onPress={() => onToggleDay(index)}
          activeOpacity={0.8}>
          <Text style={styles.dayText}>{day}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};



export const TrackingTypeSelector = ({
  selected,
  onSelect,
}) => {
  const language = ((global ).appLanguage ) || 'pt';
  const t = translations[language];
  
  const options = [
    { value: 'default', label: t.trackingDefault, icon: '✓' },
    { value: 'water', label: t.trackingWater, icon: '◇' },
    { value: 'sleep', label: t.trackingSleep, icon: '◢' },
    { value: 'timer', label: t.trackingTimer, icon: '◎' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>▸ {t.trackingLabel}:</Text>
      <View style={styles.trackingGrid}>
        {options.map(option => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.trackingButton,
              selected === option.value && styles.trackingButtonSelected,
            ]}
            onPress={() => onSelect(option.value)}
            activeOpacity={0.8}>
            <Text style={styles.trackingIcon}>{option.icon}</Text>
            <Text style={styles.trackingLabel}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 14,
    color: RETRO_THEME.colors.accent,
    marginBottom: 8,
    letterSpacing: 1,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: RETRO_THEME.colors.cardBackground,
    borderWidth: 2,
    borderColor: RETRO_THEME.colors.border,
    padding: 12,
    marginBottom: 8,
  },
  optionSelected: {
    borderColor: RETRO_THEME.colors.primary,
    backgroundColor: RETRO_THEME.colors.background,
  },
  optionLabel: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 14,
    color: RETRO_THEME.colors.text,
    letterSpacing: 1,
    marginBottom: 4,
  },
  optionDesc: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 12,
    color: RETRO_THEME.colors.textDark,
  },
  checkbox: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 20,
    color: RETRO_THEME.colors.primary,
  },
  dayContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  dayButton: {
    flex: 1,
    backgroundColor: RETRO_THEME.colors.cardBackground,
    borderWidth: 2,
    borderColor: RETRO_THEME.colors.border,
    padding: 12,
    alignItems: 'center',
  },
  dayButtonSelected: {
    borderColor: RETRO_THEME.colors.primary,
    backgroundColor: RETRO_THEME.colors.background,
  },
  dayText: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 14,
    color: RETRO_THEME.colors.text,
  },
  trackingGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  trackingButton: {
    flex: 1,
    backgroundColor: RETRO_THEME.colors.cardBackground,
    borderWidth: 2,
    borderColor: RETRO_THEME.colors.border,
    padding: 12,
    alignItems: 'center',
  },
  trackingButtonSelected: {
    borderColor: RETRO_THEME.colors.primary,
    backgroundColor: RETRO_THEME.colors.background,
  },
  trackingIcon: {
    fontSize: 24,
    color: RETRO_THEME.colors.text,
    marginBottom: 4,
  },
  trackingLabel: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 12,
    color: RETRO_THEME.colors.text,
  },
});

