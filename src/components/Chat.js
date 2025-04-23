import React, { useEffect, useState, useRef } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

const Chat = ({ selectedUser }) => {
  // Gets the currently authenticated user
  const [user] = useAuthState(auth);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const bottomRef = useRef(null); // Reference that scrolls to the latest message

  // Function that helps generate a unique chat ID based on the user IDs
  const getChatId = (uid1, uid2) => {
    return [uid1, uid2].sort().join('_'); // Always the same order so that it stays consistent
  };

  useEffect(() => {
    if (!selectedUser || !user) return; // If the selected user isn't available it exits the chat early

    const chatId = getChatId(user.uid, selectedUser.uid);
    // Orders the messages in order of timestamp
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp')
    );

    // This updates the message list whenever the Firestore collection changes
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });

    // This cleans up the listener when the component unmounts or the dependencies change
    return () => unsubscribe();
  }, [selectedUser, user]);

  // sendMessage function handles sending a new message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const chatId = getChatId(user.uid, selectedUser.uid);
    // Adds the message to Firestore
    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      senderId: user.uid,
      text: newMessage,
      timestamp: new Date(),
    });

    setNewMessage('');
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div style={{ padding: '20px', maxHeight: '70vh', overflowY: 'auto' }}>
      <h3>Chat with {selectedUser.name}</h3>
      <div style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '8px', marginBottom: '10px' }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ 
            textAlign: msg.senderId === user.uid ? 'right' : 'left', 
            margin: '5px 0' 
          }}>
            <span style={{ 
              background: msg.senderId === user.uid ? '#d5f5f9' : '#eee', 
              padding: '8px 12px', 
              borderRadius: '18px', 
              display: 'inline-block' 
            }}>
              {msg.text}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
        />
        <button onClick={sendMessage} style={{
                  marginLeft: 'auto',
                  padding: '6px 50px',
                  backgroundColor: '#5165ae',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
