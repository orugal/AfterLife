import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Bell } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
    const { user } = useAuth();
    const [notificationDays, setNotificationDays] = useState(15);
    const [emergencyEmails, setEmergencyEmails] = useState([]);
    const [emailInput, setEmailInput] = useState('');
    const isInitialMount = useRef(true);

    useEffect(() => {
        const fetchSettings = async () => {
            if (user) {
                setLoading(true);
                const settingsDocRef = doc(db, 'user_settings', user.id);
                const docSnap = await getDoc(settingsDocRef);

                if (docSnap.exists()) {
                    const settings = docSnap.data();
                    setNotificationDays(settings.notification_days || 15);
                    setEmergencyEmails(settings.emergency_email || []);
                }
                setLoading(false);
            }
        };

        fetchSettings();
    }, [user]);

    const handleEmailInputKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            const newEmail = emailInput.trim();

            if (newEmail) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(newEmail)) {
                    toast.error("Por favor, introduce un email válido.");
                    return;
                }
                if (emergencyEmails.includes(newEmail)) {
                    toast.error("Este email ya ha sido añadido.");
                    return;
                }
                setEmergencyEmails([...emergencyEmails, newEmail]);
                toast.success(`¡Email ${newEmail} añadido!`);
                setEmailInput('');
            }
        }
    };

    const removeEmail = (emailToRemove) => {
        setEmergencyEmails(emergencyEmails.filter(email => email !== emailToRemove));
        toast.success(`Email ${emailToRemove} eliminado.`);
    };

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const handler = setTimeout(() => {
            if (user) {
                handleSaveSettings();
            }
        }, 1500); // 1.5 seconds debounce

        return () => {
            clearTimeout(handler);
        };
    }, [notificationDays, emergencyEmails, user, handleSaveSettings]);

    const handleSaveSettings = async () => {
        if (!user) {
            toast.error("Por favor, inicie sesión para guardar la configuración.");
            return;
        }

        setLoading(true);
        const toastId = toast.loading('Guardando configuración...');
        try {
            const settingsDocRef = doc(db, 'user_settings', user.id);
            await setDoc(settingsDocRef, {
                user_id: user.id,
                notification_days: Number(notificationDays),
                emergency_email: emergencyEmails,
                active: true
            }, { merge: true });

            toast.success("¡Configuración guardada automáticamente!", { id: toastId });

        } catch (error) {
            console.error("Error saving settings: ", error);
            toast.error("Hubo un error al guardar la configuración.", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Bell className="w-5 h-5 text-orange-500 mr-2" />
                    Configuración
                </h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Días sin respuesta antes de notificar:
                        </label>
                        <select
                            value={notificationDays}
                            onChange={(e) => setNotificationDays(e.target.value)}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="5">5 días</option>
                            <option value="10">10 días</option>
                            <option value="15">15 días</option>
                            <option value="30">30 días</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email de emergencia (presiona Enter para agregar):
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {emergencyEmails.map((email, index) => (
                                <div key={index} className="flex items-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full px-3 py-1 text-sm">
                                    {email}
                                    <button onClick={() => removeEmail(email)} className="ml-2 text-blue-500 hover:text-blue-700 dark:hover:text-blue-300">
                                        &times;
                                    </button>
                                </div>
                            ))}
                        </div>
                        <input
                            type="email"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            onKeyDown={handleEmailInputKeyDown}
                            placeholder="contacto@emergencia.com"
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>
                    
                </div>
            </div>
        </>
    )
}
export default Settings;