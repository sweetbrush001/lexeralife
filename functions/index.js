const functions = require("firebase-functions");
const admin = require("firebase-admin");
const pdf = require("pdf-parse");
const {Storage} = require("@google-cloud/storage");
const path = require("path");
const os = require("os");
const fs = require("fs");

admin.initializeApp();
const storage = new Storage();

exports.extractTextFromPDF = functions.storage
    .object()
    .onFinalize(async (object) => {
      const filePath = object.name;
      const bucket = storage.bucket(object.bucket);
      const tempFilePath = path.join(os.tmpdir(), path.basename(filePath));

      // Download the file to a temporary location
      await bucket.file(filePath).download({destination: tempFilePath});

      // Extract text from the PDF
      const dataBuffer = fs.readFileSync(tempFilePath);
      const data = await pdf(dataBuffer);

      // Save the extracted text to Firestore
      await admin.firestore().collection("extractedTexts").add({
        text: data.text,
        filePath,
        userId: filePath.split("/")[1], // Extract userId from file path
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Clean up the temporary file
      fs.unlinkSync(tempFilePath);

      return null;
    });
