import * as DocumentPicker from 'expo-document-picker';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../firebaseConfig';

export const pickAndUploadFile = async (userId) => {
    try {
        const result = await DocumentPicker.getDocumentAsync({
            type: 'application/pdf', // Allow PDFs and other document types
        });

        if (result.type === 'success') {
            const response = await fetch(result.uri);
            const blob = await response.blob();
            const fileRef = ref(storage, `uploads/${userId}/${result.name}`);
            await uploadBytes(fileRef, blob);
            const downloadURL = await getDownloadURL(fileRef);
            return downloadURL;
        }
        return null;
    } catch (error) {
        console.error('Error uploading file:', error);
        return null;
    }
};