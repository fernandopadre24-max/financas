
"use client";

import {
    GoogleAuthProvider,
    signInWithPopup,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { useFirebase } from "@/firebase/provider";

export function useAuth() {
    const { auth, firestore, user, isUserLoading } = useFirebase();

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            
            const userRef = doc(firestore, "users", user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
              await setDoc(userRef, {
                  displayName: user.displayName,
                  email: user.email,
                  photoURL: user.photoURL,
                  createdAt: serverTimestamp(),
              });
            }

        } catch (error) {
            console.error("Error signing in with Google: ", error);
            throw error;
        }
    };

    const signUpWithName = async (name: string, password: string) => {
        const email = `${name.toLowerCase()}@example.com`;
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            const user = result.user;

            await updateProfile(user, { displayName: name });

            const userRef = doc(firestore, "users", user.uid);
            await setDoc(userRef, {
                displayName: name,
                email: user.email,
                createdAt: serverTimestamp(),
            });

        } catch (error) {
            console.error("Error signing up with name: ", error);
            throw error;
        }
    };

    const signInWithName = async (name: string, password: string) => {
        const email = `${name.toLowerCase()}@example.com`;
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error("Error signing in with name: ", error);
            throw error;
        }
    };

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
        } catch (error) {
            console.error("Error signing out: ", error);
            throw error;
        }
    };

    return {
        user,
        isUserLoading,
        signInWithGoogle,
        signUpWithName,
        signInWithName,
        signOut,
    };
}
