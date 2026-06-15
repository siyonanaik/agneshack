import { useState, useEffect } from 'react';
import { matchVideosToFindings } from '../data/videoLibrary';

function VideoCard({ video, isActive, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl border overflow-hidden cursor-pointer transition-all ${
        isActive
          ? 'border-blue-400 ring-2 ring-blue-200 shadow-md'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      {/* Thumbnail area */}
      <div className="relative bg-gray-900" style={{ paddingTop: '56.25%' }}>
        {video.thumbnail ? (
          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        )}
        <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
          {video.duration || '5:00'}
        </span>
        {isActive && (
          <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
            Playing
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3 bg-white">
        <h4 className="text-sm font-semibold text-gray-800 line-clamp-1">{video.title}</h4>
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{video.description}</p>
        <div className="flex items-center gap-2 mt-2">
          {video.language && (
            <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">
              {video.language}
            </span>
          )}
          {video.category && (
            <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
              {video.category}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function VideoPlayer({ video }) {
  if (!video) return null;

  const isYouTube = video.url && (video.url.includes('youtube') || video.url.includes('youtu.be'));
  const isVimeo = video.url && video.url.includes('vimeo');

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-black">
      <div className="relative" style={{ paddingTop: '56.25%' }}>
        {isYouTube ? (
          <iframe
            src={video.url}
            title={video.title}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : isVimeo ? (
          <iframe
            src={video.url}
            title={video.title}
            className="absolute inset-0 w-full h-full"
            allowFullScreen
          />
        ) : (
          <video
            controls
            autoPlay
            className="absolute inset-0 w-full h-full"
            src={video.url}
          >
            Your browser does not support video playback.
          </video>
        )}
      </div>
      <div className="p-4 bg-white">
        <h3 className="text-sm font-semibold text-gray-800">{video.title}</h3>
        <p className="text-xs text-gray-500 mt-1">{video.description}</p>
      </div>
    </div>
  );
}

function VideoExplanation({ findings, language = 'English' }) {
  const [videos, setVideos] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [showList, setShowList] = useState(false);

  // Match videos when component mounts or findings change
  useEffect(() => {
    const matched = matchVideosToFindings(findings, language);
    setVideos(matched);
    if (matched.length > 0) {
      setActiveVideo(matched[0]);
    }
  }, [findings, language]);

  const handleVideoSelect = (video) => {
    setActiveVideo(video);
    setShowList(false);
  };

  if (!findings || findings.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-5 py-3 border-b border-purple-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Video Explanations</h3>
              <p className="text-xs text-gray-400">Watch to understand your condition better</p>
            </div>
          </div>
          <button
            onClick={() => setShowList(!showList)}
            className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
          >
            {showList ? 'Hide' : 'Show All'}
            <svg className={`w-3 h-3 transition-transform ${showList ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Active Video Player */}
      {activeVideo && (
        <div className="p-4">
          <VideoPlayer video={activeVideo} />
        </div>
      )}

      {/* Video List */}
      {showList && (
        <div className="px-4 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {videos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                isActive={activeVideo?.id === video.id}
                onClick={() => handleVideoSelect(video)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoExplanation;