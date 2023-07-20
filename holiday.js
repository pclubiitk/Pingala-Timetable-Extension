import Tesseract from './node_modules/tesseract.js';
import * as pdfjsLib from './node_modules/pdfjs-dist';

const pdfURL = 'https://www.iitk.ac.in/doaa/data/Holidays-2023.pdf';
alert("HI");
function extractPdfText(pdfURL){
    fetch(pdfURL)
    .then((response) => response.arrayBuffer())
    .then((arrayBuffer) => {
      const pdfBlob = new Blob([arrayBuffer], { type: "application/pdf" });
      return pdfToImage(pdfBlob);
    })
    .then((imageBlob) => {
      return blobToBase64(imageBlob);
    })
    .then((base64data) => {
      return Tesseract.recognize(base64data, "eng");
    })
    .then(({ data: { text } }) => {
      // 'text' contains the extracted text from the image
      console.log("Extracted text:", text);
    })
    .catch((error) => {
      console.error("OCR Error:", error);
    });
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
  });
function pdfToImage(pdfBlob) {
return new Promise((resolve, reject) => {
    // Create a new pdfjsLib.getDocument instance using the PDF Blob
    pdfjsLib.getDocument({ data: pdfBlob })
    .promise
    .then((pdf) => {
        return pdf.getPage(1);
    })
    .then((page) => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        // Set the canvas size to match the PDF page's size
        const viewport = page.getViewport({ scale: 1 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Render the PDF page onto the canvas
        const renderContext = {
        canvasContext: context,
        viewport: viewport,
        };
        return page.render(renderContext).promise;
    })
    .then(() => {
        // Convert the canvas to a Blob as an image
        canvas.toBlob((imageBlob) => {
        resolve(imageBlob);
        });
    })
    .catch((error) => {
        reject(error);
    });
});
}
}
extractPdfText(pdfURL);
