// ChatPage.jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Chat from '../components/Chat';

const ChatPage = () => {
  const { uid } = useParams(); // gets UID from route
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!uid) return;

      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setSelectedUser({
          uid,
          ...userSnap.data(),
        });
      } else {
        console.warn('User not found');
      }
    };

    fetchUser();
  }, [uid]);

  if (!selectedUser) return <p>Loading chat...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <button onClick={() => navigate(-1)} style={{
        marginBottom: '10px',
        padding: '8px 16px',
        backgroundColor: '#6c757d',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }}>
        Back
      </button>
      <Chat selectedUser={selectedUser} />
    </div>
  );
};

export default ChatPage;
