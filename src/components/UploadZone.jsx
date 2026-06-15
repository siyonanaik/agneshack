import { useState, useCallback } from 'react';
import { extractTextFromFile } from '../utils/extractText';

const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/bmp',
  'image/tiff',
  'image/webp',
];

const ACCEPTED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff', '.tif', '.webp'];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

function UploadZone({ onTextExtracted }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState(null);

  const validateFile = (file) => {
    if (!file) return 'No file selected.';

    const fileType = file.type;
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

    if (!ACCEPTED_MIME_TYPES.includes(fileType) && !ACCEPTED_EXTENSIONS.includes(fileExtension)) {
      return `Unsupported file type. Please upload a PDF or image file (${ACCEPTED_EXTENSIONS.join(', ')}).`;
    }

    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds 20MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB.`;
    }

    return null;
  };

  const processFile = async (file) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsLoading(true);
    setProgress(0);
    setFileName(file.name);

    try {
      const extractedText = await extractTextFromFile(file);
      if (!extractedText || extractedText.trim().length === 0) {
        setError('No text could be extracted from this file. It may be scanned as an image without OCR-readable text.');
        setIsLoading(false);
        setFileName(null);
        return;
      }
      onTextExtracted(extractedText, file.name);
    } catch (err) {
      console.error('Extraction error:', err);
      setError(`Failed to extract text: ${err.message || 'Please try another file.'}`);
      setFileName(null);
    } finally {
      setIsLoading(false);
      setProgress(100);
    }
  };

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }, []);

  const handleFileInput = useCallback((e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  }, []);

  const handleButtonClick = () => {
    const fileInput = document.getElementById('file-upload-input');
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleReset = () => {
    setError(null);
    setFileName(null);
    setProgress(0);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
          transition-all duration-300 ease-in-out
          ${isDragging
            ? 'border-blue-500 bg-blue-50 scale-[1.02]'
            : isLoading
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-70'
              : error
                ? 'border-red-300 bg-red-50/50 hover:border-red-400 hover:bg-red-50'
                : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50/50 hover:shadow-md'
          }
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={!isLoading ? handleButtonClick : undefined}
      >
        <input
          id="file-upload-input"
          type="file"
          accept={ACCEPTED_EXTENSIONS.join(',')}
          onChange={handleFileInput}
          className="hidden"
          disabled={isLoading}
        />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative w-16 h-16 mb-4">
              <svg className="animate-spin w-full h-full text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-base font-semibold text-gray-700 mb-1">
              {fileName ? `Processing ${fileName}` : 'Extracting text...'}
            </p>
            <p className="text-sm text-gray-500 mb-3">
              {progress < 30 ? 'Reading file...' : progress < 70 ? 'Extracting text...' : 'Almost done...'}
            </p>
            <div className="w-64 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-4">
            <svg className="w-14 h-14 text-red-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.27 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-base font-semibold text-red-700 mb-1">Oops! Something went wrong</p>
            <p className="text-sm text-red-600 mb-4 max-w-sm">{error}</p>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleReset(); }}
              className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-base font-semibold text-gray-700 mb-1">
              {isDragging ? 'Drop your file here' : 'Drag & drop your medical report'}
            </p>
            <p className="text-sm text-gray-500 mb-3">or</p>
            <button
              type="button"
              className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
              onClick={(e) => {
                e.stopPropagation();
                handleButtonClick();
              }}
            >
              Browse Files
            </button>
            <p className="text-xs text-gray-400 mt-4">
              Supports: PDF, PNG, JPG, GIF, BMP, TIFF, WEBP (max 20MB)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadZone;