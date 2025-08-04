import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Search, X, Loader2, FileText, Key, Server, Repeat } from 'lucide-react';
import toast from 'react-hot-toast';

const SearchModal = ({ isOpen, onClose, onResultClick }) => {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState({
        credentials: [],
        documents: [],
        servers: [],
        suscriptions: [],
    });
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const normalizeText = (text) => {
        return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    };

    const search = useCallback(async () => {
        if (!user || searchTerm.trim().length < 3) {
            if(searchTerm.trim().length > 0 && searchTerm.trim().length < 3) {
                setResults({ credentials: [], documents: [], servers: [], suscriptions: [] });
            }
            return;
        }

        setIsLoading(true);
        setHasSearched(true);
        const term = normalizeText(searchTerm);

        try {
            const searchPromises = {
                credentials: getDocs(query(collection(db, "credentials"), where("user_id", "==", user.id))),
                documents: getDocs(query(collection(db, "documents"), where("user_id", "==", user.id))),
                servers: getDocs(query(collection(db, "servers"), where("user_id", "==", user.id))),
                suscriptions: getDocs(query(collection(db, "suscriptions"), where("user_id", "==", user.id))),
            };

            const [credentialsSnap, documentsSnap, serversSnap, suscriptionsSnap] = await Promise.all(Object.values(searchPromises));

            const credentials = credentialsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(cred => normalizeText(cred.service_name).includes(term) || normalizeText(cred.username).includes(term) || (cred.notes && normalizeText(cred.notes).includes(term)));

            const documents = documentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(doc => normalizeText(doc.filename).includes(term) || (doc.notes && normalizeText(doc.notes).includes(term)));

            const servers = serversSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(server => normalizeText(server.name).includes(term) || normalizeText(server.ip_domain).includes(term) || (server.instructions && normalizeText(server.instructions).includes(term)));

            const suscriptions = suscriptionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(sub => normalizeText(sub.service_name).includes(term) || (sub.notes && normalizeText(sub.notes).includes(term)));

            setResults({ credentials, documents, servers, suscriptions });

        } catch (error) {
            console.error("Error during search:", error);
            toast.error("Ocurrió un error al buscar.");
        } finally {
            setIsLoading(false);
        }
    }, [user, searchTerm]);

    useEffect(() => {
        if (!isOpen) {
            setSearchTerm('');
            setResults({ credentials: [], documents: [], servers: [], suscriptions: [] });
            setIsLoading(false);
            setHasSearched(false);
        }
    }, [isOpen]);

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if(searchTerm.trim().length >= 3) {
                search();
            }
        }, 500); // 500ms debounce

        if (searchTerm.trim().length < 3) {
            setResults({ credentials: [], documents: [], servers: [], suscriptions: [] });
            setHasSearched(false);
        }

        return () => clearTimeout(debounceTimer);
    }, [searchTerm, search]);


    if (!isOpen) return null;

    const handleResultClick = (item, type) => {
        onResultClick(item, type);
        onClose();
    };

    const renderResultSection = (title, items, icon, type) => {
        if (items.length === 0) return null;

        return (
            <div className="mb-6">
                <div className="flex items-center mb-3">
                    {icon}
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 ml-2">{title}</h3>
                </div>
                <ul className="space-y-2">
                    {items.map(item => (
                        <li key={item.id} onClick={() => handleResultClick(item, type)} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer">
                            <p className="font-medium text-gray-900 dark:text-white">{item.service_name || item.filename || item.name}</p>
                            {item.username && <p className="text-sm text-gray-500 dark:text-gray-400">{item.username}</p>}
                            {item.ip_domain && <p className="text-sm text-gray-500 dark:text-gray-400">{item.ip_domain}</p>}
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    const totalResults = results.credentials.length + results.documents.length + results.servers.length + results.suscriptions.length;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-start pt-16 sm:pt-24" style={{ backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)' }}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl transform transition-all relative">
                <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center">
                    <Search className="h-5 w-5 text-gray-400 mr-3" />
                    <input
                        type="text"
                        placeholder="Busca en tus credenciales, documentos, servidores..."
                        className="w-full bg-transparent focus:outline-none text-lg text-gray-900 dark:text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ml-3">
                        <X className="h-6 w-6 text-gray-500" />
                    </button>
                </div>
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {isLoading && (
                        <div className="flex justify-center items-center py-10">
                            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                            <p className="ml-3 text-gray-500 dark:text-gray-400">Buscando...</p>
                        </div>
                    )}
                    {!isLoading && hasSearched && totalResults === 0 && (
                         <div className="text-center py-10">
                            <p className="text-lg font-semibold text-gray-800 dark:text-white">No se encontraron resultados</p>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">Intenta con un término de búsqueda diferente.</p>
                        </div>
                    )}
                    {!isLoading && totalResults > 0 && (
                        <>
                            {renderResultSection("Credenciales", results.credentials, <Key className="w-5 h-5 text-yellow-500" />, 'credential')}
                            {renderResultSection("Documentos", results.documents, <FileText className="w-5 h-5 text-blue-500" />, 'document')}
                            {renderResultSection("Servidores", results.servers, <Server className="w-5 h-5 text-green-500" />, 'server')}
                            {renderResultSection("Suscripciones", results.suscriptions, <Repeat className="w-5 h-5 text-indigo-500" />, 'suscription')}
                        </>
                    )}
                     {!isLoading && !hasSearched && (
                        <div className="text-center py-10">
                            <p className="text-lg font-semibold text-gray-800 dark:text-white">Busca en tu baúl digital</p>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">Escribe al menos 3 caracteres para empezar.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchModal;
