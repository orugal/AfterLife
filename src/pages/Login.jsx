import { useState, useEffect } from "react";
import { Heart, Shield } from 'lucide-react';
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const Login = () => {
    const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
    const [colorScheme, setColorScheme] = useState(0);
    const navigate = useNavigate();
    const { user, loginWithGoogle, loginWithGitHub, loading } = useAuth();

    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const colorSchemes = [
        {
            name: "Indigo Dream",
            gradient: "radial-gradient(circle at {x}% {y}%, #4f46e5 0%, #7c3aed 35%, #2563eb 70%, #1e40af 100%)",
            decorative: [
                "linear-gradient(45deg, #ec4899, #8b5cf6)",
                "linear-gradient(135deg, #06b6d4, #3b82f6)",
                "linear-gradient(225deg, #f59e0b, #ef4444)"
            ]
        },
        {
            name: "Sunset Blaze",
            gradient: "radial-gradient(circle at {x}% {y}%, #dc2626 0%, #ea580c 35%, #d97706 70%, #ca8a04 100%)",
            decorative: [
                "linear-gradient(45deg, #f97316, #ef4444)",
                "linear-gradient(135deg, #eab308, #f59e0b)",
                "linear-gradient(225deg, #ec4899, #be185d)"
            ]
        },
        {
            name: "Ocean Depths",
            gradient: "radial-gradient(circle at {x}% {y}%, #0891b2 0%, #0284c7 35%, #0369a1 70%, #075985 100%)",
            decorative: [
                "linear-gradient(45deg, #06b6d4, #0891b2)",
                "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                "linear-gradient(225deg, #8b5cf6, #7c3aed)"
            ]
        },
        {
            name: "Dark Flashlight",
            gradient: "radial-gradient(circle at {x}% {y}%, #fbbf24 0%, #f59e0b 15%, #d97706 25%, #92400e 40%, #451a03 60%, #1c1917 80%, #0c0a09 100%)",
            decorative: [
                "radial-gradient(circle, #fbbf24 0%, #d97706 30%, #92400e 60%, transparent 80%)",
                "radial-gradient(circle, #f59e0b 0%, #b45309 40%, #78350f 70%, transparent 90%)",
                "radial-gradient(circle, #fed7aa 0%, #fdba74 20%, #fb923c 50%, transparent 75%)"
            ]
        },
        {
            name: "Forest Mystique",
            gradient: "radial-gradient(circle at {x}% {y}%, #059669 0%, #047857 35%, #065f46 70%, #064e3b 100%)",
            decorative: [
                "linear-gradient(45deg, #10b981, #059669)",
                "linear-gradient(135deg, #84cc16, #65a30d)",
                "linear-gradient(225deg, #eab308, #ca8a04)"
            ]
        },
        {
            name: "Cosmic Purple",
            gradient: "radial-gradient(circle at {x}% {y}%, #7c3aed 0%, #5b21b6 35%, #4c1d95 70%, #3730a3 100%)",
            decorative: [
                "linear-gradient(45deg, #a855f7, #9333ea)",
                "linear-gradient(135deg, #ec4899, #be185d)",
                "linear-gradient(225deg, #06b6d4, #0891b2)"
            ]
        }
    ];

    useEffect(() => {
        const handleMouseMove = (e) => {
            const x = (e.clientX / window.innerWidth) * 100;
            const y = (e.clientY / window.innerHeight) * 100;
            setMousePosition({ x, y });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleBackgroundClick = (e) => {
        if (e.target === e.currentTarget) {
            setColorScheme((prev) => (prev + 1) % colorSchemes.length);
        }
    };

    const currentScheme = colorSchemes[colorScheme];

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle();
            toast.success("Logged in successfully!");
            navigate('/dashboard');
        } catch (error) {
            toast.error("Failed to log in with Google.");
        }
    }

    const handleGitHubLogin = async () => {
        try {
            await loginWithGitHub();
            toast.success("Logged in successfully!");
            navigate('/dashboard');
        } catch (error) {
            toast.error("Failed to log in with GitHub.");
        }
    }

    if (loading) {
        return <div>Loading...</div>; // Or a spinner component
    }

    return (
        <>
            <div 
                className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden cursor-pointer transition-all duration-700 ease-in-out"
                onClick={handleBackgroundClick}
                style={{
                    background: currentScheme.gradient.replace('{x}', mousePosition.x).replace('{y}', mousePosition.y)
                }}
            >
                {/* Elementos decorativos que siguen el mouse */}
                <div 
                    className="absolute w-96 h-96 rounded-full opacity-20 blur-3xl transition-all duration-700 ease-in-out"
                    style={{
                        background: currentScheme.decorative[0],
                        transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.3}px)`,
                        transition: 'transform 0.3s ease-out, background 0.7s ease-in-out'
                    }}
                />
                <div 
                    className="absolute w-72 h-72 rounded-full opacity-15 blur-2xl transition-all duration-700 ease-in-out"
                    style={{
                        background: currentScheme.decorative[1],
                        transform: `translate(${mousePosition.x * -0.3}px, ${mousePosition.y * -0.4}px)`,
                        transition: 'transform 0.4s ease-out, background 0.7s ease-in-out'
                    }}
                />
                <div 
                    className="absolute w-64 h-64 rounded-full opacity-10 blur-xl transition-all duration-700 ease-in-out"
                    style={{
                        background: currentScheme.decorative[2],
                        transform: `translate(${mousePosition.x * 0.2}px, ${mousePosition.y * -0.2}px)`,
                        transition: 'transform 0.5s ease-out, background 0.7s ease-in-out'
                    }}
                />

                <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10">
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center mb-4">
                            <Heart className="w-12 h-12 text-red-500 mr-2 animate-pulse" />
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                After Life
                            </h1>
                        </div>
                        <p className="text-gray-600 text-lg">
                            Protege tu información digital para el futuro
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-gray-50/80 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                            <Shield className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
                            <h3 className="font-semibold text-center mb-2">Sistema de Supervivencia Digital</h3>
                            <p className="text-sm text-gray-600 text-center">
                                Documenta información crítica y configura notificaciones automáticas
                            </p>
                        </div>

                        <div className="space-y-4">
                            {/* Botón de Google */}
                            <button
                                onClick={handleGoogleLogin}
                                className="cursor-pointer w-full bg-white/90 backdrop-blur-sm border-2 border-gray-300 rounded-xl py-4 px-6 flex items-center justify-center space-x-3 hover:bg-white hover:border-gray-400 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-lg"
                            >
                                <svg className="w-6 h-6" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                <span className="font-medium text-gray-700">Continuar con Google</span>
                            </button>

                            {/* Botón de GitHub */}
                            <button
                                onClick={handleGitHubLogin}
                                className="cursor-pointer w-full bg-gray-900/90 backdrop-blur-sm border-2 border-gray-700 rounded-xl py-4 px-6 flex items-center justify-center space-x-3 hover:bg-gray-800 hover:border-gray-600 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-lg text-white"
                            >
                                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                    <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                                </svg>
                                <span className="font-medium">Continuar con GitHub</span>
                            </button>
                        </div>

                        {/* Separador opcional */}
                        <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm">
                            <div className="flex-1 h-px bg-gray-300"></div>
                            <span>Elige tu método preferido</span>
                            <div className="flex-1 h-px bg-gray-300"></div>
                        </div>
                    </div>
                </div>

                {/* Indicador de esquema de color y posición del mouse */}
                <div className="fixed bottom-4 right-4 space-y-2">
                    <div className="bg-black/30 text-white px-3 py-2 rounded-lg text-sm backdrop-blur-sm">
                        🎨 {currentScheme.name}
                        <div className="text-xs opacity-70">Click en el fondo para cambiar</div>
                    </div>
                    <div className="bg-black/20 text-white px-3 py-1 rounded-lg text-xs backdrop-blur-sm">
                        Mouse: {Math.round(mousePosition.x)}% , {Math.round(mousePosition.y)}%
                    </div>
                </div>
            </div>
        </>
    )   
}

export default Login;