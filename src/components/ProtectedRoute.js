import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

// ProtectedRoute ensures that users can only acces certain pages on MelodyMatch if they are logged into their account
function ProtectedRoute({ children }) {
    const { user } = useContext(AuthContext);

    return user ? children : <Navigate to="/login" />; // if the user is not logged in they will be redirected to the login page
}

export default ProtectedRoute;
