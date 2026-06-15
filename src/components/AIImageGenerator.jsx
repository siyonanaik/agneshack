import { useState } from 'react';
import { generateImage, generateMedicalImage } from '../utils/imageApi';

function AIImageGenerator({ finding, altText, className = '' }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (imageUrl) return; // Already generated
    
    setLoading(true);
    setError(null);

    try {
      const result = await generateMedicalImage(finding);
      // Handle different response formats
      const url = result.url || result.image_url || result.output?.[0]?.url || result.data?.[0]?.url;
      if (url) {
        setImageUrl(url);
      } else {
        // If response has b64_json format
        if (result.b64_json || result.data?.[0]?.b64_json) {
          const b64 = result.b64_json || result.data[0].b64_json;
          setImageUrl(`data:image/png;base64,${b64}`);
        }
      }
    } catch (err) {
      console.error('Image generation failed:', err);
      setError('Failed to generate image');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gray-100 rounded-lg text-gray-400 ${className}`}>
        <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-xs">{error}</span>
      </div>
    );
  }

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={altText || finding?.item || 'Medical illustration'}
        className={`w-full h-full object-cover ${className}`}
      />
    );
  }

  return (
    <button
      onClick={handleGenerate}
      className={`flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all ${className}`}
    >
      <svg className="w-8 h-8 text-purple-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span className="text-xs text-purple-600 font-medium">Generate AI Illustration</span>
    </button>
  );
}

export default AIImageGenerator;