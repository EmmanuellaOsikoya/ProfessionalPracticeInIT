import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

const Explore = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(fetchedPosts);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Explore</h2>
      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {posts.map((post) => (
            <div key={post.id} style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '8px' }}>
              {post.imageUrl && (
                <img src={post.imageUrl} alt="Post" style={{ maxWidth: '100%', borderRadius: '8px' }} />
              )}
              <p>{post.content}</p>
              <small>{new Date(post.timestamp?.seconds * 1000).toLocaleString()}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;
