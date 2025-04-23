import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

const Explore = () => {
  // This stores all the posts we're going to fetch from Firestore
  const [posts, setPosts] = useState([]);
  // Shows a loading state while the data is being fetched
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This gets the post in order of newest to oldest
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));

    // Gives us real-time updates from Firestore
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(fetchedPosts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // If it's still loading a message will be displayed on the screen
  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>Explore</h2>
        <p>Loading posts...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Explore</h2>
      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {posts.map((post) => (
            <div 
              key={post.id} 
              style={{ 
                border: '1px solid #ccc', 
                padding: '10px', 
                borderRadius: '8px',
                backgroundColor: '#fff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '10px',
                gap: '10px'
              }}>
                {post.userPhotoURL ? (
                  <img 
                    src={post.userPhotoURL} 
                    alt={post.userName} 
                    style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '50%' 
                    }} 
                  />
                ) : (
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '50%',
                    backgroundColor: '#ddd',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    color: '#555'
                  }}>
                    {post.userName?.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
                <strong>{post.userName}</strong>
              </div>
              
              {post.imageData && (
                <img 
                  src={post.imageData} 
                  alt="Post" 
                  style={{ 
                    maxWidth: '100%', 
                    borderRadius: '8px',
                    marginBottom: '10px'
                  }} 
                />
              )}
              {!post.imageData && post.imageUrl && (
                <img 
                  src={post.imageUrl} 
                  alt="Post" 
                  style={{ 
                    maxWidth: '100%', 
                    borderRadius: '8px',
                    marginBottom: '10px'
                  }} 
                />
              )}
              
              <p style={{ margin: '10px 0' }}>{post.content}</p>
              <small style={{ color: '#666' }}>
                {post.timestamp?.toDate?.() 
                  ? post.timestamp.toDate().toLocaleString() 
                  : post.timestamp?.seconds 
                    ? new Date(post.timestamp.seconds * 1000).toLocaleString()
                    : 'Unknown time'}
              </small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;
