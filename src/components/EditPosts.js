import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

const EditPost = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Loads the post data from Firestore when the postId changes
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postRef = doc(db, 'posts', postId);
        const postSnap = await getDoc(postRef);
        
        if (postSnap.exists()) {
          const postData = postSnap.data(); // Extracts the post content and image
          setContent(postData.content || '');
          setImageBase64(postData.imageData || '');
        } else {
          alert('Post not found');
          navigate('/profile'); // If the post doesn't exist the user gets redirected back to the profile
        }
      } catch (error) {
        console.error('Error loading post:', error);
        alert('Failed to load post');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPost();
  }, [postId, navigate]);

  // Handles image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Checks the file size limit to 1MB due to Firestore limitations
    if (file.size > 1024 * 1024) {
      alert('Image is too large. Please select an image smaller than 1MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Removes the image
  const removeImage = () => {
    setImageBase64('');
  };

  // Updates the post
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (content.trim() === '' && !imageBase64) {
      alert('Please add content or an image');
      return;
    }
    
    setSaving(true);
    
    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        content: content,
        imageData: imageBase64,
        lastEdited: serverTimestamp() // Update the timestamp for edit
      });
      
      navigate('/profile'); // After the post has been saved they get redireted back to the profile page
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post');
    } finally {
      setSaving(false);
    }
  };

  // Shows loading message while fetching post data
  if (loading) {
    return <div style={{ padding: '20px' }}>Loading post...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Edit Post</h2>
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
                alt="Post"
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
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '10px 20px',
              backgroundColor: saving ? '#cccccc' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: saving ? 'not-allowed' : 'pointer'
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/profile')}
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
        </div>
      </form>
    </div>
  );
};

export default EditPost;