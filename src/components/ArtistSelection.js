import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';

// This component fetches and displays a list of popular artists from Spotify
const ArtistSelection = () => {
  const [artists, setArtists] = useState([]); 
  const [selectedArtists, setSelectedArtists] = useState([]);
  const [loading, setLoading] = useState(true); 
  // useState that will catch any error that might happen during the fetch
  const [error, setError] = useState(null); 

  // This function allows the user to select their favourite artists
  const toggleSelection = (artistId) => {
    setSelectedArtists((prevSelected) =>
      prevSelected.includes(artistId)
        ? prevSelected.filter((id) => id !== artistId)
        : [...prevSelected, artistId]
    );
  };

  // Function that is called when the user picks "Save selection"
  const handleSave = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          favoriteArtists: selectedArtists, // This saves the selected artist IDs
        });
        alert('Artists saved successfully!');
      } catch (err) {
        console.error('Error saving artists:', err);
      }
    }
  };

  // These are debugging logs to make sure that the environment variables are working
  console.log("Spotify Client ID:", process.env.REACT_APP_SPOTIFY_CLIENT_ID);
  console.log("Spotify Client Secret:", process.env.REACT_APP_SPOTIFY_CLIENT_SECRET);

  const getSpotifyAccessToken = async () => {
    const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
    const CLIENT_SECRET = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;
  
    if (!CLIENT_ID || !CLIENT_SECRET) {
      console.error('Spotify client credentials are missing!');
      return null;
    }
  
    const authString = `${CLIENT_ID}:${CLIENT_SECRET}`;
    const authBase64 = btoa(authString);
  
    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${authBase64}`,
        },
        body: 'grant_type=client_credentials',
      });
  
      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Error fetching access token:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const accessToken = await getSpotifyAccessToken(); // Gets us the token which allows us to access Spotify API
        if (!accessToken) {
          throw new Error("Access token not available");
        }

        // List of 50 popular Spotify artist IDs
        const artistIds = [
          '1uNFoZAHBGtllmzznpCI3s', // Justin Bieber
          '66CXWjxzNUsdJxJ2JdwvnR', // Ariana Grande
          '1Xyo4u8uXC1ZmMpatF05PJ', // The Weeknd
          '06HL4z0CvFAxyc27GXpf02', // Taylor Swift
          '3TVXtAsR1Inumwj472S9r4', // Drake
          '1dfeR4HaWDbWqFHLkxsg1d', // Queen
          '7dGJo4pcD2V6oG8kP0tJRR', // Eminem
          '0du5cEVh5yTK9QJze8zA0C', // Bruno Mars
          '1ZwdS5xdxEREPySFridCfh', // 2Pac
          '53XhwfbYqKCa1cC15pYq2q', // Imagine Dragons
          '4dpARuHxo51G3z768sgnrY', // Adele
          '6vWDO969PvNqNYHIOW5v0m', // Beyoncé
          '246dkjvS1zLTtiykXe5h60', // Post Malone
          '2YZyLoL8N0Wb9xBt1NhZWg', // Kendrick Lamar
          '5K4W6rqBFWDnAN6FQUkS6x', // Kanye West
          '1XHVF0Z3Zf0T6EzQyW4U1g', // Travis Scott
          '3nFkdlSjzX9mRTtwJOzDYB', // JAY-Z
          '5pKCCKE2ajJHZ9KAiaK11H', // Rihanna
          '1vyhD5VmyZ7KMfW5gqLgo5', // J Balvin
          '1mcTU81TzQhprhouKaTkpq', // Joji
          '5fMUXHkw8R8eOP2RNVYEZX', // Doja Cat
          '0oSGxfWSnnOXhD2fKuz2Gy', // David Bowie
          '7Ln80lUS6He07XvHI8qqHH', // Arctic Monkeys
          '6eUKZXaKkcviH0Ku9w2n3V', // Ed Sheeran
          '6qqNVTkY8uBg9cP3Jd7DAH', // Billie Eilish
          '4gzpq5DPGxSnKTe4SA8HAU', // Coldplay
          '7tYKF4w9nC0nq9CsPZTHyP', // Tyga
          '0Y5tJX1MQlPlqiwlOH1tJY', // Travis Scott
          '1URnnhqYAYcrqrcwql10ft', // PARTYNEXTDOOR
          '3qBKjEOanahMnvYm3nF1x4', // Migos
          '6vWDO969PvNqNYHIOW5v0m', // Beyoncé
          '3AA28KZvwAUcZuOKwyblJQ', // A$AP Rocky
          '3PhL2Vdao2v8SS8AptuhAr', // Kali Uchis
          '6LuN9FCkKOj5PcnpouEgny', // Carly Rae Jepsen
          '0iEtIxbK0KxaSlF7G42ZOp', // 21 Savage
          '6l3HvQ5sa6mXTsMTB19rO5', // J. Cole
          '2RdwBSPQiwcmiDo9kixcl8', // Pharrell Williams
          '7n2wHs1TKAczGzO7Dd2rGr', // Shawn Mendes
          '0C8ZW7ezQVs4URX5aX7Kqx', // Selena Gomez
          '7wlFDEWiM5OoIAt8RSli8b', // Tate McRae
          '6jJ0s89eD6GaHleKKya26X', // Katy Perry
          '7nqOGRxlXj7N2JYbgNEjYH', // Tate McRae
          '20wkVLutqVOYrc0kxFs7rA', // Daniel Caesar
          '6jGMq4yGs7aQzuGsMgVgZR', // Labrinth
          '3FAJ6O0NOHQV8Mc5Ri6ENp', // Tate McRae
          '3MZsBdqDrRTJihTHQrO6Dq', // Daniel Caesar
          '7CajNmpbOovFoOoasH2HaY', // Calvin Harris
          '1Cs0zKBU1kc0i8ypK3B9ai', // David Guetta
        ];

        const response = await fetch(`https://api.spotify.com/v1/artists?ids=${artistIds.join(',')}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const data = await response.json();
        console.log('Fetched artist data:', data.artists); // Lets the user know which artists have been fetched for debugging purposes
        if (data.artists) {
          setArtists(data.artists.filter((artist) => artist && artist.id)); // Stores the fetched artists data in state
        }
        setLoading(false); // Updates the loading state
      } catch (error) {
        setError(error); // Handles any errors
        setLoading(false); // Stops loading on error
      }
    };

    fetchArtists();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error fetching artists: {error.message}</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Select Your Favorite Artists</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        {artists.map((artist) => (
          <div
            key={artist.id}
            onClick={() => toggleSelection(artist.id)}
            style={{
              border: selectedArtists.includes(artist.id) ? '2px solid blue' : '1px solid gray',
              borderRadius: '8px',
              padding: '10px',
              cursor: 'pointer',
              width: '150px',
              textAlign: 'center',
              backgroundColor: selectedArtists.includes(artist.id) ? '#e0f0ff' : '#fff',
            }}
          >
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
      <button
        className="btn btn-primary mt-3"
        onClick={handleSave}
        disabled={selectedArtists.length === 0}
      >
        Save Selection
      </button>
    </div>
  );
};
  

export default ArtistSelection;
