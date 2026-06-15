import { useEffect, useRef } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { useAuth } from '../context/AuthContext';
import { db } from '../store/MockDatabase';

export function useNotifications() {
  const { user } = useAuth();
  const notifiedIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;

    // Request permissions for Local Notifications
    LocalNotifications.requestPermissions().then(result => {
      if (result.display === 'granted') {
        console.log('Push notification permissions granted.');
      }
    });

    const checkNotifications = async () => {
      try {
        const notifications = await db.getNotificationsForUser(user.id, user.role);
        
        notifications.forEach((notif) => {
          const isRead = notif.read_by && notif.read_by.includes(user.id);
          
          if (!isRead && !notifiedIds.current.has(notif.id)) {
            // Trigger local push notification!
            LocalNotifications.schedule({
              notifications: [
                {
                  title: notif.title,
                  body: notif.body,
                  id: Math.floor(Math.random() * 100000), // Random ID for local display
                  schedule: { at: new Date(Date.now() + 1000) }, // 1 sec from now
                  actionTypeId: "",
                  extra: null
                }
              ]
            });

            // Mark as read in our local memory so we don't spam the user
            notifiedIds.current.add(notif.id);
            
            // Mark as read in the database
            db.markNotificationAsRead(notif.id, user.id);
          }
        });
      } catch (e) {
        console.error('Failed to poll notifications:', e);
      }
    };

    // Check immediately and then every 10 seconds
    checkNotifications();
    const interval = setInterval(checkNotifications, 10000);

    return () => clearInterval(interval);
  }, [user]);
}
