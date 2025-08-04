import { messaging } from "./config";
import { getToken } from "firebase/messaging";

const VAPID_KEY = import.meta.env.VITE_VAPID_KEY;

export const requestNotificationPermission = async () => {
    try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            console.log("Notification permission granted.");
            return true;
        } else {
            console.log("Unable to get permission to notify.");
            return false;
        }
    } catch (error) {
        console.error("An error occurred while requesting notification permission", error);
        return false;
    }
};

export const getFCMToken = async () => {
    try {
        const token = await getToken(messaging, { vapidKey: VAPID_KEY });
        if (token) {
            console.log("FCM Token:", token);
            return token;
        } else {
            console.log("No registration token available. Request permission to generate one.");
            return null;
        }
    } catch (error) {
        console.error("An error occurred while retrieving token. ", error);
        return null;
    }
};
