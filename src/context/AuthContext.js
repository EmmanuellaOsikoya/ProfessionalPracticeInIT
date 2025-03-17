import { createContext, useState, useEffect } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

// AuthContext is what holds the authentification state for ProtectedRoutes 
export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    // useEffect is set up for any authentification state changes that may be made
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser); // This updates the state when the auth state changes
        });

        return () => unsubscribe();
    }, []);

    // This is repsonsible for providing the current user state to the rest of the MelodyMatch App via AuthContext
    return (
        <AuthContext.Provider value={{ user }}>
            {children}
        </AuthContext.Provider>
    );
}

