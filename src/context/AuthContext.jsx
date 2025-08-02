import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import {
    GoogleAuthProvider,
    GithubAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { getFCMToken } from "../firebase/messaging";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const userDocRef = doc(db, "users", firebaseUser.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    setUser(userData);
                    localStorage.setItem("user", JSON.stringify(userData));
                }
            } else {
                setUser(null);
                localStorage.removeItem("user");
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleUser = async (firebaseUser, platform) => {
        if (!firebaseUser) return;

        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        const fcmToken = await getFCMToken();

        if (!userDocSnap.exists()) {
            // New user, create document
            const newUser = {
                id: firebaseUser.uid,
                id_platform: firebaseUser.providerData[0].uid,
                platform: platform,
                email: firebaseUser.email,
                name: firebaseUser.displayName,
                avatar: firebaseUser.photoURL,
                created_at: serverTimestamp(),
                last_alive_check: serverTimestamp(),
                fcmToken: fcmToken,
            };
            await setDoc(userDocRef, newUser);
            setUser(newUser);
            localStorage.setItem("user", JSON.stringify(newUser));
        } else {
            // Existing user, just update last check-in and log in
            const userData = userDocSnap.data();
            await setDoc(userDocRef, { ...userData, last_alive_check: serverTimestamp(), fcmToken: fcmToken }, { merge: true });
            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
        }
    };

    const loginWithProvider = async (provider, platform) => {
        try {
            const result = await signInWithPopup(auth, provider);
            await handleUser(result.user, platform);
            return result.user;
        } catch (error) {
            console.error("Authentication error:", error);
            throw error;
        }
    };

    const loginWithGoogle = () => {
        const provider = new GoogleAuthProvider();
        return loginWithProvider(provider, 'google');
    };

    const loginWithGitHub = () => {
        const provider = new GithubAuthProvider();
        return loginWithProvider(provider, 'github');
    };

    const logout = async () => {
        await signOut(auth);
        setUser(null);
        localStorage.removeItem("user");
    };

    return (
        <AuthContext.Provider value={{ user, loading, loginWithGoogle, loginWithGitHub, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
