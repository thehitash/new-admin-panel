import { useEffect, useState } from "react";
import { messaging } from "../firebase"; // Your Firebase config file
import { getToken, onMessage } from "firebase/messaging";

export const useFCM = (userId?: number, role: string = "customer") => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ title: string; body: string } | null>(null);

  // Request Notification Permission + Get Token
  useEffect(() => {
    const requestPermission = async () => {
      try {
        const permission = await Notification.requestPermission();

        if (permission === "granted") {
          const token = await getToken(messaging, {
            vapidKey: "YOUR_VAPID_KEY", // Firebase Console → Project Settings → Cloud Messaging → Web Push Certificates
          });

          if (token) {
            setFcmToken(token);

            // Send token to backend
            await fetch("http://localhost:3000/api/save-token", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                user_id: userId,
                role,
                token,
              }),
            });
          }
        } else {
          console.warn("❌ Notification permission denied");
        }
      } catch (error) {
        console.error("🔥 Error fetching FCM token:", error);
      }
    };

    requestPermission();
  }, [userId, role]);

  // Listen for foreground notifications
  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("📩 FCM Foreground Notification:", payload);

      const title = payload.notification?.title || "New Notification";
      const body = payload.notification?.body || "";

      setNotification({ title, body });
    });

    return () => unsubscribe();
  }, []);

  return { fcmToken, notification };
};
