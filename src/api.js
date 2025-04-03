// Imports that will enable Spotify api use
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { db } from "./firebaseConfig";
import { collection, doc, setDoc } from "firebase/firestore";

// The client id and the client secret are keys that were generated in order for me to be able to access the content within Spotify apis e.g. the artists registered on Spotify, the songs etc.
const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;

const Api = ({ userId }) => {
    //These are state variables that are responsible for managing data within the component
    const [accessToken, setAccessToken] = useState("");
    const [genres, setGenres] = useState([]);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [artists, setArtists] = useState([]);
    const [selectedArtists, setSelectedArtists] = useState([]);
    const [loading, setLoading] = useState({
      token: false,
      genres: false,
      artists: false,
      save: false,
    });
    const [error, setError] = useState("");
  
    // Function to get Spotify Access Token
    const getSpotifyToken = async () => {
      setLoading((prev) => ({ ...prev, token: true })); // Sets the loading state to true for token retrieval
      setError(""); // The Error state is then reset before trying to fetch the token
  
      try {
        const authString = `${CLIENT_ID}:${CLIENT_SECRET}`;
        const authBase64 = btoa(authString); // Convert to Base64
  
        // Requests the Spotify token
        const response = await axios.post(
          "https://accounts.spotify.com/api/token",
          "grant_type=client_credentials",
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: `Basic ${authBase64}`,
            },
          }
        );

        // Saves the access token to the state
        setAccessToken(response.data.access_token);
      } catch (error) {
        console.error("Error fetching Spotify token:", error);
        setError("Failed to authenticate with Spotify. Check your credentials.");
      } finally {
        setLoading((prev) => ({ ...prev, token: false })); // The loading state is set to false after the token is fetched
      }
    };
  

    // Gets the token when the component mounts
    useEffect(() => {
      getSpotifyToken();
    }, []);
  
    // Fetches the available genres from the Spotify API
    useEffect(() => {
      if (!accessToken) return; // Only fetches the genres provided that there is an access token
  
      
      const fetchGenres = async () => {
        setLoading((prev) => ({ ...prev, genres: true }));
        try {
          // API call that gets the available genres
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
          setLoading((prev) => ({ ...prev, genres: false }));
        }
      };
  
      fetchGenres();
    }, [accessToken]); // Reruns the effect whenever the accessToken changes
  
    // Fetches the artists based on the selected genres
    const fetchArtists = useCallback(async () => {
      if (selectedGenres.length === 0 || !accessToken) return;
  
      setLoading((prev) => ({ ...prev, artists: true }));
      const genreQuery = selectedGenres.join(",");
  
      try {
        // Fetches reccommendations based on the select genres
        const response = await axios.get(
          `https://api.spotify.com/v1/recommendations?seed_genres=${genreQuery}&limit=10`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
  
        setArtists(response.data.tracks.map((track) => track.artists[0]));
      } catch (err) {
        console.error("Error fetching artists:", err.response?.data || err.message);
        setError("Failed to load artists. Please try again.");
      } finally {
        setLoading((prev) => ({ ...prev, artists: false }));
      }
    }, [selectedGenres, accessToken]);
  
    useEffect(() => {
      if (selectedGenres.length > 0 && accessToken) {
        fetchArtists();
      } else {
        setArtists([]);
      }
    }, [selectedGenres, accessToken, fetchArtists]);
  
    
    const savePreferences = async () => {
      if (!userId) {
        setError("User ID is required to save preferences");
        return;
      }
  
      setLoading((prev) => ({ ...prev, save: true }));
  
      try {
        const artistData = selectedArtists.map((artist) => ({
          id: artist.id,
          name: artist.name,
          images: artist.images || [],
        }));
  
        await setDoc(
          doc(db, "users", userId),
          {
            selectedGenres,
            selectedArtists: artistData,
            updatedAt: new Date(),
          },
          { merge: true }
        );
  
        alert("Preferences saved successfully!");
      } catch (error) {
        console.error("Error saving preferences:", error);
        setError("Failed to save preferences. Please try again.");
      } finally {
        setLoading((prev) => ({ ...prev, save: false }));
      }
    };
  
  
    return (
      <div>
        <h1>Select Your Favorite Genres</h1>
        <div>
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenres([...selectedGenres, genre])}
            >
              {genre}
            </button>
          ))}
        </div>
        <button onClick={fetchArtists}>Find Artists</button>
  
        <h2>Recommended Artists</h2>
        <div>
          {artists.map((artist) => (
            <div key={artist.id}>
              <p>{artist.name}</p>
              <button onClick={() => setSelectedArtists([...selectedArtists, artist.name])}>
                Select
              </button>
            </div>
          ))}
        </div>
  
        <button onClick={savePreferences}>Save Preferences</button>
      </div>
    );
  };
  
  export default Api;