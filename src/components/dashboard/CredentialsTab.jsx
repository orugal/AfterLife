
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Key, Eye, EyeOff, Trash2, Tag, Search, PlusCircle, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';

const CredentialsTab = () => {
    const { user } = useAuth();

    // Form state
    const [serviceName, setServiceName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [notes, setNotes] = useState('');
    const [tags, setTags] = useState('');

    // Data state
    const [credentials, setCredentials] = useState([]);
    const [allTags, setAllTags] = useState([]);
    const [loading, setLoading] = useState(true);

    // UI state
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTag, setSelectedTag] = useState('');
    const [filteredCredentials, setFilteredCredentials] = useState([]);
    const [selectedCredential, setSelectedCredential] = useState(null);
    const [editingCredentialId, setEditingCredentialId] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    // WARNING: This is a simple XOR cipher for demonstration purposes only.
    // It is NOT secure. In a production environment, use a strong, well-vetted
    // cryptography library like crypto-js for AES encryption.
    const getEncryptionKey = () => {
        if (!user || !user.id) {
            // This is a fallback and should ideally not be used.
            // A real app should ensure a user is always present for these operations.
            return "default-secret-key-that-is-not-secure";
        }
        // Use a derivative of the user's ID. Still not secure, but better than a fixed key.
        return `secret-${user.id}-key`;
    }

    const encryptPassword = (password) => {
        const key = getEncryptionKey();
        if (!password) return '';
        let encrypted = '';
        for (let i = 0; i < password.length; i++) {
            encrypted += String.fromCharCode(password.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        return btoa(encrypted); // Base64 encode to ensure it's a valid string
    };

    const decryptPassword = (encryptedPassword) => {
        const key = getEncryptionKey();
        if (!encryptedPassword) return '';
        try {
            const encrypted = atob(encryptedPassword); // Base64 decode
            let decrypted = '';
            for (let i = 0; i < encrypted.length; i++) {
                decrypted += String.fromCharCode(encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length));
            }
            return decrypted;
        } catch (error) {
            console.error("Failed to decrypt password:", error);
            return "Decryption failed"; // Or handle error appropriately
        }
    };

    useEffect(() => {
        if (user) {
            fetchCredentials();
            fetchAllTags();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchCredentials = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const q = query(collection(db, "credentials"), where("user_id", "==", user.id), orderBy("service_name"));
            const querySnapshot = await getDocs(q);
            const creds = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCredentials(creds);
        } catch (error) {
            console.error("Error fetching credentials: ", error);
            toast.error("Error al cargar las credenciales.");
        }
        setLoading(false);
    };

    const fetchAllTags = async () => {
        if (!user) return;
        try {
            const q = query(collection(db, "tags"), where("user_id", "==", user.id));
            const querySnapshot = await getDocs(q);
            const userTags = querySnapshot.docs.map(doc => doc.data().tag);
            setAllTags([...new Set(userTags)]); // Store unique tags
        } catch (error) {
            console.error("Error fetching tags: ", error);
        }
    };

    const handleSaveOrUpdate = async () => {
        if (!serviceName || !username || !password) {
            toast.error("Servicio, usuario y contraseña son obligatorios.");
            return;
        }

        try {
            const passwordEncrypted = encryptPassword(password);
            const tagArray = tags.split(',').map(t => t.trim().toLowerCase()).filter(t => t);

            // Handle new tags
            const newTags = tagArray.filter(t => !allTags.includes(t));
            if (newTags.length > 0) {
                for (const tag of newTags) {
                    await addDoc(collection(db, 'tags'), {
                        user_id: user.id,
                        tag: tag,
                    });
                }
                fetchAllTags();
            }

            const credentialData = {
                user_id: user.id,
                service_name: serviceName,
                username: username,
                password_encrypted: passwordEncrypted,
                notes: notes,
                tags: tagArray
            };

            if (editingCredentialId) {
                // Update existing credential
                const credRef = doc(db, "credentials", editingCredentialId);
                await updateDoc(credRef, credentialData);
                toast.success("¡Credencial actualizada con éxito!");
                setEditingCredentialId(null);
            } else {
                // Add new credential
                await addDoc(collection(db, 'credentials'), credentialData);
                toast.success("¡Credencial guardada con éxito!");
            }

            // Clear form and refresh list
            setServiceName('');
            setUsername('');
            setPassword('');
            setNotes('');
            setTags('');
            fetchCredentials();
        } catch (error) {
            console.error("Error saving credential: ", error);
            toast.error("Error al guardar la credencial.");
        }
    };

    useEffect(() => {
        let filtered = [...credentials];

        // Filter by search term
        if (searchTerm) {
            const lowercasedTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(cred =>
                cred.service_name.toLowerCase().includes(lowercasedTerm) ||
                cred.username.toLowerCase().includes(lowercasedTerm) ||
                (cred.notes && cred.notes.toLowerCase().includes(lowercasedTerm))
            );
        }

        // Filter by selected tag
        if (selectedTag) {
            filtered = filtered.filter(cred => cred.tags && cred.tags.includes(selectedTag));
        }

        setFilteredCredentials(filtered);
        setCurrentPage(1); // Reset to first page on filter change
    }, [searchTerm, selectedTag, credentials]);

    const paginatedCredentials = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredCredentials.slice(startIndex, endIndex);
    }, [filteredCredentials, currentPage]);

    const totalPages = Math.ceil(filteredCredentials.length / ITEMS_PER_PAGE);


    const handleView = (cred) => {
        setSelectedCredential(cred);
        setIsViewModalOpen(true);
    };

    const handleDelete = async () => {
        if (!selectedCredential) return;

        try {
            await deleteDoc(doc(db, "credentials", selectedCredential.id));
            toast.success("Credencial eliminada.");
            setIsDeleteModalOpen(false);
            setIsViewModalOpen(false);
            setSelectedCredential(null);
            fetchCredentials();
        } catch (error) {
            console.error("Error deleting credential: ", error);
            toast.error("Error al eliminar la credencial.");
        }
    };

    const handleEdit = () => {
        if (!selectedCredential) return;

        setEditingCredentialId(selectedCredential.id);
        setServiceName(selectedCredential.service_name);
        setUsername(selectedCredential.username);
        setPassword(decryptPassword(selectedCredential.password_encrypted));
        setNotes(selectedCredential.notes || '');
        setTags(selectedCredential.tags ? selectedCredential.tags.join(', ') : '');

        setIsViewModalOpen(false);
        // Scroll to top to see the form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingCredentialId(null);
        setServiceName('');
        setUsername('');
        setPassword('');
        setNotes('');
        setTags('');
    };

    return (
        <>
            <div className="space-y-8">
                {/* Form Section */}
                <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                        {editingCredentialId ? <Pencil className="w-8 h-8 mr-3 text-blue-500" /> : <PlusCircle className="w-8 h-8 mr-3 text-green-500" />}
                        {editingCredentialId ? 'Editando Credencial' : 'Agregar Nueva Credencial'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Servicio/Plataforma</label>
                            <input
                                type="text"
                                value={serviceName}
                                onChange={(e) => setServiceName(e.target.value)}
                                placeholder="ej. AWS, DigitalOcean, cPanel"
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Usuario/Email</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="usuario@ejemplo.com"
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contraseña</label>
                            <input
                                type="text"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Tags <span className="text-xs">(separadas por coma)</span>
                            </label>
                            <input
                                type="text"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                placeholder="empresa, importante, personal"
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notas adicionales</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Información adicional, URLs, etc."
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg h-24 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                            ></textarea>
                        </div>
                    </div>
                    <div className="mt-6 space-y-2">
                        <button
                            onClick={handleSaveOrUpdate}
                            className={`w-full text-white py-3 rounded-lg transition-colors flex items-center justify-center font-semibold ${editingCredentialId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}
                        >
                            {editingCredentialId ? 'Actualizar Credencial' : 'Guardar Credencial'}
                        </button>
                        {editingCredentialId && (
                            <button
                                onClick={cancelEdit}
                                className="w-full bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-white py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors flex items-center justify-center font-semibold"
                            >
                                Cancelar Edición
                            </button>
                        )}
                    </div>
                </div>

                {/* Saved Credentials Section */}
                <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Credenciales Guardadas</h3>

                    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Buscar por servicio, usuario, notas..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                        <div className="relative">
                            <select
                                value={selectedTag}
                                onChange={(e) => setSelectedTag(e.target.value)}
                                className="w-full p-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none focus:ring-2 focus:ring-green-500"
                            >
                                <option value="">Filtrar por tag...</option>
                                {allTags.map(tag => (
                                    <option key={tag} value={tag}>{tag}</option>
                                ))}
                            </select>
                            <Tag className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {loading ? (
                        <p className="text-center text-gray-500 dark:text-gray-400">Cargando credenciales...</p>
                    ) : paginatedCredentials.length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400">No se encontraron credenciales con los filtros actuales.</p>
                    ) : (
                        <>
                            <div className="space-y-3">
                                {paginatedCredentials.map((cred) => (
                                    <div
                                        key={cred.id}
                                        onClick={() => handleView(cred)}
                                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-all"
                                    >
                                        <div className="flex items-center">
                                            <Key className="w-6 h-6 text-yellow-500 mr-4" />
                                            <div>
                                                <span className="text-lg font-semibold text-gray-900 dark:text-white">{cred.service_name}</span>
                                                {cred.tags && cred.tags.length > 0 && (
                                                    <div className="flex items-center mt-1 space-x-2">
                                                        <Tag className="w-4 h-4 text-gray-400" />
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">{cred.tags.join(', ')}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <span className="font-mono text-sm text-gray-500 dark:text-gray-400 tracking-widest">••••••••</span>
                                    </div>
                                ))}
                            </div>
                            {totalPages > 1 && (
                                <div className="mt-6 flex justify-center items-center space-x-4">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 rounded-lg text-white bg-gray-500 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Anterior
                                    </button>
                                    <span className="text-gray-700 dark:text-gray-300">
                                        Página {currentPage} de {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 rounded-lg text-white bg-gray-500 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Siguiente
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* View Credential Modal */}
            {isViewModalOpen && selectedCredential && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-lg relative">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{selectedCredential.service_name}</h3>
                        <div className="space-y-4 text-left">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Usuario/Email</label>
                                <p className="text-lg text-gray-900 dark:text-white">{selectedCredential.username}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Contraseña</label>
                                <div className="flex items-center">
                                    <p className="text-lg text-gray-900 dark:text-white font-mono tracking-wider">
                                        {passwordVisible ? decryptPassword(selectedCredential.password_encrypted) : '••••••••'}
                                    </p>
                                    <button onClick={() => setPasswordVisible(!passwordVisible)} className="ml-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" aria-label={passwordVisible ? "Ocultar contraseña" : "Mostrar contraseña"}>
                                        {passwordVisible ? <EyeOff /> : <Eye />}
                                    </button>
                                </div>
                            </div>
                            {selectedCredential.notes && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Notas Adicionales</label>
                                    <p className="text-lg text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">{selectedCredential.notes}</p>
                                </div>
                            )}
                            {selectedCredential.tags && selectedCredential.tags.length > 0 && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Tags</label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {selectedCredential.tags.map(tag => (
                                            <span key={tag} className="bg-green-100 text-green-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-green-200 dark:text-green-900">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="mt-6 flex justify-end space-x-4">
                            <button onClick={() => { setIsViewModalOpen(false); setPasswordVisible(false); }} className="px-6 py-2 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500">Cerrar</button>
                            <button onClick={handleEdit} className="px-6 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 flex items-center">
                                <Pencil className="w-4 h-4 mr-2" />
                                Editar
                            </button>
                            <button onClick={() => {
                                setIsViewModalOpen(false);
                                setIsDeleteModalOpen(true);
                            }} className="px-6 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 flex items-center">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md text-center">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">¿Estás seguro?</h3>
                        <p className="text-gray-600 dark:text-gray-300 my-4">Esta acción no se puede deshacer. Se eliminará la credencial para siempre.</p>
                        <div className="flex justify-center space-x-4 mt-6">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="px-8 py-2 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500">Cancelar</button>
                            <button onClick={handleDelete} className="px-8 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700">Sí, eliminar</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CredentialsTab;