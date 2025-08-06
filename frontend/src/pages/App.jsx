import React, { useState } from 'react';
import { Heart, Shield, Upload, Clock, User, FileText, Key, Server, Bell, Calendar } from 'lucide-react';

const AfterLifeApp = () => {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [user, setUser] = useState(null);
  const [lastCheck, setLastCheck] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('documents');

  // Simular login con Google
  const handleGoogleLogin = () => {
    const mockUser = {
      name: 'Usuario Demo',
      email: 'usuario@demo.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    };
    setUser(mockUser);
    setLastCheck(new Date().toLocaleString());
    setCurrentScreen('dashboard');
  };

  // Simular check-in de vida
  const handleAliveCheck = () => {
    const now = new Date().toLocaleString();
    setLastCheck(now);
    setNotifications([...notifications, `✅ Check-in registrado: ${now}`]);
  };

  // Login Screen
  const LoginScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-12 h-12 text-red-500 mr-2" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              After Life
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Protege tu información digital para el futuro
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 rounded-xl p-6">
            <Shield className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
            <h3 className="font-semibold text-center mb-2">Sistema de Supervivencia Digital</h3>
            <p className="text-sm text-gray-600 text-center">
              Documenta información crítica y configura notificaciones automáticas
            </p>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full bg-white border-2 border-gray-300 rounded-xl py-4 px-6 flex items-center justify-center space-x-3 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 shadow-sm"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-medium text-gray-700">Continuar con Google</span>
          </button>
        </div>
      </div>
    </div>
  );

  // Dashboard Screen
  const DashboardScreen = () => (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Heart className="w-8 h-8 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900">After Life</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <img 
                src={user?.avatar} 
                alt="Avatar" 
                className="w-10 h-10 rounded-full"
              />
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
  );

  // Componente para tab de Documentos
  const DocumentsTab = () => (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Subir Documentos</h3>
        <p className="text-gray-600">Arrastra archivos aquí o haz clic para seleccionar</p>
        <button className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
          Seleccionar Archivos
        </button>
      </div>
      
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Documentos Guardados</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <FileText className="w-5 h-5 text-blue-500 mr-3" />
              <span className="text-sm font-medium">Manual_Servidor_Principal.pdf</span>
            </div>
            <span className="text-xs text-gray-500">Hace 2 días</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <FileText className="w-5 h-5 text-green-500 mr-3" />
              <span className="text-sm font-medium">Instrucciones_Backup.txt</span>
            </div>
            <span className="text-xs text-gray-500">Hace 1 semana</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Componente para tab de Credenciales
  const CredentialsTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Servicio/Plataforma</label>
          <input type="text" placeholder="ej. AWS, DigitalOcean, cPanel" className="w-full p-3 border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Usuario/Email</label>
          <input type="text" placeholder="usuario@ejemplo.com" className="w-full p-3 border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
          <input type="password" placeholder="••••••••" className="w-full p-3 border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Notas adicionales</label>
          <textarea placeholder="Información adicional, URLs, etc." className="w-full p-3 border border-gray-300 rounded-lg h-24"></textarea>
        </div>
        <button onClick={(e) => e.preventDefault()} className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors">
          Guardar Credencial
        </button>
      </div>
      
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Credenciales Guardadas</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Key className="w-5 h-5 text-yellow-500 mr-3" />
              <span className="text-sm font-medium">AWS Console</span>
            </div>
            <span className="text-xs text-gray-500">••••••••</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Key className="w-5 h-5 text-blue-500 mr-3" />
              <span className="text-sm font-medium">Hosting cPanel</span>
            </div>
            <span className="text-xs text-gray-500">••••••••</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Componente para tab de Servidores
  const ServersTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Servidor</label>
          <input type="text" placeholder="ej. Servidor Principal, VPS-01" className="w-full p-3 border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">IP/Dominio</label>
          <input type="text" placeholder="192.168.1.100 o servidor.midominio.com" className="w-full p-3 border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Puerto SSH</label>
          <input type="text" placeholder="22" className="w-full p-3 border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Usuario SSH</label>
          <input type="text" placeholder="root" className="w-full p-3 border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Instrucciones de acceso</label>
          <textarea placeholder="Comandos importantes, ubicación de llaves, etc." className="w-full p-3 border border-gray-300 rounded-lg h-24"></textarea>
        </div>
        <button onClick={(e) => e.preventDefault()} className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors">
          Guardar Servidor
        </button>
      </div>
      
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Servidores Registrados</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Server className="w-5 h-5 text-green-500 mr-3" />
              <div>
                <span className="text-sm font-medium block">Servidor Principal</span>
                <span className="text-xs text-gray-500">192.168.1.100</span>
              </div>
            </div>
            <span className="text-xs text-green-600 font-medium">Activo</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Server className="w-5 h-5 text-blue-500 mr-3" />
              <div>
                <span className="text-sm font-medium block">VPS Backup</span>
                <span className="text-xs text-gray-500">vps.midominio.com</span>
              </div>
            </div>
            <span className="text-xs text-green-600 font-medium">Activo</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {currentScreen === 'login' && <LoginScreen />}
      {currentScreen === 'dashboard' && <DashboardScreen />}
    </div>
  );
};

export default AfterLifeApp;