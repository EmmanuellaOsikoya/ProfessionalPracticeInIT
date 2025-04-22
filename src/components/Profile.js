import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, onSnapshot, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { query, where, orderBy } from 'firebase/firestore';
import { deleteDoc } from 'firebase/firestore';

// Profile component that shows the user's favourite artists after they've selected them
const Profile = () => {
  const [artists, setArtists] = useState([]);
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [artistMap, setArtistMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [followingUsers, setFollowingUsers] = useState([]);
  const [user] = useAuthState(auth); // Gets the current logged in user
  const [userPosts, setUserPosts] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
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
        if (otherUid === user.uid) return; // Skip self

        const sharedArtists = otherUser.favoriteArtists?.filter((artistId) => currentFavorites.includes(artistId)) || [];

        const otherUserFollowing = otherUser.following || [];

        if (sharedArtists.length > 0) {
          recommended.push({
            uid: docSnap.id,
            name: otherUser.name || otherUser.displayName || otherUser.email || 'No name',
            photoURL: otherUser.photoURL || '',
            sharedArtists,
            isFollowing: currentFollowing.includes(docSnap.id),
            followsYou: otherUserFollowing.includes(user.uid),
          });
        }
      
      if (currentFollowing.includes(otherUid)) {
        followed.push({
          uid: otherUid,
          name: otherUser.name || otherUser.displayName || otherUser.email || 'No name',
          photoURL: otherUser.photoURL || '',
        });
      }
    });

      setRecommendedUsers(recommended);
      setFollowingUsers(followed);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;
  
    const q = query(
      collection(db, 'posts'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );
  
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const posts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUserPosts(posts);
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
  
  const handleDeletePost = async (postId) => {
    // Set the post ID to confirm deletion
    setDeleteConfirm(postId);
  };

  const confirmDeletePost = async (postId) => {
    try {
      await deleteDoc(doc(db, 'posts', postId));
      // Reset confirmation state
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
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
        position: 'absolute',
        top: '70px',
        right: '20px',
        padding: '10px 20px',
        backgroundColor: '#ff4d4d',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        zIndex: 1000,
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

      <h3>Your Posts</h3>
{userPosts.length === 0 ? (
  <p>You haven't created any posts yet.</p>
) : (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
    {userPosts.map((post) => (
      <div
        key={post.id}
        style={{
          border: '1px solid #ccc',
          padding: '10px',
          borderRadius: '8px',
          position: 'relative',
        }}
      >
        {post.imageData && (
          <img
            src={post.imageData}
            alt="Post"
            style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '10px' }}
          />
        )}
        <p>{post.content}</p>
        <small>{post.timestamp?.toDate().toLocaleString()}</small>
        
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          {post.userId === user?.uid && (
            <button
              style={{
                padding: '6px 10px',
                backgroundColor: '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
              onClick={() => navigate(`/edit/${post.id}`)}
            >
              Edit
            </button>
          )}
          
          <button
            style={{
              padding: '6px 10px',
              backgroundColor: '#dc3545',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
            onClick={() => handleDeletePost(post.id)}
          >
            Delete
          </button>
        </div>
        
        {/* Delete confirmation dialog */}
        {deleteConfirm === post.id && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '8px',
            zIndex: 5,
            padding: '20px'
          }}>
            <p style={{ fontWeight: 'bold', marginBottom: '15px' }}>
              Are you sure you want to delete this post?
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#dc3545',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
                onClick={() => confirmDeletePost(post.id)}
              >
                Yes, Delete
              </button>
              <button
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6c757d',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
                onClick={cancelDelete}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    ))}
  </div>
)}

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
