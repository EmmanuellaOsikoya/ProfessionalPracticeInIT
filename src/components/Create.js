import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const Create = () => {
  // State variables to manage the content an images that will be posted to the explore page on MelodyMatch
  const [content, setContent] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  // Handles the image selection and converts it to base64 for storage in Firestore as there is a limited amount of space
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Checks the file size limit of 1MB to avoid Firestore document size limits
    if (file.size > 1024 * 1024) {
      alert('Image is too large. Please select an image smaller than 1MB.'); // Message shown if the image is too large
      return;
    }

    const reader = new FileReader(); // FileReader instance that will read through the file upload and also convert the image
    reader.onloadend = () => { // Then when the file is loaded, the base64 result is set
      setImageBase64(reader.result);
    };
    reader.readAsDataURL(file); // The file is read as base64 data
  };

  // Creates a post with content and base64 image and handles the post submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (content.trim() === '' && !imageBase64) return;
    
    setIsUploading(true); // This disables the upload button as the uploading state is set to true
    
    try {
      const user = auth.currentUser; // gets the current authenticated user
      if (!user) throw new Error('User not authenticated'); // If there is no user and error is thrown
      
      // Adds the post to Firestore with the user's info, content, image and the timestamp of when it was posted
      await addDoc(collection(db, 'posts'), {
        userId: user.uid,
        userName: user.displayName || user.email,
        userPhotoURL: user.photoURL || null,
        content: content,
        imageData: imageBase64 || null, // Store base64 image directly in document
        timestamp: serverTimestamp(),
      });
      
      // Clears the form and brings the user to the profile page after the post was successfully created
      setContent('');
      setImageBase64('');
      navigate('/profile');
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Removes the selected image
  const removeImage = () => {
    setImageBase64(''); // Clears the base64 image data
  };

  // Form the user will fill out to create a post on melody match
  return (
    <div style={{ padding: '20px' }}>
      <h2>Create a New Post</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '6px',
            minHeight: '100px',
            marginBottom: '15px'
          }}
        />
        
        <div style={{ marginBottom: '15px' }}>
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif"
            onChange={handleImageChange}
            style={{ marginBottom: '10px' }}
          />
          <div style={{ fontSize: '12px', color: '#666' }}>
            Max file size: 1MB. Supported formats: JPEG, PNG, GIF
          </div>
          
          {imageBase64 && (
            <div style={{ marginTop: '10px', position: 'relative' }}>
              <img
                src={imageBase64}
                alt="Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '300px',
                  borderRadius: '8px'
                }}
              />
              <button
                type="button"
                onClick={removeImage}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'rgba(255,0,0,0.7)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>
          )}
        </div>
        
        <button
          type="submit"
          disabled={isUploading}
          style={{
            padding: '10px 20px',
            backgroundColor: isUploading ? '#cccccc' : '#5165ae',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: isUploading ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          {isUploading ? 'Posting...' : 'Post'}
        </button>
        
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#f0f0f0',
            border: '1px solid #ccc',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default Create;