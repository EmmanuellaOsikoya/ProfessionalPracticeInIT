//Component that is responsible for creating posts on the user's account
import React, { useState } from 'react';
import { createPost } from '../utils/fireBasePosts';
import { useNavigate } from 'react-router-dom';

const Create = () => {
    const [content, setContent] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (content.trim() === '') return;
    
        await createPost(content);
        setContent('');
        navigate('/profile');
};

return (
    <div style={{ padding: '20px' }}>
      <h2>Create a New Post</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          style={{ width: '100%', padding: '10px', borderRadius: '6px', minHeight: '100px' }}
        />
        <button
          type="submit"
          style={{
            marginTop: '10px',
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Post
        </button>
      </form>
      <button onClick={() => navigate(-1)} style={{ marginTop: '10px' }}>
        ← Go Back
      </button>
    </div>
  );
};


export default Create;