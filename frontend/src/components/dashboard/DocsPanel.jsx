import { useState, useEffect } from 'react';
import { Book, Plus, X, Loader2, Search, Tag, Trash2, Eye, Edit, FileSpreadsheet } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { exportToExcel } from '../../utils/exportUtils';
import { db } from '../../firebase/config';
import { collection, addDoc, serverTimestamp, doc, setDoc, query, where, orderBy, onSnapshot, deleteDoc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { MDXEditor, headingsPlugin, listsPlugin, quotePlugin, thematicBreakPlugin } from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import ReactMarkdown from 'react-markdown';


const DocsPanel = ({ selectedItem }) => {
    const { user } = useAuth();

    // Form State
    const [title, setTitle] = useState('');
    const [repository, setRepository] = useState('');
    const [text, setText] = useState('');
    const [tags, setTags] = useState([]);
    const [currentTag, setCurrentTag] = useState('');

    // UI State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingDocs, setLoadingDocs] = useState(true);

    // Data State
    const [docs, setDocs] = useState([]);
    const [allTags, setAllTags] = useState([]);

    // Filtering and Pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTag, setSelectedTag] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const docsPerPage = 5;

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [docToDelete, setDocToDelete] = useState(null);

    // State for edited fields in the modal
    const [editedTitle, setEditedTitle] = useState('');
    const [editedRepository, setEditedRepository] = useState('');
    const [editedText, setEditedText] = useState('');
    const [editedTags, setEditedTags] = useState([]);
    const [editedCurrentTag, setEditedCurrentTag] = useState('');


    const resetForm = () => {
        setTitle('');
        setRepository('');
        setText('');
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
        if (!editedTitle || !editedText) {
            toast.error('Por favor, completa el título y el texto.');
            return;
        }
        if (!user) {
            toast.error('Debes iniciar sesión para añadir documentación.');
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading('Guardando documentación...');

        try {
            const docData = {
                user_id: user.id,
                title: editedTitle,
                repository: editedRepository,
                text: editedText,
                tags: editedTags,
                created_at: serverTimestamp()
            };
            await addDoc(collection(db, 'docs'), docData);

            const tagsCollectionRef = collection(db, 'tags');
            for (const tag of editedTags) {
                const tagDocRef = doc(tagsCollectionRef, tag);
                await setDoc(tagDocRef, { name: tag }, { merge: true });
            }

            toast.success('¡Documentación guardada con éxito!', { id: toastId });
            resetForm();
            closeModal();

        } catch (error) {
            console.error("Error al guardar la documentación:", error);
            toast.error('Hubo un error al guardar la documentación.', { id: toastId });
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

    // Fetch docs in real-time
    useEffect(() => {
        if (!user) return;

        setLoadingDocs(true);
        const docsRef = collection(db, 'docs');
        let q = query(docsRef, where("user_id", "==", user.id), orderBy("created_at", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const userDocs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setDocs(userDocs);
            setLoadingDocs(false);
        }, (error) => {
            console.error("Error fetching docs:", error);
            toast.error("No se pudieron cargar las documentaciones.");
            setLoadingDocs(false);
        });

        return () => unsubscribe();
    }, [user]);

    useEffect(() => {
        if (selectedItem) {
            handleViewDetails(selectedItem);
        }
    }, [selectedItem]);

    // Filtering and Pagination Logic
    const filteredDocs = docs
        .filter(doc => {
            const searchTermMatch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
            const tagMatch = selectedTag ? doc.tags?.includes(selectedTag) : true;
            return searchTermMatch && tagMatch;
        });

    const indexOfLastDoc = currentPage * docsPerPage;
    const indexOfFirstDoc = indexOfLastDoc - docsPerPage;
    const currentDocs = filteredDocs.slice(indexOfFirstDoc, indexOfLastDoc);
    const totalPages = Math.ceil(filteredDocs.length / docsPerPage);

    const paginate = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const handleViewDetails = (doc) => {
        setSelectedDoc(doc);
        setEditedTitle(doc.title);
        setEditedRepository(doc.repository);
        setEditedText(doc.text || '');
        setEditedTags(doc.tags || []);
        setIsModalOpen(true);
        setIsEditMode(false);
    };

    const openModal = () => {
        resetForm();
        setIsModalOpen(true);
        setIsEditMode(true);
        setSelectedDoc(null);
        setEditedTitle('');
        setEditedRepository('');
        setEditedText('');
        setEditedTags([]);
    }

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedDoc(null);
        setIsEditMode(false);
    };

    const handleUpdate = async () => {
        if (!selectedDoc) return;

        if (!editedTitle || !editedText) {
            toast.error('Por favor, completa el título y el texto.');
            return;
        }

        const toastId = toast.loading('Actualizando documentación...');
        try {
            const docRef = doc(db, 'docs', selectedDoc.id);
            await updateDoc(docRef, {
                title: editedTitle,
                repository: editedRepository,
                text: editedText,
                tags: editedTags
            });

            const tagsCollectionRef = collection(db, 'tags');
            for (const tag of editedTags) {
                const tagDocRef = doc(tagsCollectionRef, tag);
                await setDoc(tagDocRef, { name: tag }, { merge: true });
            }

            toast.success('Documentación actualizada.', { id: toastId });
            setIsEditMode(false);
            closeModal();
        } catch (error) {
            console.error("Error al actualizar la documentación: ", error);
            toast.error('No se pudo actualizar la documentación.', { id: toastId });
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

    const handleDelete = (doc) => {
        setDocToDelete(doc);
        setIsConfirmModalOpen(true);
        if (isModalOpen) {
            setIsModalOpen(false);
        }
    };

    const executeDelete = async () => {
        if (!docToDelete) return;

        const toastId = toast.loading('Eliminando documentación...');
        try {
            await deleteDoc(doc(db, 'docs', docToDelete.id));
            toast.success('Documentación eliminada con éxito.', { id: toastId });
        } catch (error) {
            console.error("Error al eliminar la documentación: ", error);
            toast.error('No se pudo eliminar la documentación.', { id: toastId });
        } finally {
            setIsConfirmModalOpen(false);
            setDocToDelete(null);
        }
    };

    const handleExport = () => {
        if (filteredDocs.length === 0) {
            toast.error("No hay datos para exportar.");
            return;
        }

        const dataToExport = filteredDocs.map(doc => ({
            'Título': doc.title,
            'Repositorio': doc.repository,
            'Texto': doc.text,
            'Tags': doc.tags ? doc.tags.join(', ') : ''
        }));

        exportToExcel(dataToExport, 'documentaciones');
    };

    return (
        <>
            <div className="space-y-8">
                <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Mis Documentaciones
                        </h3>
                        <div className="flex flex-wrap items-center gap-4">
                            <button
                                onClick={openModal}
                                className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Nueva
                            </button>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar por título..."
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
                            <button
                                onClick={handleExport}
                                disabled={filteredDocs.length === 0}
                                className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                <FileSpreadsheet className="w-5 h-5 mr-2" />
                                Exportar a Excel
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {loadingDocs ? (
                            <div className="text-center py-8">
                                <Loader2 className="mx-auto h-8 w-8 text-gray-400 animate-spin" />
                                <p className="mt-2 text-sm text-gray-500">Cargando documentaciones...</p>
                            </div>
                        ) : docs.length === 0 ? (
                             <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                                <Book className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay documentaciones</h3>
                                <p className="mt-1 text-sm text-gray-500">Empieza añadiendo tu primera documentación.</p>
                            </div>
                        ) : currentDocs.length === 0 ? (
                            <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                                <Search className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No se encontraron documentaciones</h3>
                                <p className="mt-1 text-sm text-gray-500">Prueba con otro término de búsqueda o filtro.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {currentDocs.map((doc) => (
                                    <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                        <div className="flex items-center min-w-0">
                                            <Book className="w-6 h-6 text-blue-500 mr-4 flex-shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{doc.title}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {doc.repository}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                                            <button onClick={() => handleViewDetails(doc)} className="cursor-pointer p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(doc)} className="cursor-pointer p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
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

            {/* Doc Details Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 overlay-blur bg-opacity-50 z-50 flex items-center justify-center p-4" style={{
                     backdropFilter: 'blur(2px)',
                    WebkitBackdropFilter: 'blur(2px)'
                    }}>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl transform transition-all">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                             <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {selectedDoc ? (isEditMode ? 'Editar Documentación' : 'Detalles de la Documentación') : 'Crear Nueva Documentación'}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                           {isEditMode ? (
                            <form onSubmit={selectedDoc ? handleUpdate : handleSubmit}>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Título</label>
                                    <input type="text" value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} className="w-full p-3 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Repositorio</label>
                                    <input type="text" value={editedRepository} onChange={(e) => setEditedRepository(e.target.value)} className="w-full p-3 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Texto</label>
                                    <MDXEditor
                                        markdown={editedText}
                                        onChange={setEditedText}
                                        plugins={[headingsPlugin(), listsPlugin(), quotePlugin(), thematicBreakPlugin()]}
                                        contentEditableClassName="prose dark:prose-invert"
                                    />
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
                            </form>
                           ) : (
                            <>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Título</h4>
                                    <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{selectedDoc.title}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Repositorio</h4>
                                    <p className="mt-1 text-gray-700 dark:text-gray-300">{selectedDoc.repository}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Texto</h4>
                                    <div className="mt-1 text-gray-700 dark:text-gray-300 whitespace-pre-wrap prose dark:prose-invert">
                                        <ReactMarkdown>{selectedDoc.text}</ReactMarkdown>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Tags</h4>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {selectedDoc.tags?.map(tag => (
                                            <span key={tag} className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-xs font-medium px-2.5 py-1 rounded-full">{tag}</span>
                                        ))}
                                        {selectedDoc.tags?.length === 0 && <p className="text-sm text-gray-500">Sin tags.</p>}
                                    </div>
                                </div>
                            </>
                           )}
                        </div>
                         <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 rounded-b-2xl">
                            {isEditMode ? (
                                <>
                                    <button onClick={closeModal} className="cursor-pointer px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
                                        Cancelar
                                    </button>
                                    <button onClick={selectedDoc ? handleUpdate : handleSubmit} className="cursor-pointer px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700">
                                        {isSubmitting ? <Loader2 className="animate-spin" /> : (selectedDoc ? 'Guardar Cambios' : 'Crear Documentación')}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => {
                                        setIsEditMode(true);
                                        setEditedTitle(selectedDoc.title);
                                        setEditedRepository(selectedDoc.repository);
                                        setEditedText(selectedDoc.text);
                                        setEditedTags(selectedDoc.tags);
                                    }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
                                        Editar
                                    </button>
                                    <button onClick={() => handleDelete(selectedDoc)} className="cursor-pointer px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700">
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
                            Se eliminará la documentación <span className="font-semibold">{docToDelete?.title}</span>. <br/>Esta acción no se puede deshacer.
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
export default DocsPanel;
