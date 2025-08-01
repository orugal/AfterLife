import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';

const NotificationsPanel = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (!user) {
            console.log("NotificationsPanel: No user found.");
            setNotifications([]);
            return;
        }
        console.log("NotificationsPanel: User found", user);

        const q = query(
            collection(db, "notifications_sent"),
            where("user_id", "==", user.id),
            orderBy("sent_at", "desc"),
            limit(20)
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            console.log("NotificationsPanel: Snapshot received", querySnapshot);
            const notifs = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            console.log("NotificationsPanel: Notifications found", notifs);
            setNotifications(notifs);
        });

        return () => unsubscribe();
    }, [user]);

    const formatNotification = (notification) => {
        const date = notification.sent_at?.toDate().toLocaleString() || '...';
        switch (notification.type) {
            case 'alive_check':
                return `✅ Check-in registrado: ${date}`;
            default:
                return `Notificación desconocida: ${date}`;
        }
    };

    return (
        <div className="mt-8 bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
            <div className="space-y-2">
                {notifications.length > 0 ? (
                    notifications.map((notification) => (
                        <div key={notification.id} className="p-3 bg-green-50 rounded-lg text-sm text-green-700">
                            {formatNotification(notification)}
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-gray-500">No hay actividad reciente.</p>
                )}
            </div>
        </div>
    );
};

export default NotificationsPanel;