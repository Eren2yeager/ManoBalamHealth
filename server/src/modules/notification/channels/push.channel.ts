// TODO: Implement push notifications (Firebase Cloud Messaging, OneSignal, etc.)
export const sendPushNotification = async (
  userId: string,
  title: string,
  body: string,
  data?: Record<string, any>
) => {
  console.log("Push notification stub called:", { userId, title, body, data });
  // Implement actual push notification logic here
};
