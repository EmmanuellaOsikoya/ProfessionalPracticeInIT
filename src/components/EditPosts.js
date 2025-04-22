import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase'; 

const EditPost = () => {
  const { postId } = useParams(); // Get the post ID from the URL
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!postId) {
        console.error('No post ID provided!');
        return;
      }

    const fetchPost = async () => {
      const postRef = doc(db, 'posts', postId);
      const postSnap = await getDoc(postRef);
      
      if (postSnap.exists()) {
        const post = postSnap.data();
        setContent(post.content);
        setImageUrl(post.imageUrl || '');
      } else {
        console.log('No such post!');
      }
    };

    fetchPost();
  }, [postId]);

  const handleSave = async () => {
    const postRef = doc(db, 'posts', postId);

    let updatedImageUrl = imageUrl;

    // Upload the new image if a file is selected
    if (imageFile) {
      const imageRef = ref(storage, `postImages/${postId}`);
      const snapshot = await uploadBytes(imageRef, imageFile);
      updatedImageUrl = await getDownloadURL(snapshot.ref);
    }

    try {
      await updateDoc(postRef, {
        content,
        imageUrl: updatedImageUrl,
      });
      console.log('Post updated successfully!');
      navigate(`/profile`);
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Edit Post</h2>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Edit your post content..."
        style={{ width: '100%', height: '150px', padding: '10px' }}
      />

      <div>
        <label>Change Image</label>
        <input type="file" onChange={(e) => setImageFile(e.target.files[0])} />
      </div>

      {imageUrl && (
        <div>
          <img src={imageUrl} alt="Post" style={{ maxWidth: '100%', borderRadius: '8px' }} />
        </div>
      )}

      <button onClick={handleSave}>Save Changes</button>
    </div>
  );
};

export default EditPost;
