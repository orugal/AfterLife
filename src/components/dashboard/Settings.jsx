
import { Heart, Clock, FileText, Key, Server, Bell, LogOut, Sun, Moon } from 'lucide-react';
const Settings = () => {
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
                    <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        <option value="5">5 días</option>
                        <option value="10">10 días</option>
                        <option value="15">15 días</option>
                        <option value="30">30 días</option>
                    </select>
                    </div>
                    
                    <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email de emergencia:
                    </label>
                    <input 
                        type="email" 
                        placeholder="contacto@emergencia.com"
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    </div>
                    
                    <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Guardar Configuración
                    </button>
                </div>
            </div>
        </>
    )
}
export default Settings;