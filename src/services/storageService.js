import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, HabitLog, Player } from '../types';

const HABITS_KEY = '@mylife_habits';
const LOGS_KEY = '@mylife_logs';
const PLAYER_KEY = '@mylife_player';
const LAST_CHECK_DATE_KEY = '@mylife_last_check_date';

export const storageService = {
  async saveHabits(habits) {
    try {
      await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));
    } catch (error) {
      console.error('Error saving habits:', error);
    }
  },

  async getHabits() {
    try {
      const data = await AsyncStorage.getItem(HABITS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading habits:', error);
      return [];
    }
  },

  async saveLogs(logs) {
    try {
      await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(logs));
    } catch (error) {
      console.error('Error saving logs:', error);
    }
  },

  async getLogs() {
    try {
      const data = await AsyncStorage.getItem(LOGS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading logs:', error);
      return [];
    }
  },

  async savePlayer(player) {
    try {
      await AsyncStorage.setItem(PLAYER_KEY, JSON.stringify(player));
    } catch (error) {
      console.error('Error saving player:', error);
    }
  },

  async getPlayer() {
    try {
      const data = await AsyncStorage.getItem(PLAYER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading player:', error);
      return null;
    }
  },

  async clearAll() {
    try {
      await AsyncStorage.multiRemove([HABITS_KEY, LOGS_KEY, PLAYER_KEY]);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },

  async logHabitCompletion(log) {
    try {
      const logs = await this.getLogs();
      logs.push(log);
      await this.saveLogs(logs);
    } catch (error) {
      console.error('Error logging habit completion:', error);
    }
  },

  async getHabitStats(habitId) {
    try {
      const logs = await this.getLogs();
      const habitLogs = logs.filter(log => log.habitId === habitId);
      
      const totalCompletions = habitLogs.length;
      const totalWater = habitLogs.reduce((sum, log) => sum + (log.waterAmount || 0), 0);
      
      const sleepLogs = habitLogs.filter(log => log.sleepDuration);
      const averageSleep = sleepLogs.length > 0
        ? sleepLogs.reduce((sum, log) => sum + (log.sleepDuration || 0), 0) / sleepLogs.length / 60 
        : 0;
      
      const focusLogs = habitLogs.filter(log => log.timerUsed);
      const totalFocusTime = focusLogs.length * 25; 
      
      return {
        totalCompletions,
        totalWater: totalWater > 0 ? totalWater : undefined,
        averageSleep,
        totalFocusTime: totalFocusTime > 0 ? totalFocusTime : undefined,
      };
    } catch (error) {
      console.error('Error getting habit stats:', error);
      return { totalCompletions: 0 };
    }
  },

  async saveLastCheckDate(date) {
    try {
      await AsyncStorage.setItem(LAST_CHECK_DATE_KEY, date);
    } catch (error) {
      console.error('Error saving last check date:', error);
    }
  },

  async getLastCheckDate() {
    try {
      const date = await AsyncStorage.getItem(LAST_CHECK_DATE_KEY);
      return date;
    } catch (error) {
      console.error('Error loading last check date:', error);
      return null;
    }
  },
};
