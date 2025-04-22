import React, { useState, useEffect } from 'react';
import { openDb, storeImage, getImage } from './indexDBHelper';  // Import the helper functions

const EditPost = () => {
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imageId, setImageId] = useState(''); // ID for storing the image in IndexedDB

  // Open the IndexedDB when the component mounts
  useEffect(() => {
    const fetchDb = async () => {
      const db = await openDb(); // Open the database
      console.log('IndexedDB opened', db);
    };
    fetchDb();
  }, []);

  // Handle image file selection
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    
    // Generate a unique imageId
    const newImageId = new Date().getTime().toString();
    setImageId(newImageId);

    // Create a URL for image preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result);  // Update the image URL for preview
    };
    reader.readAsDataURL(file);  // Convert the image to a base64 URL
    
    // Store the image in IndexedDB
    const db = await openDb();
    await storeImage(db, file, newImageId);  // Store the image as a Blob in IndexedDB
  };

  const handleSave = async () => {
    // Save content and imageId
    console.log('Content:', content);
    console.log('Image ID:', imageId); // You can use this ID to fetch the image later
    alert('Post saved successfully!');
  };

  const handleLoadImage = async () => {
    const db = await openDb();
    const imageData = await getImage(db, imageId);
    if (imageData) {
      const imageUrl = URL.createObjectURL(imageData.image);
      setImageUrl(imageUrl);  // Set the image URL to display it
    } else {
      console.log('Image not found in IndexedDB');
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
        <input type="file" onChange={handleImageChange} />
      </div>

      {/* Display the uploaded image if available */}
      {imageUrl && (
        <div>
          <img
            src={imageUrl}
            alt="Post"
            style={{ maxWidth: '100%', borderRadius: '8px' }}
          />
        </div>
      )}

      <button onClick={handleSave}>Save Changes</button>
      <button onClick={handleLoadImage}>Load Image from IndexedDB</button>
    </div>
  );
};

export default EditPost;
