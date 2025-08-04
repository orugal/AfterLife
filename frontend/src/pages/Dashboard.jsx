import { useState, useRef, useEffect } from "react";
import { Heart, FileText, Key, Server, LogOut, Sun, Moon, Repeat } from 'lucide-react';
import ServersTab from "../components/dashboard/ServersTab";
import CredentialsTab from "../components/dashboard/CredentialsTab";
import DocumentsTab from "../components/dashboard/DocumentsTab";
import SuscriptionsTab from "../components/dashboard/SuscriptionsTab";
import { useAuth } from "../context/AuthContext";
import LifeStatus from "../components/dashboard/LifeStatus";
import NotificationsPanel from "../components/dashboard/NotificationsPanel";
import Settings from "../components/dashboard/Settings";
import { useTheme } from "../context/ThemeContext";

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('documents');
    const { isDarkMode, toggleTheme } = useTheme();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef]);

    return (
    <>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                <h1 className="text-1xl font-bold text-gray-800 dark:text-white">After Life</h1>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="text-right">
                        <p className="text-sm font-medium text-gray-800 dark:text-white">{user?.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                    </div>
                    <div className="relative" ref={menuRef}>
                        <img
                            src={user?.avatar}
                            alt="Avatar"
                            className="w-10 h-10 rounded-full cursor-pointer"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        />
                        {isMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-gray-100 dark:bg-gray-600 rounded-md shadow-lg py-1 z-10">
                                <button
                                    onClick={toggleTheme}
                                    className="cursor-pointer w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                                >
                                    {isDarkMode ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                                </button>
                                <button
                                    onClick={logout}
                                    className="cursor-pointer w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Panel de Estado de Vida */}
            <div className="lg:col-span-1">

                <LifeStatus />

                {/* Configuración de Notificaciones */}
                <Settings />

            </div>

            {/* Panel Principal */}
            <div className="lg:col-span-2">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
                
                {/* Tabs */}
                <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-1 mb-6 overflow-x-auto">
                    <button
                    onClick={() => setActiveTab('documents')}
                    className={`cursor-pointer flex-shrink-0 flex items-center justify-center py-2 px-4 rounded-lg transition-all whitespace-nowrap ${
                        activeTab === 'documents' 
                        ? 'bg-white dark:bg-gray-900 shadow-sm text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                    >
                    <FileText className="w-4 h-4 mr-2" />
                    Documentos
                    </button>
                    <button
                    onClick={() => setActiveTab('credentials')}
                    className={`cursor-pointer flex-shrink-0 flex items-center justify-center py-2 px-4 rounded-lg transition-all whitespace-nowrap ${
                        activeTab === 'credentials' 
                        ? 'bg-white dark:bg-gray-900 shadow-sm text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                    >
                    <Key className="w-4 h-4 mr-2" />
                    Credenciales
                    </button>
                    <button
                    onClick={() => setActiveTab('servers')}
                    className={`cursor-pointer flex-shrink-0 flex items-center justify-center py-2 px-4 rounded-lg transition-all whitespace-nowrap ${
                        activeTab === 'servers' 
                        ? 'bg-white dark:bg-gray-900 shadow-sm text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                    >
                    <Server className="w-4 h-4 mr-2" />
                    Servidores
                    </button>
                    <button
                    onClick={() => setActiveTab('suscriptions')}
                    className={`cursor-pointer flex-shrink-0 flex items-center justify-center py-2 px-4 rounded-lg transition-all whitespace-nowrap ${
                        activeTab === 'suscriptions'
                        ? 'bg-white dark:bg-gray-900 shadow-sm text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                    >
                    <Repeat className="w-4 h-4 mr-2" />
                    Renovaciones
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
                {activeTab === 'suscriptions' && (
                    <SuscriptionsTab />
                )}
                </div>
            </div>
            </div>

            {/* Notificaciones */}
            <NotificationsPanel />
        </div>
        </div>
    </>
    )
   
}
  export default Dashboard;