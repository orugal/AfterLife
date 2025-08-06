import { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Send, CornerDownLeft, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs, startAfter, onSnapshot, doc, getDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

const FeedTab = () => {
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [postContent, setPostContent] = useState('');
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [postsPerPage] = useState(10);
    const [usersData, setUsersData] = useState({});
    const [totalPages, setTotalPages] = useState(1);

    const fetchUserData = async (userId) => {
        if (usersData[userId]) return usersData[userId];

        try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                setUsersData(prev => ({ ...prev, [userId]: userData }));
                return userData;
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
        return null;
    };

    const fetchPosts = useCallback(async (page) => {
        setLoading(true);
        try {
            const feedsRef = collection(db, 'feeds');
            const countQuery = query(feedsRef);
            const snapshot = await getDocs(countQuery);
            const totalPosts = snapshot.size;
            setTotalPages(Math.ceil(totalPosts / postsPerPage));

            let q = query(feedsRef, orderBy('date_post', 'desc'), limit(postsPerPage));

            if (page > 1) {
                const startAtIndex = (page - 1) * postsPerPage;
                const prevPageQuery = query(feedsRef, orderBy('date_post', 'desc'), limit(startAtIndex));
                const prevPageSnapshot = await getDocs(prevPageQuery);
                const lastVisible = prevPageSnapshot.docs[prevPageSnapshot.docs.length - 1];
                q = query(feedsRef, orderBy('date_post', 'desc'), startAfter(lastVisible), limit(postsPerPage));
            }

            const documentSnapshots = await getDocs(q);
            const newPosts = await Promise.all(documentSnapshots.docs.map(async (doc) => {
                const post = { id: doc.id, ...doc.data() };
                post.user = await fetchUserData(post.userId);
                return post;
            }));
            setPosts(newPosts);
        } catch (error) {
            toast.error('Error al cargar las publicaciones.');
            console.error('Error fetching posts: ', error);
        }
        setLoading(false);
    }, [postsPerPage, fetchUserData]);

    useEffect(() => {
        fetchPosts(currentPage);
    }, [currentPage, fetchPosts]);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        setPostContent('');
    };

    const formatTimeAgo = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate();
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        let interval = seconds / 31536000;
        if (interval > 1) {
            return `Publicado hace ${Math.floor(interval)} años`;
        }
        interval = seconds / 2592000;
        if (interval > 1) {
            return `Publicado hace ${Math.floor(interval)} meses`;
        }
        interval = seconds / 86400;
        if (interval > 1) {
            return `Publicado hace ${Math.floor(interval)} días`;
        }
        interval = seconds / 3600;
        if (interval > 1) {
            return `Publicado hace ${Math.floor(interval)} horas`;
        }
        interval = seconds / 60;
        if (interval > 1) {
            return `Publicado hace ${Math.floor(interval)} minutos`;
        }
        return `Publicado hace ${Math.floor(seconds)} segundos`;
    };

    const handleCreatePost = async () => {
        if (!postContent.trim()) {
            toast.error('El post no puede estar vacío.');
            return;
        }

        try {
            const newPost = {
                userId: user.uid,
                post: postContent,
                date_post: new Date(),
                category: '',
                tags: [],
                user: {
                    name: user.displayName,
                    avatar: user.photoURL,
                }
            };

            await addDoc(collection(db, 'feeds'), {
                ...newPost,
                date_post: serverTimestamp(),
            });

            setPosts(prevPosts => [newPost, ...prevPosts]);
            toast.success('Publicación creada con éxito!');
            closeModal();
        } catch (error) {
            toast.error('Error al crear la publicación.');
            console.error('Error creating post: ', error);
        }
    };

    return (
        <div className="relative">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Feed</h2>
                <button
                    onClick={openModal}
                    className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition"
                >
                    <Plus size={20} className="mr-2" />
                    Crear Post
                </button>
            </div>

            <div className="space-y-6">
                {posts.map((post) => {
                    const postUser = post.user;
                    return (
                        <div key={post.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md transition hover:shadow-lg">
                            <div className="flex items-start space-x-4">
                                <img src={postUser?.avatar || 'https://i.pravatar.cc/48'} alt={postUser?.name} className="w-12 h-12 rounded-full object-cover" />
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <p className="font-bold text-gray-900 dark:text-white">{postUser?.name || 'Usuario'}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{formatTimeAgo(post.date_post)}</p>
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300 mt-2 whitespace-pre-wrap">{post.post}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {loading && (
                    <div className="flex justify-center py-4">
                        <Loader className="animate-spin text-blue-600" size={32} />
                    </div>
                )}
                {posts.length === 0 && !loading && <p className="text-center text-gray-500 dark:text-gray-400 py-10">No hay publicaciones todavía. ¡Crea la primera!</p>}
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-4 mt-6">
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

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl w-full max-w-2xl transform transition-all">
                        <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Crear nueva publicación</h3>
                        <textarea
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows="8"
                            placeholder="Escribe tu publicación aquí..."
                            value={postContent}
                            onChange={(e) => setPostContent(e.target.value)}
                        />
                        <div className="flex justify-end items-center mt-6 space-x-4">
                            <button
                                onClick={closeModal}
                                className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition"
                            >
                                <CornerDownLeft size={18} className="mr-2" />
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreatePost}
                                className="flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition"
                            >
                                <Send size={18} className="mr-2" />
                                Publicar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeedTab;
