import Header from "./components/Header";
import Footer from "./components/Footer";
import Main from "./components/Main";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navigation from "./components/Navigation";
import Explore from "./components/Explore";
import Create from "./components/Create";
import Account from "./components/Account"
import Login from "./Login";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";


function App() {
  return (
    <AuthProvider>
      <Router>
        <Navigation/>
        <Routes>
          <Route path="/home" element={<ProtectedRoute><Main/></ProtectedRoute>}/>
          <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
          <Route path="/create" element={<ProtectedRoute><Create /></ProtectedRoute>} />
          <Route path="/account" element={<Account/>}/>
          <Route path="/login" element={<Login/>}/>
        </Routes>
      </Router>
    </AuthProvider>
    
  );
}

export default App;
