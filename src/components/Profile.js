import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, onSnapshot, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';

// Profile component that shows the user's favourite artists after they've selected them
const Profile = () => {
  const [artists, setArtists] = useState([]);
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [artistMap, setArtistMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [followingUsers, setFollowingUsers] = useState([]);
  const [user] = useAuthState(auth); // Gets the current logged in user
  const navigate = useNavigate();



  useEffect(() => {
    const fetchUserArtists = async () => {
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

        // Create map for artist ID to name
        const idToName = {};
        artistData.artists.forEach((artist) => {
          idToName[artist.id] = artist.name;
        });
        setArtistMap(idToName);

        setLoading(false);
      }
    };

    fetchUserArtists();
  }, [user]);

  useEffect(() => {
    if (!user) return;

      const unsubscribe = onSnapshot(collection(db, 'users'), async (snapshot) => {
      const currentUserRef = doc(db, 'users', user.uid);
      const currentUserSnap = await getDoc(currentUserRef);
      const currentUserData = currentUserSnap.data();

      const currentFavorites = currentUserData.favoriteArtists || [];
      const currentFollowing = currentUserData.following || [];

      const recommended = [];
      const followed = [];

      snapshot.forEach((docSnap) => {
        const otherUser = docSnap.data();
        const otherUid = docSnap.id;
        if (otherUid.uid === user.uid) return; // Skip self

        const sharedArtists = otherUser.favoriteArtists?.filter((artistId) => currentFavorites.includes(artistId)) || [];

        const otherUserFollowing = otherUser.following || [];

        if (sharedArtists.length > 0) {
          recommended.push({
            uid: docSnap.id,
            name: otherUser.name || 'Unknown',
            photoURL: otherUser.photoURL || '',
            sharedArtists,
            isFollowing: currentFollowing.includes(docSnap.id),
            followsYou: otherUserFollowing.includes(user.uid),
          });
        }
      
      if (currentFollowing.includes(otherUid)) {
        followed.push({
          uid: otherUid,
          name: otherUser.name || 'Unknown',
          photoURL: otherUser.photoURL || '',
        });
      }
    });

      setRecommendedUsers(recommended);
      setFollowingUsers(followed);
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleFollow = async (targetUid, isFollowing) => {
    if (!targetUid) {
      console.error('targetUid is undefined');
      return;
    }
  
    console.log(`Toggling follow for: ${targetUid}, isFollowing: ${isFollowing}`);
  
    const currentUserRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(currentUserRef, {
        following: isFollowing ? arrayRemove(targetUid) : arrayUnion(targetUid),
      });
    } catch (error) {
      console.error('Error updating follow status:', error);
    }
  };
  


  if (loading) return <p>Loading profile...</p>;

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

      <h3>Recommended Users (Shared Taste!)</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {recommendedUsers.map((recUser) => (
          <div key={recUser.uid} style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {recUser.photoURL && (
                <img
                  src={recUser.photoURL}
                  alt={`${recUser.name}'s profile`}
                  style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                />
              )}
              <div>
                <p><strong>{recUser.name}</strong></p>
                <p>Shared Artists: {recUser.sharedArtists.map((id) => artistMap[id] || id).join(', ')}</p>
              </div>
              <button onClick={() => toggleFollow(recUser.uid, recUser.isFollowing)}>
                {recUser.isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <h3>Following</h3>
      {followingUsers.length === 0 ? (
        <p>You’re not following anyone yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {followingUsers.map((fUser) => (
            <div key={fUser.uid} style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {fUser.photoURL && (
                  <img
                    src={fUser.photoURL}
                    alt={`${fUser.name}'s profile`}
                    style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                  />
                )}
                <p><strong>{fUser.name}</strong></p>
              </div>
            </div>
          ))}
        </div>
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
