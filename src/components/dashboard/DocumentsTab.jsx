import { useState, useEffect } from 'react';
import { FileText, Upload, X, File, Loader2, Search, Tag, Trash2, Edit, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db, storage } from '../../firebase/config';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, serverTimestamp, doc, setDoc, query, where, orderBy, onSnapshot, deleteDoc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

const DocumentsTab = () => {
    const { user } = useAuth();
    const [file, setFile] = useState(null);
    const [tags, setTags] = useState([]);
    const [notes, setNotes] = useState('');
    const [currentTag, setCurrentTag] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [documents, setDocuments] = useState([]);
    const [loadingDocs, setLoadingDocs] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTag, setSelectedTag] = useState('');
    const [allTags, setAllTags] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const docsPerPage = 6;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editedNotes, setEditedNotes] = useState('');
    const [editedTags, setEditedTags] = useState([]);
    const [editedCurrentTag, setEditedCurrentTag] = useState('');
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [docToDelete, setDocToDelete] = useState(null);

    const handleViewDetails = (doc) => {
        setSelectedDoc(doc);
        setEditedNotes(doc.notes || '');
        setEditedTags(doc.tags || []);
        setIsModalOpen(true);
        setIsEditMode(false); // Ensure it opens in view mode
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedDoc(null);
        setIsEditMode(false);
    }

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

    // Fetch documents in real-time
    useEffect(() => {
        if (!user) return;

        setLoadingDocs(true);
        const documentsRef = collection(db, 'documents');
        let q = query(documentsRef, where("user_id", "==", user.id), orderBy("created_at", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const userDocuments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setDocuments(userDocuments);
            setLoadingDocs(false);
        }, (error) => {
            console.error("Error fetching documents:", error);
            toast.error("No se pudieron cargar los documentos.");
            setLoadingDocs(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [user]);

    // Filtering and Pagination Logic
    const filteredDocuments = documents
        .filter(doc => {
            const searchTermMatch = doc.filename.toLowerCase().includes(searchTerm.toLowerCase());
            const tagMatch = selectedTag ? doc.tags?.includes(selectedTag) : true;
            return searchTermMatch && tagMatch;
        });

    const indexOfLastDoc = currentPage * docsPerPage;
    const indexOfFirstDoc = indexOfLastDoc - docsPerPage;
    const currentDocuments = filteredDocuments.slice(indexOfFirstDoc, indexOfLastDoc);
    const totalPages = Math.ceil(filteredDocuments.length / docsPerPage);

    const paginate = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const handleUpdate = async () => {
        if (!selectedDoc) return;

        const toastId = toast.loading('Actualizando documento...');
        try {
            const docRef = doc(db, 'documents', selectedDoc.id);
            await updateDoc(docRef, {
                notes: editedNotes,
                tags: editedTags
            });

            // Also update the global tags collection
            const tagsCollectionRef = collection(db, 'tags');
            for (const tag of editedTags) {
                const tagDocRef = doc(tagsCollectionRef, tag);
                await setDoc(tagDocRef, { name: tag }, { merge: true });
            }

            toast.success('Documento actualizado.', { id: toastId });
            setIsEditMode(false);
        } catch (error) {
            console.error("Error al actualizar el documento: ", error);
            toast.error('No se pudo actualizar el documento.', { id: toastId });
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
        // If the main modal is open, close it to avoid overlap
        if (isModalOpen) {
            setIsModalOpen(false);
        }
    };

    const executeDelete = async () => {
        if (!docToDelete) return;

        const toastId = toast.loading('Eliminando documento...');
        try {
            // Delete file from Storage
            // This logic to extract path from URL is brittle. A better approach
            // would be to store the storage path in Firestore alongside the download URL.
            const url = new URL(docToDelete.file_path);
            const path = decodeURIComponent(url.pathname.split('/o/')[1]);
            const fileRef = ref(storage, path);
            await deleteObject(fileRef);

            // Delete document from Firestore
            await deleteDoc(doc(db, 'documents', docToDelete.id));

            toast.success('Documento eliminado con éxito.', { id: toastId });
        } catch (error) {
            console.error("Error al eliminar el documento: ", error);
            toast.error('No se pudo eliminar el documento.', { id: toastId });
        } finally {
            setIsConfirmModalOpen(false);
            setDocToDelete(null);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
            toast.error('El archivo no puede pesar más de 10MB.');
            setFile(null);
            e.target.value = null; // Reset file input
        } else {
            setFile(selectedFile);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.size > 10 * 1024 * 1024) { // 10MB limit
            toast.error('El archivo no puede pesar más de 10MB.');
        } else {
            setFile(droppedFile);
        }
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

    const resetForm = () => {
        setFile(null);
        setTags([]);
        setNotes('');
        setCurrentTag('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            toast.error('Por favor, selecciona un archivo para subir.');
            return;
        }
        if (!user) {
            toast.error('Debes iniciar sesión para subir documentos.');
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading('Subiendo documento...');

        try {
            // 1. Upload file to Firebase Storage
            const uniqueFileName = `${Date.now()}-${file.name}`;
            const storageRef = ref(storage, `documents/${user.id}/${uniqueFileName}`);
            const uploadTask = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(uploadTask.ref);

            // 2. Save document metadata to Firestore
            const docData = {
                user_id: user.id,
                filename: file.name,
                file_path: downloadURL,
                category: 'general', // Default category, can be expanded later
                tags: tags,
                notes: notes,
                created_at: serverTimestamp()
            };
            await addDoc(collection(db, 'documents'), docData);

            // 3. (Optional but good practice) Save new tags to a global 'tags' collection
            const tagsCollectionRef = collection(db, 'tags');
            for (const tag of tags) {
                const tagDocRef = doc(tagsCollectionRef, tag);
                // Use setDoc with merge:true to create or update without overwriting
                await setDoc(tagDocRef, { name: tag }, { merge: true });
            }

            toast.success('¡Documento guardado con éxito!', { id: toastId });
            resetForm();

        } catch (error) {
            console.error("Error al guardar el documento:", error);
            toast.error('Hubo un error al guardar el documento.', { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

   return (
    <>
        <div className="space-y-8">
            {/* Formulario de subida */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Añadir Nuevo Documento</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* File Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Archivo
                        </label>
                        <div
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            className="mt-1 flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md cursor-pointer hover:border-blue-400 dark:hover:border-blue-500"
                        >
                           {file ? (
                                <div className="text-center">
                                    <File className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">{file.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{(file.size / 1024).toFixed(2)} KB</p>
                                    <button
                                        type="button"
                                        onClick={() => setFile(null)}
                                        className="mt-2 text-xs text-red-600 dark:text-red-400 hover:underline"
                                    >
                                        Cambiar archivo
                                    </button>
                                </div>
                           ) : (
                            <div className="space-y-1 text-center">
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                        <span>Sube un archivo</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                                    </label>
                                    <p className="pl-1">o arrástralo y suéltalo</p>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    PNG, JPG, GIF, PDF hasta 10MB
                                </p>
                            </div>
                           )}
                        </div>
                    </div>

                    {/* Tags Input */}
                    <div>
                        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                                            className="ml-1.5 flex-shrink-0 text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 focus:outline-none"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ))}
                                <input
                                    type="text"
                                    id="tags"
                                    value={currentTag}
                                    onChange={(e) => setCurrentTag(e.target.value)}
                                    onKeyDown={handleTagKeyDown}
                                    className="flex-grow bg-transparent focus:outline-none focus:ring-0 border-0 p-1 text-sm text-gray-900 dark:text-white"
                                    placeholder="Añadir tag y presionar Enter"
                                />
                            </div>
                        </div>
                         <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Escribe un tag y presiona "Enter" para añadirlo.</p>
                    </div>

                    {/* Additional Notes */}
                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Notas Adicionales
                        </label>
                        <div className="mt-1">
                            <textarea
                                id="notes"
                                name="notes"
                                rows={4}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                placeholder="Cualquier detalle extra sobre el documento..."
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 dark:disabled:bg-blue-800 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                "Guardar Documento"
                            )}
                        </button>
                    </div>
                </form>
            </div>
            
            {/* Documentos Guardados */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Mis Documentos
                    </h3>
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                className="pl-10 pr-4 py-2 w-48 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div className="relative">
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                             <select
                                value={selectedTag}
                                onChange={(e) => { setSelectedTag(e.target.value); setCurrentPage(1); }}
                                className="pl-10 pr-4 py-2 w-48 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500"
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
                    {loadingDocs ? (
                        <div className="text-center py-8">
                            <Loader2 className="mx-auto h-8 w-8 text-gray-400 animate-spin" />
                            <p className="mt-2 text-sm text-gray-500">Cargando documentos...</p>
                        </div>
                    ) : documents.length === 0 ? (
                         <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                            <FileText className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay documentos</h3>
                            <p className="mt-1 text-sm text-gray-500">Empieza subiendo tu primer documento.</p>
                        </div>
                    ) : currentDocuments.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                            <Search className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No se encontraron documentos</h3>
                            <p className="mt-1 text-sm text-gray-500">Prueba con otro término de búsqueda o filtro.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {currentDocuments.map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                    <a href={doc.file_path} target="_blank" rel="noopener noreferrer" className="flex items-center min-w-0">
                                        <FileText className="w-6 h-6 text-blue-500 mr-4 flex-shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{doc.filename}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Subido {new Date(doc.created_at?.toDate()).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </a>
                                    <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                                        <button onClick={() => handleViewDetails(doc)} className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(doc)} className="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
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

            {/* Document Details Modal */}
            {isModalOpen && selectedDoc && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl transform transition-all">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                             <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {isEditMode ? 'Editar Documento' : 'Detalles del Documento'}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                           <div>
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Nombre del archivo</h4>
                                <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{selectedDoc.filename}</p>
                           </div>
                           <div>
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Notas</h4>
                               {isEditMode ? (
                                    <textarea
                                        value={editedNotes}
                                        onChange={(e) => setEditedNotes(e.target.value)}
                                        rows={4}
                                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                    />
                               ) : (
                                   <p className="mt-1 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedDoc.notes || 'No hay notas adicionales.'}</p>
                               )}
                           </div>
                           <div>
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Tags</h4>
                               {isEditMode ? (
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
                               ) : (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {selectedDoc.tags?.map(tag => (
                                        <span key={tag} className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-xs font-medium px-2.5 py-1 rounded-full">{tag}</span>
                                    ))}
                                    {selectedDoc.tags?.length === 0 && <p className="text-sm text-gray-500">Sin tags.</p>}
                                </div>
                               )}
                           </div>
                           <div>
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Enlace</h4>
                                <a href={selectedDoc.file_path} target="_blank" rel="noopener noreferrer" className="mt-1 text-blue-600 dark:text-blue-400 hover:underline break-all">
                                    {selectedDoc.file_path}
                                </a>
                           </div>
                        </div>
                         <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 rounded-b-2xl">
                            {isEditMode ? (
                                <>
                                    <button onClick={() => setIsEditMode(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
                                        Cancelar
                                    </button>
                                    <button onClick={handleUpdate} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700">
                                        Guardar Cambios
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => setIsEditMode(true)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
                                        Editar
                                    </button>
                                    <button onClick={() => handleDelete(selectedDoc)} className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700">
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
                <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md text-center">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">¿Estás seguro?</h3>
                        <p className="text-gray-600 dark:text-gray-300 my-4">
                            Se eliminará el documento <span className="font-semibold">{docToDelete?.filename}</span>. <br/>Esta acción no se puede deshacer.
                        </p>
                        <div className="flex justify-center space-x-4 mt-6">
                            <button onClick={() => setIsConfirmModalOpen(false)} className="px-8 py-2 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500">Cancelar</button>
                            <button onClick={executeDelete} className="px-8 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700">Sí, eliminar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </>
   )
}
export default DocumentsTab;