
import { Server } from 'lucide-react';
const ServersTab = () => {

    return (
        <>
            <div className="space-y-6">
                <div className="space-y-4">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre del Servidor</label>
                    <input type="text" placeholder="ej. Servidor Principal, VPS-01" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">IP/Dominio</label>
                    <input type="text" placeholder="192.168.1.100 o servidor.midominio.com" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Puerto SSH</label>
                    <input type="text" placeholder="22" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Usuario SSH</label>
                    <input type="text" placeholder="root" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Instrucciones de acceso</label>
                    <textarea placeholder="Comandos importantes, ubicación de llaves, etc." className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg h-24 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"></textarea>
                    </div>
                    <button onClick={(e) => e.preventDefault()} className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors">
                    Guardar Servidor
                    </button>
                </div>
            
                <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Servidores Registrados</h4>
                    <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center">
                        <Server className="w-5 h-5 text-green-500 mr-3" />
                        <div>
                            <span className="text-sm font-medium block text-gray-900 dark:text-white">Servidor Principal</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">192.168.1.100</span>
                        </div>
                        </div>
                        <span className="text-xs text-green-600 font-medium">Activo</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center">
                        <Server className="w-5 h-5 text-blue-500 mr-3" />
                        <div>
                            <span className="text-sm font-medium block text-gray-900 dark:text-white">VPS Backup</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">vps.midominio.com</span>
                        </div>
                        </div>
                        <span className="text-xs text-green-600 font-medium">Activo</span>
                    </div>
                    </div>
                </div>
            </div>
        </>
    )
 
}
export default ServersTab;