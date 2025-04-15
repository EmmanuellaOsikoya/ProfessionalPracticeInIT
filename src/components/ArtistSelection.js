import React, { useState, useEffect } from 'react';

const ArtistSelection = () => {
  const [artists, setArtists] = useState([]); // Start with an empty array
  const [loading, setLoading] = useState(true); // To track loading state
  const [error, setError] = useState(null); // To track errors

  console.log("Spotify Client ID:", process.env.REACT_APP_SPOTIFY_CLIENT_ID);
    console.log("Spotify Client Secret:", process.env.REACT_APP_SPOTIFY_CLIENT_SECRET);


  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const accessToken = await getSpotifyAccessToken();
        const artistIds = [
          '0L8ExT028jH3dd5vxpD6Y', '0wrsVHg61NmHfLfaVEnR4O', '6f3aFvA4fp9z7PHnp1fhL7', // Example IDs
          // Add other 50 artist IDs here
        ];

        const response = await fetch(`https://api.spotify.com/v1/artists?ids=${artistIds.join(',')}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const data = await response.json();
        if (data.artists) {
          setArtists(data.artists); // Store fetched artists data in state
        }
        setLoading(false); // Update loading state
      } catch (error) {
        setError(error); // Handle any errors
        setLoading(false); // Stop loading on error
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
    <div>
      <h1>Select Your Favorite Artists</h1>
      <ul>
        {artists && artists.length > 0 ? (
          artists.map((artist) => (
            <li key={artist.id}>
              <img src={artist.images[0]?.url} alt={artist.name} width="50" />
              <span>{artist.name}</span>
            </li>
          ))
        ) : (
          <li>No artists found</li>
        )}
      </ul>
    </div>
  );
};

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
      
      if (data.error) {
        console.error('Error fetching token:', data.error);
        return null;
      }
  
      console.log('Access token received:', data.access_token); // Log the access token
      return data.access_token;
    } catch (error) {
      console.error('Error fetching access token:', error);
      return null;
    }
  };
  

export default ArtistSelection;
