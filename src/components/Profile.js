import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

// Profile component that shows the user's favourite artists after they've selected them
const Profile = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserArtists = async () => {
      const user = auth.currentUser; // Gets the user that is currently logged in
      if (user) {
        // Fetches the user data
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        const data = userSnap.data();
        // Gets the list of artists IDs they selected
        const artistIds = data?.favoriteArtists || [];

        // Gets the Spotify token
        const token = await getSpotifyAccessToken();

        // Makes a request to Spotify's API to get details for all selected artist IDs
        const response = await fetch(`https://api.spotify.com/v1/artists?ids=${artistIds.join(',')}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const artistData = await response.json();
        setArtists(artistData.artists);
        setLoading(false);
      }
    };

    fetchUserArtists();
  }, []);

  if (loading) return <p>Loading profile...</p>;

  return (
    <div style={{ padding: '20px' }}>
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
