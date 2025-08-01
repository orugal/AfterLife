
import { Key } from 'lucide-react';
const CredentialsTab = () => {
   return (
    <>
        <div className="space-y-6">
            <div className="space-y-4">
                <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Servicio/Plataforma</label>
                <input type="text" placeholder="ej. AWS, DigitalOcean, cPanel" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Usuario/Email</label>
                <input type="text" placeholder="usuario@ejemplo.com" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contraseña</label>
                <input type="password" placeholder="••••••••" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notas adicionales</label>
                <textarea placeholder="Información adicional, URLs, etc." className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg h-24 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"></textarea>
                </div>
                <button onClick={(e) => e.preventDefault()} className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors">
                Guardar Credencial
                </button>
            </div>
            
            <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Credenciales Guardadas</h4>
                <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center">
                    <Key className="w-5 h-5 text-yellow-500 mr-3" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">AWS Console</span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">••••••••</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center">
                    <Key className="w-5 h-5 text-blue-500 mr-3" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Hosting cPanel</span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">••••••••</span>
                </div>
                </div>
            </div>
        </div>
    </>
   )
}
export default CredentialsTab;