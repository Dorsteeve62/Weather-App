import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider, db, storage } from "../firebase";
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, signInWithPopup, updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider, deleteUser } from "firebase/auth";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    async function signup(email, password, firstName, lastName) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = result.user;
        await setDoc(doc(db, "users", user.uid), {
            firstName,
            lastName,
            email,
            createdAt: new Date()
        });
        return result;
    }

    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    function logout() {
        return signOut(auth);
    }

    function loginWithGoogle() {
        return signInWithPopup(auth, googleProvider);
    }

    async function uploadProfilePicture(file, user) {
        const fileRef = ref(storage, `profile_images/${user.uid}`);
        const snapshot = await uploadBytes(fileRef, file);
        const photoURL = await getDownloadURL(snapshot.ref);
        await updateProfile(user, { photoURL });
        return photoURL;
    }

    async function updateUserPassword(currentPassword, newPassword) {
        const user = auth.currentUser;
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
    }

    async function deleteAccount(password) {
        const user = auth.currentUser;
        // Re-authenticate first
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);

        // Delete Firestore doc
        await deleteDoc(doc(db, "users", user.uid));

        // Delete Auth user
        await deleteUser(user);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        signup,
        login,
        logout,
        loginWithGoogle,
        uploadProfilePicture,
        updateUserPassword,
        deleteAccount
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
