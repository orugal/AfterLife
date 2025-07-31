import { FileText, Upload} from 'lucide-react';
const DocumentsTab = () => {
   return (
    <>
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
    </>
   )
}
export default DocumentsTab;