import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navigation from "./components/Navigation";
import Explore from "./components/Explore";
import Create from "./components/Create";
import Account from "./components/Account"
import Login from "./Login";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ArtistSelection from "./components/ArtistSelection";
import Profile from "./components/Profile";
import EditPost from "./components/EditPosts";


function App() {
  return (
    <AuthProvider>
      <Router>
        <Navigation/>
        <Routes>
          <Route path="/" element={<Account/>} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/create" element={<Create />} />
          <Route path="/account" element={<Account/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/artist-selection" element={<ArtistSelection/>}/>
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit/:postId" element={<EditPost />} />
        </Routes>
      </Router>
    </AuthProvider>
    
  );
}

export default App;
