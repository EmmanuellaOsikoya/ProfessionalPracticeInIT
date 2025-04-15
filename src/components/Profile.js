import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';

// Profile component that shows the user's favourite artists after they've selected them
const Profile = () => {
  const [artists, setArtists] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user] = useAuthState(auth); // Gets the current logged in user
  const navigate = useNavigate();



  useEffect(() => {
    const fetchUserArtistsAndRecommendations = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();
        const userArtistIds = userData?.favoriteArtists || [];

        // Fetch Spotify artist details
        const token = await getSpotifyAccessToken();
        const artistRes = await fetch(`https://api.spotify.com/v1/artists?ids=${userArtistIds.join(',')}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const artistData = await artistRes.json();
        setArtists(artistData.artists);

        // Fetch all users from Firestore
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const recommendedUsers = [];

        usersSnapshot.forEach((docSnap) => {
          const otherUser = docSnap.data();
          if (docSnap.id !== user.uid && otherUser.favoriteArtists) {
            const sharedArtists = otherUser.favoriteArtists.filter((id) => userArtistIds.includes(id));
            if (sharedArtists.length > 0) {
              recommendedUsers.push({
                uid: docSnap.id,
                email: otherUser.email || 'No email',
                sharedArtists,
              });
            }
          }
        });

        recommendedUsers.sort((a, b) => b.sharedArtists.length - a.sharedArtists.length);
        setRecommendations(recommendedUsers);
        setLoading(false);
      }
    };

    fetchUserArtistsAndRecommendations();
  }, [user, navigate]);


  if (loading) return <p>Loading profile...</p>;

  // Logs out the user and redirects to login
  const handleLogout = async () => {
    try {
      await signOut(auth); // Firebase sign-out
      navigate('/login'); // Go back to login page
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>

    <h2>
      Welcome, {user?.displayName || user?.email || 'user'}!
    </h2>

      <button
      onClick={handleLogout}
      style={{
        marginBottom: '20px',
        padding: '10px 20px',
        backgroundColor: '#ff4d4d',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
      }}
    >
      Log Out
    </button>

    <h2>Your Favorite Artists</h2>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        {artists.map((artist) => (
          <div key={artist.id} style={{ width: '150px', textAlign: 'center' }}>
            <img
              src={artist.images[0]?.url}
              alt={artist.name}
              width="100%"
              style={{ borderRadius: '8px' }}
            />
            <p>{artist.name}</p>
          </div>
        ))}
      </div>

      <h3 style={{ marginTop: '40px' }}>Recommended Users With Similar Taste</h3>
      {recommendations.length === 0 ? (
        <p>No recommendations yet. Try selecting more artists!</p>
      ) : (
        <ul>
          {recommendations.map((rec) => (
            <li key={rec.uid} style={{ marginBottom: '12px' }}>
              <strong>{rec.email}</strong><br />
              Shared Artists: {rec.sharedArtists.length} <br />
              IDs: {rec.sharedArtists.join(', ')} <br />
              <button disabled style={{ marginTop: '4px' }}>Follow (Coming soon)</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// This function gets a token from Spotify so we can ask Spotify for artist info
const getSpotifyAccessToken = async () => {
  const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
  const CLIENT_SECRET = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;
  const authString = `${CLIENT_ID}:${CLIENT_SECRET}`;
  const authBase64 = btoa(authString);

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${authBase64}`,
    },
    body: 'grant_type=client_credentials', // Tells Spotify the kind of toekn we want
  });

  const data = await response.json(); // Gets the token info from the response
  return data.access_token;
};

export default Profile;
