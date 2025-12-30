import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { RETRO_THEME } from '../utils/theme';

export const ColorSelector = ({
  colors,
  selectedColor,
  onSelect,
  title,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {colors.map((color) => (
          <TouchableOpacity
            key={color}
            onPress={() => onSelect(color)}
            style={[
              styles.colorButton,
              { backgroundColor: color },
              selectedColor === color && styles.colorSelected,
            ]}>
            {selectedColor === color && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export const OptionSelector = ({
  options,
  selectedIndex,
  onSelect,
  title,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {options.map((option, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => onSelect(idx)}
            style={[
              styles.optionButton,
              selectedIndex === idx && styles.optionSelected,
            ]}>
            <Text style={[
              styles.optionText,
              selectedIndex === idx && styles.optionTextSelected,
            ]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 10,
    color: RETRO_THEME.colors.accent,
    marginBottom: 10,
    letterSpacing: 1,
  },
  scrollContent: {
    gap: 8,
    paddingRight: 20,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderWidth: 2,
    borderColor: RETRO_THEME.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorSelected: {
    borderColor: RETRO_THEME.colors.primary,
    borderWidth: 3,
    shadowColor: RETRO_THEME.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 5,
  },
  checkmark: {
    fontSize: 20,
    color: RETRO_THEME.colors.primary,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: RETRO_THEME.colors.cardBackground,
    borderWidth: 2,
    borderColor: RETRO_THEME.colors.border,
  },
  optionSelected: {
    borderColor: RETRO_THEME.colors.primary,
    backgroundColor: RETRO_THEME.colors.background,
  },
  optionText: {
    fontFamily: RETRO_THEME.fonts.mono,
    fontSize: 9,
    color: RETRO_THEME.colors.textDark,
  },
  optionTextSelected: {
    color: RETRO_THEME.colors.primary,
  },
});
