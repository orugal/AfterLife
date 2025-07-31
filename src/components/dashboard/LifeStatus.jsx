import { useState } from "react";

import { Heart, Clock} from 'lucide-react';
const LifeStatus = ({setNotifications}) => {
    
    const [lastCheck, setLastCheck] = useState(null);

    const handleAliveCheck = () => {
        const now = new Date().toLocaleString();
        setLastCheck(now);
        setNotifications(prev => [...prev, `✅ Check-in registrado: ${now}`]);
    };

    return (
        <>
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Heart className="w-6 h-6 text-red-500 mr-2" />
                    Estado de Vida
                </h2>
                
                <div className="text-center">
                    <button
                    onClick={handleAliveCheck}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-4 px-6 rounded-xl hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
                    >
                    <Heart className="w-8 h-8 mx-auto mb-2" />
                    ¡Estoy Vivo!
                    </button>
                    
                    {lastCheck && (
                    <div className="mt-4 p-4 bg-green-50 rounded-xl">
                        <p className="text-sm text-green-700">
                        <Clock className="w-4 h-4 inline mr-1" />
                        Último check-in: {lastCheck}
                        </p>
                    </div>
                    )}
                </div>
            </div>
        </>
    )
}
export default LifeStatus;