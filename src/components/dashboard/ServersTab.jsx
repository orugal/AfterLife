
import { useState, useEffect } from 'react';
import { Server, Plus, X, Loader2, Search, Tag, Trash2, Eye, Edit } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { collection, addDoc, serverTimestamp, doc, setDoc, query, where, orderBy, onSnapshot, deleteDoc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
const ServersTab = () => {
    const { user } = useAuth();

    // Form State
    const [name, setName] = useState('');
    const [ipDomain, setIpDomain] = useState('');
    const [sshPort, setSshPort] = useState('22');
    const [sshUser, setSshUser] = useState('root');
    const [instructions, setInstructions] = useState('');
    const [tags, setTags] = useState([]);
    const [currentTag, setCurrentTag] = useState('');

    // UI State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingServers, setLoadingServers] = useState(true);

    // Data State
    const [servers, setServers] = useState([]);
    const [allTags, setAllTags] = useState([]);

    // Filtering and Pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTag, setSelectedTag] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const serversPerPage = 5;

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedServer, setSelectedServer] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [serverToDelete, setServerToDelete] = useState(null);

    // State for edited fields in the modal
    const [editedName, setEditedName] = useState('');
    const [editedIpDomain, setEditedIpDomain] = useState('');
    const [editedSshPort, setEditedSshPort] = useState('');
    const [editedSshUser, setEditedSshUser] = useState('');
    const [editedInstructions, setEditedInstructions] = useState('');
    const [editedTags, setEditedTags] = useState([]);
    const [editedCurrentTag, setEditedCurrentTag] = useState('');


    const resetForm = () => {
        setName('');
        setIpDomain('');
        setSshPort('22');
        setSshUser('root');
        setInstructions('');
        setTags([]);
        setCurrentTag('');
    };

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter' && currentTag.trim() !== '') {
            e.preventDefault();
            const newTag = currentTag.trim().toLowerCase();
            if (!tags.includes(newTag)) {
                setTags([...tags, newTag]);
            }
            setCurrentTag('');
        }
    };

    const removeTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !ipDomain) {
            toast.error('Por favor, completa el nombre y la IP/Dominio.');
            return;
        }
        if (!user) {
            toast.error('Debes iniciar sesión para añadir un servidor.');
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading('Guardando servidor...');

        try {
            const serverData = {
                user_id: user.id,
                name,
                ip_domain: ipDomain,
                ssh_port: sshPort,
                ssh_user: sshUser,
                instructions,
                tags,
                created_at: serverTimestamp()
            };
            await addDoc(collection(db, 'servers'), serverData);

            const tagsCollectionRef = collection(db, 'tags');
            for (const tag of tags) {
                const tagDocRef = doc(tagsCollectionRef, tag);
                await setDoc(tagDocRef, { name: tag }, { merge: true });
            }

            toast.success('¡Servidor guardado con éxito!', { id: toastId });
            resetForm();

        } catch (error) {
            console.error("Error al guardar el servidor:", error);
            toast.error('Hubo un error al guardar el servidor.', { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Fetch all unique tags for the filter dropdown
    useEffect(() => {
        const tagsRef = collection(db, 'tags');
        const q = query(tagsRef, orderBy('name'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const tagsData = snapshot.docs.map(doc => doc.data().name);
            setAllTags(tagsData);
        });
        return () => unsubscribe();
    }, []);

    // Fetch servers in real-time
    useEffect(() => {
        if (!user) return;

        setLoadingServers(true);
        const serversRef = collection(db, 'servers');
        let q = query(serversRef, where("user_id", "==", user.id), orderBy("created_at", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const userServers = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setServers(userServers);
            setLoadingServers(false);
        }, (error) => {
            console.error("Error fetching servers:", error);
            toast.error("No se pudieron cargar los servidores.");
            setLoadingServers(false);
        });

        return () => unsubscribe();
    }, [user]);

    // Filtering and Pagination Logic
    const filteredServers = servers
        .filter(server => {
            const searchTermMatch = server.name.toLowerCase().includes(searchTerm.toLowerCase());
            const tagMatch = selectedTag ? server.tags?.includes(selectedTag) : true;
            return searchTermMatch && tagMatch;
        });

    const indexOfLastServer = currentPage * serversPerPage;
    const indexOfFirstServer = indexOfLastServer - serversPerPage;
    const currentServers = filteredServers.slice(indexOfFirstServer, indexOfLastServer);
    const totalPages = Math.ceil(filteredServers.length / serversPerPage);

    const paginate = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const handleViewDetails = (server) => {
        setSelectedServer(server);
        setEditedName(server.name);
        setEditedIpDomain(server.ip_domain);
        setEditedSshPort(server.ssh_port);
        setEditedSshUser(server.ssh_user);
        setEditedInstructions(server.instructions || '');
        setEditedTags(server.tags || []);
        setIsModalOpen(true);
        setIsEditMode(false);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedServer(null);
        setIsEditMode(false);
    };

    const handleUpdate = async () => {
        if (!selectedServer) return;

        if (!editedName || !editedIpDomain) {
            toast.error('Por favor, completa el nombre y la IP/Dominio.');
            return;
        }

        const toastId = toast.loading('Actualizando servidor...');
        try {
            const docRef = doc(db, 'servers', selectedServer.id);
            await updateDoc(docRef, {
                name: editedName,
                ip_domain: editedIpDomain,
                ssh_port: editedSshPort,
                ssh_user: editedSshUser,
                instructions: editedInstructions,
                tags: editedTags
            });

            const tagsCollectionRef = collection(db, 'tags');
            for (const tag of editedTags) {
                const tagDocRef = doc(tagsCollectionRef, tag);
                await setDoc(tagDocRef, { name: tag }, { merge: true });
            }

            toast.success('Servidor actualizado.', { id: toastId });
            setIsEditMode(false);
        } catch (error) {
            console.error("Error al actualizar el servidor: ", error);
            toast.error('No se pudo actualizar el servidor.', { id: toastId });
        }
    };

    const handleEditedTagKeyDown = (e) => {
        if (e.key === 'Enter' && editedCurrentTag.trim() !== '') {
            e.preventDefault();
            const newTag = editedCurrentTag.trim().toLowerCase();
            if (!editedTags.includes(newTag)) {
                setEditedTags([...editedTags, newTag]);
            }
            setEditedCurrentTag('');
        }
    };

    const removeEditedTag = (tagToRemove) => {
        setEditedTags(editedTags.filter(tag => tag !== tagToRemove));
    };

    const handleDelete = (server) => {
        setServerToDelete(server);
        setIsConfirmModalOpen(true);
        if (isModalOpen) {
            setIsModalOpen(false);
        }
    };

    const executeDelete = async () => {
        if (!serverToDelete) return;

        const toastId = toast.loading('Eliminando servidor...');
        try {
            await deleteDoc(doc(db, 'servers', serverToDelete.id));
            toast.success('Servidor eliminado con éxito.', { id: toastId });
        } catch (error) {
            console.error("Error al eliminar el servidor: ", error);
            toast.error('No se pudo eliminar el servidor.', { id: toastId });
        } finally {
            setIsConfirmModalOpen(false);
            setServerToDelete(null);
        }
    };

    return (
        <>
            <div className="space-y-8">
                <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                        <Plus className="w-6 h-6 mr-2 text-blue-500" /> Añadir Nuevo Servidor
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre del Servidor</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="ej. Servidor Principal, VPS-01"
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">IP/Dominio</label>
                                <input
                                    type="text"
                                    value={ipDomain}
                                    onChange={(e) => setIpDomain(e.target.value)}
                                    placeholder="192.168.1.100"
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Puerto SSH</label>
                                <input
                                    type="text"
                                    value={sshPort}
                                    onChange={(e) => setSshPort(e.target.value)}
                                    placeholder="22"
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Usuario SSH</label>
                                <input
                                    type="text"
                                    value={sshUser}
                                    onChange={(e) => setSshUser(e.target.value)}
                                    placeholder="root"
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Tags
                            </label>
                            <div className="mt-1 flex items-center bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm">
                               <div className="flex flex-wrap gap-2 p-2">
                                    {tags.map((tag, index) => (
                                        <div key={index} className="flex items-center bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-sm font-medium px-2.5 py-1 rounded-full">
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => removeTag(tag)}
                                                className="cursor-pointer ml-1.5 flex-shrink-0 text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 focus:outline-none"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                    <input
                                        type="text"
                                        value={currentTag}
                                        onChange={(e) => setCurrentTag(e.target.value)}
                                        onKeyDown={handleTagKeyDown}
                                        className="flex-grow bg-transparent w-50 focus:outline-none focus:ring-0 border-0 p-1 text-sm text-gray-900 dark:text-white"
                                        placeholder="Añadir tag y presionar Enter"
                                    />
                                </div>
                            </div>
                             <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Escribe un tag y presiona "Enter" para añadirlo.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Instrucciones de acceso</label>
                            <textarea
                                value={instructions}
                                onChange={(e) => setInstructions(e.target.value)}
                                placeholder="Comandos importantes, ubicación de llaves, etc."
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg h-24 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                            ></textarea>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="cursor-pointer inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 dark:disabled:bg-blue-800 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    "Guardar Servidor"
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Mis Servidores
                        </h3>
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre..."
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                    className="dark:text-white pl-10 pr-4 py-2 w-48 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div className="relative">
                                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                 <select
                                    value={selectedTag}
                                    onChange={(e) => { setSelectedTag(e.target.value); setCurrentPage(1); }}
                                    className="dark:text-white pl-10 pr-4 py-2 w-48 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500"
                                 >
                                    <option value="">Todos los tags</option>
                                    {allTags.map(tag => (
                                        <option key={tag} value={tag}>{tag}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {loadingServers ? (
                            <div className="text-center py-8">
                                <Loader2 className="mx-auto h-8 w-8 text-gray-400 animate-spin" />
                                <p className="mt-2 text-sm text-gray-500">Cargando servidores...</p>
                            </div>
                        ) : servers.length === 0 ? (
                             <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                                <Server className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay servidores</h3>
                                <p className="mt-1 text-sm text-gray-500">Empieza añadiendo tu primer servidor.</p>
                            </div>
                        ) : currentServers.length === 0 ? (
                            <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                                <Search className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No se encontraron servidores</h3>
                                <p className="mt-1 text-sm text-gray-500">Prueba con otro término de búsqueda o filtro.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {currentServers.map((server) => (
                                    <div key={server.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                        <div className="flex items-center min-w-0">
                                            <Server className="w-6 h-6 text-blue-500 mr-4 flex-shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{server.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {server.ip_domain}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                                            <button onClick={() => handleViewDetails(server)} className="cursor-pointer p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(server)} className="cursor-pointer p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Anterior
                                </button>
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    Página {currentPage} de {totalPages}
                                </span>
                                <button
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Siguiente
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Server Details Modal */}
            {isModalOpen && selectedServer && (
                <div className="fixed inset-0 bg-black/60 overlay-blur bg-opacity-50 z-50 flex items-center justify-center p-4" style={{
                     backdropFilter: 'blur(2px)',
                    WebkitBackdropFilter: 'blur(2px)'
                    }}>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl transform transition-all">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                             <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {isEditMode ? 'Editar Servidor' : 'Detalles del Servidor'}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                           {isEditMode ? (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre del Servidor</label>
                                    <input type="text" value={editedName} onChange={(e) => setEditedName(e.target.value)} className="w-full p-3 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">IP/Dominio</label>
                                        <input type="text" value={editedIpDomain} onChange={(e) => setEditedIpDomain(e.target.value)} className="w-full p-3 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Puerto SSH</label>
                                        <input type="text" value={editedSshPort} onChange={(e) => setEditedSshPort(e.target.value)} className="w-full p-3 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Usuario SSH</label>
                                        <input type="text" value={editedSshUser} onChange={(e) => setEditedSshUser(e.target.value)} className="w-full p-3 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Tags</h4>
                                    <div className="mt-1 flex items-center bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm">
                                       <div className="flex flex-wrap gap-2 p-2">
                                            {editedTags.map((tag) => (
                                                <div key={tag} className="flex items-center bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-sm font-medium px-2.5 py-1 rounded-full">
                                                    {tag}
                                                    <button type="button" onClick={() => removeEditedTag(tag)} className="ml-1.5 flex-shrink-0 text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 focus:outline-none">
                                                        <X className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                            <input
                                                type="text"
                                                value={editedCurrentTag}
                                                onChange={(e) => setEditedCurrentTag(e.target.value)}
                                                onKeyDown={handleEditedTagKeyDown}
                                                className="flex-grow bg-transparent focus:outline-none focus:ring-0 border-0 p-1 text-sm text-gray-900 dark:text-white"
                                                placeholder="Añadir tag..."
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Instrucciones</h4>
                                    <textarea value={editedInstructions} onChange={(e) => setEditedInstructions(e.target.value)} rows={5} className="p-4 w-full text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
                                </div>
                            </>
                           ) : (
                            <>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Nombre del Servidor</h4>
                                    <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{selectedServer.name}</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">IP/Dominio</h4>
                                        <p className="mt-1 text-gray-700 dark:text-gray-300">{selectedServer.ip_domain}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Puerto SSH</h4>
                                        <p className="mt-1 text-gray-700 dark:text-gray-300">{selectedServer.ssh_port}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Usuario SSH</h4>
                                        <p className="mt-1 text-gray-700 dark:text-gray-300">{selectedServer.ssh_user}</p>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Tags</h4>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {selectedServer.tags?.map(tag => (
                                            <span key={tag} className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-xs font-medium px-2.5 py-1 rounded-full">{tag}</span>
                                        ))}
                                        {selectedServer.tags?.length === 0 && <p className="text-sm text-gray-500">Sin tags.</p>}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Instrucciones</h4>
                                    <p className="mt-1 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedServer.instructions || 'No hay instrucciones.'}</p>
                                </div>
                            </>
                           )}
                        </div>
                         <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 rounded-b-2xl">
                            {isEditMode ? (
                                <>
                                    <button onClick={() => setIsEditMode(false)} className="cursor-pointer px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
                                        Cancelar
                                    </button>
                                    <button onClick={handleUpdate} className="cursor-pointer px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700">
                                        Guardar Cambios
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => setIsEditMode(true)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
                                        Editar
                                    </button>
                                    <button onClick={() => handleDelete(selectedServer)} className="cursor-pointer px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700">
                                        Eliminar
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isConfirmModalOpen && (
                <div className="fixed inset-0 bg-black/60 bg-opacity-70 flex justify-center items-center z-50"style={{
                     backdropFilter: 'blur(2px)',
                    WebkitBackdropFilter: 'blur(2px)'
                    }}>
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md text-center">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">¿Estás seguro?</h3>
                        <p className="text-gray-600 dark:text-gray-300 my-4">
                            Se eliminará el servidor <span className="font-semibold">{serverToDelete?.name}</span>. <br/>Esta acción no se puede deshacer.
                        </p>
                        <div className="flex justify-center space-x-4 mt-6">
                            <button onClick={() => setIsConfirmModalOpen(false)} className="cursor-pointer  px-8 py-2 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500">Cancelar</button>
                            <button onClick={executeDelete} className="cursor-pointer px-8 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700">Sí, eliminar</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
export default ServersTab;