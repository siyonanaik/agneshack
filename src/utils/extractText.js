import * as pdfjs from 'pdfjs-dist';

// Set the worker source for pdf.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

import Tesseract from 'tesseract.js';

/**
 * Extract text from a PDF file using pdf.js
 * @param {File} file - The PDF file to extract text from
 * @returns {Promise<string>} - The extracted text
 */
export async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer();

  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => item.str)
      .join(' ');
    fullText += pageText + '\n';
  }

  return fullText.trim();
}

/**
 * Extract text from an image file using Tesseract.js (OCR)
 * @param {File} file - The image file to extract text from
 * @returns {Promise<string>} - The extracted text
 */
export async function extractTextFromImage(file) {
  const { data: { text } } = await Tesseract.recognize(file, 'eng', {
    logger: (m) => {
      // Progress can be tracked here if needed
    },
  });

  return text.trim();
}

/**
 * Extract text from a file based on its MIME type
 * @param {File} file - The file to extract text from
 * @returns {Promise<string>} - The extracted text
 */
export async function extractTextFromFile(file) {
  const fileType = file.type;

  if (fileType === 'application/pdf') {
    return extractTextFromPDF(file);
  } else if (fileType.startsWith('image/')) {
    return extractTextFromImage(file);
  } else {
    throw new Error(`Unsupported file type: ${fileType}`);
  }
}