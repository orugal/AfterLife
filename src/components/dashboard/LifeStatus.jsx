import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/config";
import { collection, addDoc, serverTimestamp, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { Heart, Clock } from 'lucide-react';

const LifeStatus = () => {
    const { user } = useAuth();
    const [lastCheck, setLastCheck] = useState(null);
    const [loading, setLoading] = useState(false);
    const [hasCheckedInToday, setHasCheckedInToday] = useState(false);

    useEffect(() => {
        if (!user) {
            return;
        }
        const q = query(
            collection(db, "alive_checks"),
            where("user_id", "==", user.id),
            orderBy("timestamp", "desc"),
            limit(1)
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0];
                const lastCheckTimestamp = doc.data().timestamp;
                setLastCheck(lastCheckTimestamp);

                if (lastCheckTimestamp) {
                    const lastCheckDate = lastCheckTimestamp.toDate();
                    const today = new Date();
                    if (
                        lastCheckDate.getFullYear() === today.getFullYear() &&
                        lastCheckDate.getMonth() === today.getMonth() &&
                        lastCheckDate.getDate() === today.getDate()
                    ) {
                        setHasCheckedInToday(true);
                    } else {
                        setHasCheckedInToday(false);
                    }
                } else {
                    setHasCheckedInToday(false);
                }
            } else {
                setLastCheck(null);
                setHasCheckedInToday(false);
            }
        });

        return () => unsubscribe();
    }, [user]);

    const handleAliveCheck = async () => {
        if (!user || loading) return;

        setLoading(true);
        try {
            // Add to alive_checks collection
            await addDoc(collection(db, "alive_checks"), {
                user_id: user.id,
                timestamp: serverTimestamp(),
            });

            // Add to notifications_sent collection
            await addDoc(collection(db, "notifications_sent"), {
                user_id: user.id,
                sent_at: serverTimestamp(),
                type: 'alive_check',
                status: 'sent'
            });

        } catch (error) {
            console.error("Error performing alive check: ", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Heart className="w-6 h-6 text-red-500 mr-2" />
                Estado de Vida
            </h2>

            <div className="text-center">
                <button
                    onClick={handleAliveCheck}
                    disabled={loading}
                    className={`w-full bg-gradient-to-r ${
                        hasCheckedInToday
                            ? 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                            : 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                    } text-white font-bold py-4 px-6 rounded-xl transform hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    <Heart className="w-8 h-8 mx-auto mb-2" />
                    {loading ? "Registrando..." : (hasCheckedInToday ? "¡Estoy Vivo!" : "¿Estás vivo?")}
                </button>

                {lastCheck && (
                    <div className="mt-4 p-4 bg-green-50 rounded-xl">
                        <p className="text-sm text-green-700">
                            <Clock className="w-4 h-4 inline mr-1" />
                            Último check-in: {lastCheck.toDate().toLocaleString()}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default LifeStatus;