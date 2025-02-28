

import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import Pdf from "react-native-pdf";

//Extracting text from a pdf file

const extractTextFromPDF = async (pdfUri) => {
    try{
        const {uri} = await FileSystem.downloadAsync(
            pdfUri, FileSystem.documentDirectory + "temp.pdf" 
        );
        return new Promise((resolve, reject) => {
            const pdf = new Pdf({uri});
            pdf.getTextContent().then((textContent) => {
                const text = textContent.items.map((item) => item.str).join(" ");
                resolve(text);
            });


        });
    } catch (error){
        console.error("Error extracting text from PDF:", error);
        return null;
      
    }
};


// Extracting text from a TXT file

const extractTextFromTXT = async (txtUri) => {
    try {
      const content = await FileSystem.readAsStringAsync(txtUri);
      return content;
    } catch (error) {
      console.error("Error reading TXT file:", error);
      return null;
    }
  };

//Handles file picking and processing

export const pickAndProcessFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
        type: "*/*" , //Allowing all file types
    });

    if (result.type === "success") {
        const { uri, mimeType } = result;
    
        if (mimeType === "application/pdf") {
          return await extractTextFromPDF(uri);
        } else if (mimeType === "text/plain") {
          return await extractTextFromTXT(uri);
        } else {
          console.warn("Unsupported file type:", mimeType);
          return null;
        }
      }
      return null;
};