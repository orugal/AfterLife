import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 4;

const NotificationsPanel = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        if (!user) {
            setNotifications([]);
            return;
        }

        const q = query(
            collection(db, "notifications_sent"),
            where("user_id", "==", user.id),
            orderBy("sent_at", "desc")
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const notifs = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
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

    const totalPages = Math.ceil(notifications.length / ITEMS_PER_PAGE);
    const paginatedNotifications = notifications.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePrevPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    return (
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Actividad Reciente</h3>
                {totalPages > 1 && (
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className="p-1 rounded-md bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className="p-1 rounded-md bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
            <div className="space-y-2">
                {paginatedNotifications.length > 0 ? (
                    paginatedNotifications.map((notification) => (
                        <div key={notification.id} className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm text-green-700 dark:text-green-300">
                            {formatNotification(notification)}
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No hay actividad reciente.</p>
                )}
            </div>
        </div>
    );
};

export default NotificationsPanel;