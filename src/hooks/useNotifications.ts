import { useEffect, useRef } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { useAuth } from '../context/AuthContext';
import { db } from '../store/MockDatabase';

export function useNotifications() {
  const { user } = useAuth();
  const notifiedIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;

    const setupPushNotifications = async () => {
      if (Capacitor.getPlatform() === 'web') return;

      try {
        const result = await PushNotifications.requestPermissions();
        if (result.receive === 'granted') {
          await PushNotifications.register();
        }

        // Handle successful registration
        PushNotifications.addListener('registration', (token) => {
          console.log('Push registration success, token: ' + token.value);
          db.savePushToken(user.id, token.value);
        });

        // Handle errors
        PushNotifications.addListener('registrationError', (error) => {
          console.error('Error on registration: ' + JSON.stringify(error));
        });

        // Handle notification received in foreground
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('Push received: ', notification);
          // If app is open, maybe show an in-app alert or rely on LocalNotifications
        });

      } catch (e) {
        console.error("Push notification setup failed:", e);
      }
    };

    setupPushNotifications();

    // -------------------------------------------------------------
    // Local Polling Fallback (For Web / local testing without a backend server)
    // -------------------------------------------------------------
    const setupLocalNotifications = async () => {
      try {
        const result = await LocalNotifications.requestPermissions();
        if (result.display === 'granted') {
          console.log('Local notification permissions granted.');
        }
      } catch (e) {
        console.error('Failed to request local notification permissions', e);
      }
    };
    setupLocalNotifications();

    const checkNotifications = async () => {
      try {
        const notifications = await db.getNotificationsForUser(user.id, user.role);
        
        notifications.forEach((notif) => {
          const isRead = notif.read_by && notif.read_by.includes(user.id);
          
          if (!isRead && !notifiedIds.current.has(notif.id)) {
            // Trigger local push notification
            LocalNotifications.schedule({
              notifications: [
                {
                  title: notif.title,
                  body: notif.body,
                  id: Math.floor(Math.random() * 100000), 
                  schedule: { at: new Date(Date.now() + 1000) },
                  largeIcon: "ic_launcher",
                  smallIcon: "ic_launcher",
                  actionTypeId: "",
                  extra: null
                }
              ]
            });

            notifiedIds.current.add(notif.id);
            db.markNotificationAsRead(notif.id, user.id);
          }
        });
      } catch (e) {
        console.error('Failed to poll notifications:', e);
      }
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 10000);

    return () => {
      clearInterval(interval);
      if (Capacitor.getPlatform() !== 'web') {
        try {
          PushNotifications.removeAllListeners();
        } catch (err) {
          console.error("Failed to remove push listeners", err);
        }
      }
    };
  }, [user]);
}
