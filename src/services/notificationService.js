import notifee, { AndroidImportance, TriggerType, RepeatFrequency, TimestampTrigger } from '@notifee/react-native';
import { Habit } from '../types';

export const notificationService = {
  async requestPermission() {
    try {
      const settings = await notifee.requestPermission();
      return settings.authorizationStatus >= 1;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  },

  async createChannel() {
    try {
      await notifee.createChannel({
        id: 'habits',
        name: 'Lembretes de Hábitos',
        importance: AndroidImportance.HIGH,
        sound: 'default',
      });
    } catch (error) {
      console.error('Error creating notification channel:', error);
    }
  },

  async scheduleHabitNotification(habit) {
    if (!habit.notificationEnabled) return;

    try {
      // Cancelar todas anteriores deste hábito
      await notifee.cancelNotification(habit.id);
      // Cancelar notificações de intervalo antigas
      for (let i = 0; i < 100; i++) {
        await notifee.cancelNotification(`${habit.id}-${i}`);
      }
      
      // Para notificações de intervalo
      if (habit.recurrenceType === 'interval' && habit.intervalMinutes) {
        const intervalMinutes = habit.intervalMinutes;
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        
        // Calcular próxima notificação
        let nextNotificationMinutes = Math.ceil(currentMinutes / intervalMinutes) * intervalMinutes;
        
        // Criar notificação para o próximo intervalo
        const nextTime = new Date();
        nextTime.setHours(0, nextNotificationMinutes, 0, 0);
        
        // Se já passou, agendar para amanhã
        if (nextTime <= now) {
          nextTime.setDate(nextTime.getDate() + 1);
        }
        
        // Criar notificação com repetição
        const trigger = {
          type: TriggerType.TIMESTAMP,
          timestamp: nextTime.getTime(),
        };
        
        await notifee.createTriggerNotification(
          {
            id: habit.id,
            title: `⏰ ${habit.name}`,
            body: habit.description || `⟳ Lembrete a cada ${intervalMinutes} minuto(s)`,
            android: {
              channelId: 'habits',
              importance: AndroidImportance.HIGH,
              pressAction: {
                id: 'default',
              },
            },
          },
          trigger
        );
        
        // Agendar próximas notificações do dia
        const minutesInDay = 24 * 60;
        for (let offset = intervalMinutes; offset < minutesInDay; offset += intervalMinutes) {
          const futureTime = new Date(nextTime);
          futureTime.setMinutes(futureTime.getMinutes() + offset);
          
          // Não agendar se for para hoje e já passou
          if (futureTime > new Date()) {
            const futureTrigger = {
              type: TriggerType.TIMESTAMP,
              timestamp: futureTime.getTime(),
            };
            
            await notifee.createTriggerNotification(
              {
                id: `${habit.id}-${offset}`,
                title: `⏰ ${habit.name}`,
                body: habit.description || `⟳ Lembrete a cada ${intervalMinutes} minuto(s)`,
                android: {
                  channelId: 'habits',
                  importance: AndroidImportance.HIGH,
                  pressAction: {
                    id: 'default',
                  },
                },
              },
              futureTrigger
            );
          }
        }
        
        return;
      }

      // Para notificações diárias normais
      const [hours, minutes] = habit.time.split(':').map(Number);
      const now = new Date();
      const scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);

      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      const trigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: scheduledTime.getTime(),
        repeatFrequency: RepeatFrequency.DAILY,
      };

      await notifee.createTriggerNotification(
        {
          id: habit.id,
          title: `⏰ ${habit.name}`,
          body: habit.description || 'Lembrete de tarefa',
          android: {
            channelId: 'habits',
            importance: AndroidImportance.HIGH,
            pressAction: {
              id: 'default',
            },
          },
        },
        trigger
      );
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  },

  async cancelHabitNotification(habitId) {
    try {
      await notifee.cancelNotification(habitId);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  },

  async cancelAllNotifications() {
    try {
      await notifee.cancelAllNotifications();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  },

  async displayImmediateNotification(title, body) {
    try {
      await notifee.displayNotification({
        title,
        body,
        android: {
          channelId: 'habits',
          importance: AndroidImportance.HIGH,
          pressAction: {
            id: 'default',
          },
        },
      });
    } catch (error) {
      console.error('Error displaying notification:', error);
    }
  },

  async displayOngoingNotification(id, title, body) {
    try {
      await notifee.displayNotification({
        id,
        title,
        body,
        android: {
          channelId: 'habits',
          importance: AndroidImportance.HIGH,
          ongoing: true,
          pressAction: {
            id: 'default',
          },
          actions: [
            {
              title: '⏸️ Pausar',
              pressAction: {
                id: 'pause',
              },
            },
            {
              title: '✕ Cancelar',
              pressAction: {
                id: 'cancel',
              },
            },
          ],
        },
      });
    } catch (error) {
      console.error('Error displaying ongoing notification:', error);
    }
  },

  async updateOngoingNotification(id, title, body) {
    try {
      await notifee.displayNotification({
        id,
        title,
        body,
        android: {
          channelId: 'habits',
          importance: AndroidImportance.HIGH,
          ongoing: true,
          pressAction: {
            id: 'default',
          },
        },
      });
    } catch (error) {
      console.error('Error updating ongoing notification:', error);
    }
  },

  async cancelOngoingNotification(id) {
    try {
      await notifee.cancelNotification(id);
    } catch (error) {
      console.error('Error canceling ongoing notification:', error);
    }
  },
};
