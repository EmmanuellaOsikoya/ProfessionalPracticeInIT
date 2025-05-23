import { collection, addDoc, serverTimestamp, updateDoc, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

// Creates a new post with optional image URL
export const createPost = async (content, imageUrl = null) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const postData = {
    userId: user.uid,
    userName: user.displayName || user.email,
    userPhotoURL: user.photoURL || null,
    content: content,
    timestamp: serverTimestamp(),
    likes: [],
    comments: []
  };

  // Adds the image URL if provided
  if (imageUrl) {
    postData.imageUrl = imageUrl;
  }

  return await addDoc(collection(db, 'posts'), postData);
};

// Updates the existing post with optional new image
export const updatePost = async (postId, content, imageUrl = null) => {
  const postRef = doc(db, 'posts', postId);
  const postSnap = await getDoc(postRef);
  
  if (!postSnap.exists()) {
    throw new Error('Post not found');
  }
  
  const postData = {
    content: content,
    lastEdited: serverTimestamp()
  };
  
  // Updates the image URL if provided
  if (imageUrl !== undefined) {
    postData.imageUrl = imageUrl;
  }
  
  return await updateDoc(postRef, postData);
};

// Deletes a post
export const deletePost = async (postId) => {
  return await deleteDoc(doc(db, 'posts', postId));
};

// Gets a single post by ID
export const getPost = async (postId) => {
  const postRef = doc(db, 'posts', postId);
  const postSnap = await getDoc(postRef);
  
  if (!postSnap.exists()) {
    throw new Error('Post not found');
  }
  
  return {
    id: postSnap.id,
    ...postSnap.data()
  };
};