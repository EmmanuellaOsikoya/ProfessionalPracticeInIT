// Opens or creates the IndexedDB database
export const openDb = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('imageDB', 1);
  
      // Creates the object store if it doesn't exist
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('images')) {
          const store = db.createObjectStore('images', { keyPath: 'id' });
          store.createIndex('id', 'id', { unique: true });
        }
      };
  
      request.onsuccess = () => {
        resolve(request.result);
      };
  
      request.onerror = (e) => {
        reject(e.target.error);
      };
    });
  };
  
  // Stores an image in the IndexedDB
  export const storeImage = (db, imageFile, imageId) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('images', 'readwrite');
      const store = transaction.objectStore('images');
      const imageData = {
        id: imageId,
        image: imageFile, // Stores an image as a Blob
      };
  
      const request = store.put(imageData);
      request.onsuccess = () => {
        resolve('Image stored successfully!');
      };
  
      request.onerror = (e) => {
        reject(e.target.error);
      };
    });
  };
  
  // Retrieves an image from the IndexedDB by id
  export const getImage = (db, imageId) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('images', 'readonly');
      const store = transaction.objectStore('images');
      const request = store.get(imageId);
  
      request.onsuccess = (e) => {
        resolve(e.target.result); // Returns the image data
      };
  
      request.onerror = (e) => {
        reject(e.target.error);
      };
    });
  };