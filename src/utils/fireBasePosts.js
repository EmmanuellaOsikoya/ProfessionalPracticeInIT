import { db, auth, storage } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

export const createPost = async (content, imageFile) => {
  const user = auth.currentUser;
  if (!user) return;

  let imageUrl = '';

  if (imageFile) {
    const imageRef = ref(storage, `postImages/${user.uid}/${uuidv4()}`);
    const snapshot = await uploadBytes(imageRef, imageFile);
    imageUrl = await getDownloadURL(snapshot.ref);
  }

  try {
    await addDoc(collection(db, 'posts'), {
      userId: user.uid,
      content,
      imageUrl,
      timestamp: serverTimestamp(),
    });
    console.log('Post successfully created!');
  } catch (error) {
    console.error('Error creating post:', error);
  }
};
