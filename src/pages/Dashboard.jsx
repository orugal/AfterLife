import { useState } from "react";
import { Heart, Clock, FileText, Key, Server, Bell, LogOut } from 'lucide-react';
import ServersTab from "../components/dashboard/ServersTab";
import CredentialsTab from "../components/dashboard/CredentialsTab";
import DocumentsTab from "../components/dashboard/DocumentsTab";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
      const { user, logout } = useAuth();
      const [lastCheck, setLastCheck] = useState(null);
      const [notifications, setNotifications] = useState([]);
      const [activeTab, setActiveTab] = useState('documents');
        const handleAliveCheck = () => {
            const now = new Date().toLocaleString();
            setLastCheck(now);
            setNotifications([...notifications, `✅ Check-in registrado: ${now}`]);
        };

    return (
    <>
    <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gray-900 shadow-sm border-b">
            <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                <Heart className="w-8 h-8 text-red-500" />
                <h1 className="text-2xl font-bold text-white">After Life</h1>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="text-right">
                        <p className="text-sm font-medium text-white">{user?.name}</p>
                        <p className="text-xs text-gray-400">{user?.email}</p>
                    </div>
                    <img
                        src={user?.avatar}
                        alt="Avatar"
                        className="w-10 h-10 rounded-full"
                    />
                    <button onClick={logout} className="text-gray-400 hover:text-white">
                        <LogOut className="w-6 h-6 cursor-pointer" />
                    </button>
                </div>
            </div>
            </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Panel de Estado de Vida */}
            <div className="lg:col-span-1">
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

                {/* Configuración de Notificaciones */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Bell className="w-5 h-5 text-orange-500 mr-2" />
                    Configuración
                </h3>
                
                <div className="space-y-4">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Días sin respuesta antes de notificar:
                    </label>
                    <select className="w-full p-2 border border-gray-300 rounded-lg">
                        <option value="5">5 días</option>
                        <option value="10">10 días</option>
                        <option value="15">15 días</option>
                        <option value="30">30 días</option>
                    </select>
                    </div>
                    
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email de emergencia:
                    </label>
                    <input 
                        type="email" 
                        placeholder="contacto@emergencia.com"
                        className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                    </div>
                    
                    <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Guardar Configuración
                    </button>
                </div>
                </div>
            </div>

            {/* Panel Principal */}
            <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm p-6">
                
                {/* Tabs */}
                <div className="flex space-x-1 bg-gray-100 rounded-xl p-1 mb-6">
                    <button
                    onClick={() => setActiveTab('documents')}
                    className={`flex-1 flex items-center justify-center py-2 px-4 rounded-lg transition-all ${
                        activeTab === 'documents' 
                        ? 'bg-white shadow-sm text-blue-600' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    >
                    <FileText className="w-4 h-4 mr-2" />
                    Documentos
                    </button>
                    <button
                    onClick={() => setActiveTab('credentials')}
                    className={`flex-1 flex items-center justify-center py-2 px-4 rounded-lg transition-all ${
                        activeTab === 'credentials' 
                        ? 'bg-white shadow-sm text-blue-600' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    >
                    <Key className="w-4 h-4 mr-2" />
                    Credenciales
                    </button>
                    <button
                    onClick={() => setActiveTab('servers')}
                    className={`flex-1 flex items-center justify-center py-2 px-4 rounded-lg transition-all ${
                        activeTab === 'servers' 
                        ? 'bg-white shadow-sm text-blue-600' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    >
                    <Server className="w-4 h-4 mr-2" />
                    Servidores
                    </button>
                </div>

                {/* Contenido de Tabs */}
                {activeTab === 'documents' && (
                    <DocumentsTab />
                )}
                {activeTab === 'credentials' && (
                    <CredentialsTab />
                )}
                {activeTab === 'servers' && (
                    <ServersTab />
                )}
                </div>
            </div>
            </div>

            {/* Notificaciones */}
            {notifications.length > 0 && (
            <div className="mt-8 bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
                <div className="space-y-2">
                {notifications.slice(-5).map((notification, index) => (
                    <div key={index} className="p-3 bg-green-50 rounded-lg text-sm text-green-700">
                    {notification}
                    </div>
                ))}
                </div>
            </div>
            )}
        </div>
        </div>
    </>
    )
   
}
  export default Dashboard;