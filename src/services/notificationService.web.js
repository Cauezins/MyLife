import { Habit } from '../types';

export const notificationService = {
  async requestPermission() {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  },

  async createChannel() {
    return Promise.resolve();
  },

  async scheduleHabitNotification(habit) {
    if (!habit.notificationEnabled) return;

    try {
      const scheduled = JSON.parse(localStorage.getItem('scheduled_notifications') || '[]');
      
      const notification = {
        id: habit.id,
        name: habit.name,
        description: habit.description,
        time: habit.time,
      };
      
      const existing = scheduled.findIndex((n) => n.id === habit.id);
      if (existing >= 0) {
        scheduled[existing] = notification;
      } else {
        scheduled.push(notification);
      }
      
      localStorage.setItem('scheduled_notifications', JSON.stringify(scheduled));
      
      this.checkScheduledNotifications();
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  },

  async cancelHabitNotification(habitId) {
    try {
      const scheduled = JSON.parse(localStorage.getItem('scheduled_notifications') || '[]');
      const filtered = scheduled.filter((n) => n.id !== habitId);
      localStorage.setItem('scheduled_notifications', JSON.stringify(filtered));
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  },

  async cancelAllNotifications() {
    try {
      localStorage.removeItem('scheduled_notifications');
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  },

  async displayImmediateNotification(title, body) {
    if (!('Notification' in window)) return;
    
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
        });
      } catch (error) {
        console.error('Error displaying notification:', error);
      }
    }
  },

  checkScheduledNotifications() {
    const scheduled = JSON.parse(localStorage.getItem('scheduled_notifications') || '[]');
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    scheduled.forEach((notification) => {
      if (notification.time === currentTime) {
        this.displayImmediateNotification(
          `⏰ ${notification.name}`,
          notification.description
        );
      }
    });
  },
};

if (typeof window !== 'undefined') {
  setInterval(() => {
    notificationService.checkScheduledNotifications();
  }, 60000);
}
