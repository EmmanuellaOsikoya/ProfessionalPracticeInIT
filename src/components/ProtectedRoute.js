import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

// ProtectedRoute ensures that users can only acces certain pages on MelodyMatch if they are logged into their account
function ProtectedRoute({ children }) {
    const { user } = useContext(AuthContext);

    return user ? children : <Navigate to="/account" />; // if the user is not logged in they will be redirected to the create an account page where they will alos have the option to login
}

export default ProtectedRoute;
