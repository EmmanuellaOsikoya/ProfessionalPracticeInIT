import React, { useState } from 'react';
import { createPost } from '../utils/fireBasePosts';
import { useNavigate } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase'; // Make sure you import your Firebase storage

const Create = () => {
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (content.trim() === '' && !imageFile) return;
    
    setUploading(true);
    let imageUrl = null;
    
    try {
      // Upload image if one is selected
      if (imageFile) {
        const imageRef = ref(storage, `post-images/${Date.now()}-${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }
      
      // Create post with content and image URL
      await createPost(content, imageUrl);
      setContent('');
      setImageFile(null);
      setImagePreview('');
      navigate('/profile');
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post. Please try again.");
    } finally {
      setUploading(false);
    }
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
        
        <div style={{ marginTop: '15px' }}>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ marginBottom: '10px' }}
          />
          
          {imagePreview && (
            <div style={{ marginTop: '10px', marginBottom: '15px' }}>
              <img
                src={imagePreview}
                alt="Preview"
                style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }}
              />
            </div>
          )}
        </div>
        
        <button
          type="submit"
          disabled={uploading}
          style={{
            marginTop: '10px',
            padding: '10px 20px',
            backgroundColor: uploading ? '#cccccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: uploading ? 'not-allowed' : 'pointer',
          }}
        >
          {uploading ? 'Uploading...' : 'Post'}
        </button>
      </form>
      
      <button 
        onClick={() => navigate(-1)} 
        style={{ 
          marginTop: '10px',
          padding: '8px 16px',
          backgroundColor: '#f0f0f0',
          border: '1px solid #ccc',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
      >
        ← Go Back
      </button>
    </div>
  );
};

export default Create;