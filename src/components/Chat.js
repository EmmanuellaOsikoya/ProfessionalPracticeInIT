import React, { useEffect, useState, useRef } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

const Chat = ({ selectedUser }) => {
  const [user] = useAuthState(auth);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const bottomRef = useRef(null);

  const getChatId = (uid1, uid2) => {
    return [uid1, uid2].sort().join('_'); // Always same order
  };

  useEffect(() => {
    if (!selectedUser || !user) return;

    const chatId = getChatId(user.uid, selectedUser.uid);
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [selectedUser, user]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const chatId = getChatId(user.uid, selectedUser.uid);
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
