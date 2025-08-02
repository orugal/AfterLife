import { useEffect } from "react";
import { requestNotificationPermission } from "../firebase/messaging";
import { useAuth } from "../context/AuthContext";

const NotificationManager = () => {
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            requestNotificationPermission();
        }
    }, [user]);

    return null;
};

export default NotificationManager;
