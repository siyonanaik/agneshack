import { useState, useRef, useCallback, useEffect } from 'react';
import { extractTextFromFile } from '../utils/extractText';

const ACCEPTED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/bmp',
];

function CameraScanner({ onTextExtracted, onClose }) {
  const [stream, setStream] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const [zoom, setZoom] = useState(0);
  const [torchOn, setTorchOn] = useState(false);
  const [captureQuality, setCaptureQuality] = useState('high');
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const previewRef = useRef(null);

  const qualityMap = {
    low: 0.5,
    medium: 0.75,
    high: 1.0,
  };

  // Start camera
  const startCamera = useCallback(async (mode = facingMode) => {
    setCameraError(null);
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      const constraints = {
        video: {
          facingMode: mode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      };

      // Add zoom constraint if available
      if (zoom > 0) {
        constraints.video.zoom = zoom;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: constraints,
        audio: false,
      });

      setStream(mediaStream);
      setIsCameraActive(true);
      setCapturedImage(null);
    } catch (err) {
      console.error('Camera error:', err);
      if (err.name === 'NotAllowedError') {
        setCameraError('Camera access denied. Please allow camera permissions and try again.');
      } else if (err.name === 'NotFoundError') {
        setCameraError('No camera found on this device.');
      } else {
        setCameraError(`Could not start camera: ${err.message}`);
      }
    }
  }, [stream, facingMode, zoom]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  }, [stream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Toggle torch
  const toggleTorch = useCallback(async () => {
    if (stream) {
      const track = stream.getVideoTracks()[0];
      if (track) {
        try {
          await track.applyConstraints({
            advanced: [{ torch: !torchOn }],
          });
          setTorchOn(!torchOn);
        } catch (err) {
          console.error('Torch error:', err);
        }
      }
    }
  }, [stream, torchOn]);

  // Switch camera (front/back)
  const switchCamera = useCallback(() => {
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newMode);
    startCamera(newMode);
  }, [facingMode, startCamera]);

  // Capture photo
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL('image/jpeg', qualityMap[captureQuality] || 0.9);
    setCapturedImage(dataUrl);
    stopCamera();
  }, [captureQuality, stopCamera]);

  // Retake photo
  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  // Process captured image
  const processImage = useCallback(async (dataUrl) => {
    setIsProcessing(true);
    try {
      // Convert data URL to Blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });

      const extractedText = await extractTextFromFile(file);
      if (!extractedText || extractedText.trim().length === 0) {
        setCameraError('No text detected in the image. Please try capturing again with better lighting.');
      } else {
        onTextExtracted(extractedText, 'camera-capture.jpg');
      }
    } catch (err) {
      console.error('Image processing error:', err);
      setCameraError('Failed to process the captured image.');
    } finally {
      setIsProcessing(false);
    }
  }, [onTextExtracted]);

  // Handle captured image click (proceed to analysis)
  const handleCapturedImageConfirm = useCallback(() => {
    if (capturedImage) {
      processImage(capturedImage);
    }
  }, [capturedImage, processImage]);

  // Handle zoom change
  const handleZoomChange = useCallback((e) => {
    const newZoom = parseFloat(e.target.value);
    setZoom(newZoom);
    if (stream) {
      const track = stream.getVideoTracks()[0];
      if (track) {
        try {
          track.applyConstraints({
            advanced: [{ zoom: newZoom }],
          });
        } catch (err) {
          // Zoom not supported
        }
      }
    }
  }, [stream]);

  // Draw video to canvas for live preview
  useEffect(() => {
    if (videoRef.current && stream && !capturedImage) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, capturedImage]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-white p-2 rounded-full bg-white/10 backdrop-blur-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h3 className="text-white font-semibold text-sm">Document Scanner</h3>
          <div className="w-9" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Camera View / Preview */}
      <div className="flex-1 relative flex items-center justify-center bg-black">
        {cameraError && !capturedImage ? (
          <div className="text-center px-6">
            <svg className="w-16 h-16 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.27 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-red-300 text-sm mb-4">{cameraError}</p>
            <button
              onClick={() => startCamera()}
              className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg text-sm"
            >
              Try Again
            </button>
          </div>
        ) : capturedImage ? (
          /* Captured Image Preview */
          <div ref={previewRef} className="relative max-h-full">
            <img
              src={capturedImage}
              alt="Captured document"
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
            />
            {/* Scan line effect */}
            <div className="absolute inset-0 rounded-lg border-2 border-blue-400/50 pointer-events-none" />
          </div>
        ) : (
          /* Live Camera Feed */
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="max-w-full max-h-[70vh] object-cover rounded-lg"
          />
        )}

        {/* Camera guide overlay */}
        {!capturedImage && !cameraError && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-72 h-96 border-2 border-white/40 rounded-lg relative">
              {/* Corner markers */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-3 border-l-3 border-blue-400" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-3 border-r-3 border-blue-400" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-3 border-l-3 border-blue-400" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-3 border-r-3 border-blue-400" />
              <p className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-white/70 text-xs whitespace-nowrap">
                Position document within the frame
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Processing overlay */}
      {isProcessing && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
          <div className="text-center">
            <div className="w-12 h-12 border-3 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-3" />
            <p className="text-white text-sm font-medium">Processing image...</p>
            <p className="text-white/60 text-xs mt-1">Extracting text from document</p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-black/80 backdrop-blur-sm px-4 py-6 pb-8">
        {capturedImage ? (
          /* Post-capture controls */
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={retakePhoto}
              className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={handleCapturedImageConfirm}
              disabled={isProcessing}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-medium text-sm disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : 'Analyze Document'}
            </button>
          </div>
        ) : (
          /* Camera controls */
          <div className="flex items-center justify-center gap-8">
            {/* Torch toggle */}
            <button
              onClick={toggleTorch}
              className={`w-10 h-10 rounded-full flex items-center justify-center ${torchOn ? 'bg-yellow-400 text-yellow-900' : 'bg-white/10 text-white'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>

            {/* Capture button */}
            <button
              onClick={capturePhoto}
              disabled={isCameraActive === false}
              className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center disabled:opacity-30"
            >
              <div className="w-13 h-13 rounded-full bg-white" />
            </button>

            {/* Switch camera */}
            <button
              onClick={switchCamera}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        )}

        {/* Zoom slider (only when camera is active) */}
        {!capturedImage && isCameraActive && (
          <div className="mt-4 px-8">
            <input
              type="range"
              min="1"
              max="5"
              step="0.1"
              value={zoom || 1}
              onChange={handleZoomChange}
              className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

export default CameraScanner;