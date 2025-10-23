
"use client";

import {
    GoogleAuthProvider,
    signInWithPopup,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    updateProfile,
    getAuth,
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
            
            // Check if user document already exists
            const userRef = doc(firestore, "users", user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
              // Create user document in Firestore if it doesn't exist
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

    const signUpWithEmail = async (email, password, firstName, lastName) => {
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            const user = result.user;
            const displayName = `${firstName} ${lastName}`;

            // Update Firebase Auth profile
            await updateProfile(user, { displayName });

            // Create user document in Firestore
            const userRef = doc(firestore, "users", user.uid);
            await setDoc(userRef, {
                displayName,
                email: user.email,
                createdAt: serverTimestamp(),
            });

        } catch (error) {
            console.error("Error signing up with email: ", error);
            throw error;
        }
    };

    const signInWithEmail = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error("Error signing in with email: ", error);
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
        signUpWithEmail,
        signInWithEmail,
        signOut,
    };
}
