import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

const SpotifyGenreSelection = ({ userId }) => {
  const [accessToken, setAccessToken] = useState("");
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [artists, setArtists] = useState([]);
  const [selectedArtists, setSelectedArtists] = useState([]);
  const [loading, setLoading] = useState({
    token: false,
    genres: false,
    artists: false,
    save: false
  });
  const [error, setError] = useState("");

  // Function to get Spotify Access Token
  const getSpotifyToken = async () => {
    setLoading(prev => ({ ...prev, token: true }));
    setError("");
    
    try {
      // Variables that go into the .env file
      const CLIENT_ID = 'f4c6ab89cb3f499c9417cad035e40399';
      const CLIENT_SECRET = 'eb2dcefe06d14880b629de819f1ccdfa';
      
      const response = await axios.post(
        "https://accounts.spotify.com/api/token",
        "grant_type=client_credentials",
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`
          },
        }
      );
      
      setAccessToken(response.data.access_token);
    } catch (error) {
      console.error("Error fetching Spotify token:", error);
      setError("Failed to authenticate with Spotify. Check your credentials.");
    } finally {
      setLoading(prev => ({ ...prev, token: false }));
    }
  };

  // Gets the token when the component mounts
  useEffect(() => {
    getSpotifyToken();
  }, []);

  // Fetches the available genres from Spotify
  useEffect(() => {
    if (!accessToken) return;
    
    const fetchGenres = async () => {
      setLoading(prev => ({ ...prev, genres: true }));
      try {
        const response = await axios.get(
          "https://api.spotify.com/v1/recommendations/available-genre-seeds", 
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        setGenres(response.data.genres);
      } catch (err) {
        console.error("Error fetching genres:", err.response?.data || err.message);
        setError("Failed to load genres. Please try again.");
      } finally {
        setLoading(prev => ({ ...prev, genres: false }));
      }
    };
    
    fetchGenres();
  }, [accessToken]);

  // Uses useCallback to fix dependency issue
  const fetchArtists = useCallback(async () => {
    if (selectedGenres.length === 0 || !accessToken) return;
    
    setLoading(prev => ({ ...prev, artists: true }));
    const genreQuery = selectedGenres.join(",");
    
    try {
      const response = await axios.get(
        `https://api.spotify.com/v1/search?q=genre:${genreQuery}&type=artist&limit=10`, 
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      
      setArtists(response.data.artists.items);
    } catch (err) {
      console.error("Error fetching artists:", err.response?.data || err.message);
      setError("Failed to load artists. Please try again.");
    } finally {
      setLoading(prev => ({ ...prev, artists: false }));
    }
  }, [selectedGenres, accessToken]);

  // Fetches the artists when genres change
  useEffect(() => {
    if (selectedGenres.length > 0 && accessToken) {
      fetchArtists();
    } else {
      setArtists([]);
    }
  }, [selectedGenres, accessToken, fetchArtists]);

  const handleGenreSelect = (genre) => {
    setSelectedGenres((prevGenres) => {
      if (prevGenres.includes(genre)) {
        return prevGenres.filter((g) => g !== genre); // Removes a genre has already been selected
      }
      return [...prevGenres, genre]; // Adds a genre if not selected
    });
  };

  const handleArtistSelect = (artist) => {
    setSelectedArtists((prevArtists) => {
      if (prevArtists.some(a => a.id === artist.id)) {
        return prevArtists.filter(a => a.id !== artist.id); // Removes an artist if already selected
      }
      return [...prevArtists, artist]; // Adds an artist if not selected
    });
  };

  const savePreferences = async () => {
    if (!userId) {
      setError("User ID is required to save preferences");
      return;
    }
    
    setLoading(prev => ({ ...prev, save: true }));
    
    try {
      // Saves selected artists with more information than just names
      const artistData = selectedArtists.map(artist => ({
        id: artist.id,
        name: artist.name,
        images: artist.images || []
      }));
      
      await setDoc(doc(db, "users", userId), {
        selectedGenres,
        selectedArtists: artistData,
        updatedAt: new Date()
      }, { merge: true }); // Uses merge to preserve other data
      
      alert("Preferences saved successfully!");
    } catch (error) {
      console.error("Error saving preferences:", error);
      setError("Failed to save preferences. Please try again.");
    } finally {
      setLoading(prev => ({ ...prev, save: false }));
    }
  };

  // Checks if an artist is selected
  const isArtistSelected = (artistId) => {
    return selectedArtists.some(artist => artist.id === artistId);
  };

  return (
    <div className="container mx-auto p-4">
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      
      <h1 className="text-2xl font-bold mb-4">Select Your Favorite Genres</h1>
      
      {loading.token ? (
        <p>Loading genres...</p>
      ) : (
        <div className="flex flex-wrap gap-2 mb-6">
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => handleGenreSelect(genre)}
              className={`px-3 py-1 rounded text-white ${
                selectedGenres.includes(genre) ? "bg-green-600" : "bg-gray-500"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      )}
      
      {loading.artists ? (
        <p>Loading artists...</p>
      ) : selectedGenres.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-3">Recommended Artists</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {artists.map((artist) => (
              <div 
                key={artist.id} 
                className={`p-4 border rounded ${
                  isArtistSelected(artist.id) ? "border-green-500 bg-green-50" : "border-gray-200"
                }`}
              >
                {artist.images && artist.images[0] && (
                  <img 
                    src={artist.images[0].url} 
                    alt={artist.name} 
                    className="w-24 h-24 object-cover rounded mx-auto mb-2"
                  />
                )}
                <p className="font-medium text-center mb-2">{artist.name}</p>
                <button 
                  onClick={() => handleArtistSelect(artist)}
                  className={`w-full py-1 px-3 rounded ${
                    isArtistSelected(artist.id)
                      ? "bg-red-500 text-white"
                      : "bg-green-500 text-white"
                  }`}
                >
                  {isArtistSelected(artist.id) ? "Remove" : "Select"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-8">
        <button 
          onClick={savePreferences}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
          disabled={loading.save || (!selectedGenres.length && !selectedArtists.length)}
        >
          {loading.save ? "Saving..." : "Save Preferences"}
        </button>
      </div>
    </div>
  );
};

export default SpotifyGenreSelection;