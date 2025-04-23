import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Chat from '../components/Chat';

const ChatPage = () => {
  const { uid } = useParams(); // Gets the UID from the URL parameters
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState(null); // This stores the data of the user we're chatting with

  // UseEffect runs when the 'uid' changes
  useEffect(() => {
    const fetchUser = async () => {
      if (!uid) return; // Leaves early if there is no UID present

      const userRef = doc(db, 'users', uid); // Reference to the user document in Firestore
      const userSnap = await getDoc(userRef); // Fetches the document data
      // If the user is found in firestore, the state will get updated with their data
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
