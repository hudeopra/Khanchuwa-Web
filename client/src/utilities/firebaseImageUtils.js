import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { app } from "../firebase";

/**
 * Uploads an image to Firebase Storage.
 * @param {File} file - The image file to upload.
 * @returns {Promise<string>} - A promise that resolves to the download URL of the uploaded image.
 */
export const uploadImageToFirebase = (file) => {
  return new Promise((resolve, reject) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      null,
      (error) => {
        console.error("Image upload failed:", error);
        reject(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(resolve).catch(reject);
      }
    );
  });
};

/**
 * Deletes an image from Firebase Storage.
 * @param {string} downloadURL - The download URL of the image to delete.
 * @returns {Promise<void>} - A promise that resolves when the image is deleted.
 */
export const deleteImageFromFirebase = (downloadURL) => {
  return new Promise((resolve, reject) => {
    const storage = getStorage(app);
    const filePath = downloadURL.split("/o/")[1].split("?")[0];
    const fileRef = ref(storage, filePath);

    deleteObject(fileRef)
      .then(() => {
        console.log("Image deleted successfully:", filePath);
        resolve();
      })
      .catch((error) => {
        console.error("Error deleting image:", error);
        reject(error);
      });
  });
};