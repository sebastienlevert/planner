import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, Maximize, Folder as FolderIcon } from 'lucide-react';
import { usePhoto } from '../../contexts/PhotoContext';
import { useAuth } from '../../contexts/AuthContext';
import { onedriveService } from '../../services/onedrive.service';
import { appConfig } from '../../config/app.config';

interface PhotoSlideshowProps {
  onSelectFolder: () => void;
}

export const PhotoSlideshow: React.FC<PhotoSlideshowProps> = ({ onSelectFolder }) => {
  const { getAccessToken, accounts } = useAuth();
  const {
    photos,
    currentPhotoIndex,
    isPlaying,
    selectedFolderName,
    nextPhoto,
    previousPhoto,
    togglePlayback,
  } = usePhoto();

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const currentPhoto = photos[currentPhotoIndex];

  // Auto-advance slideshow
  useEffect(() => {
    if (!isPlaying || photos.length === 0) return;

    const interval = setInterval(() => {
      nextPhoto();
    }, appConfig.photos.slideshowInterval);

    return () => clearInterval(interval);
  }, [isPlaying, photos.length, nextPhoto]);

  // Load current photo
  useEffect(() => {
    loadPhoto();
  }, [currentPhotoIndex, currentPhoto]);

  const loadPhoto = async () => {
    if (!currentPhoto || accounts.length === 0) {
      setImageUrl(null);
      return;
    }

    setIsLoading(true);

    try {
      // Try thumbnail first for faster loading
      const thumbnailUrl = onedriveService.getThumbnailUrl(currentPhoto);

      if (thumbnailUrl) {
        setImageUrl(thumbnailUrl);
      } else if (currentPhoto['@microsoft.graph.downloadUrl']) {
        setImageUrl(currentPhoto['@microsoft.graph.downloadUrl']);
      } else {
        // Fetch download URL
        const accessToken = await getAccessToken(accounts[0].homeAccountId);
        const downloadUrl = await onedriveService.getImageDownloadUrl(
          currentPhoto.id,
          accessToken
        );
        setImageUrl(downloadUrl);
      }
    } catch (error) {
      console.error('Failed to load photo:', error);
      setImageUrl(null);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (photos.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <FolderIcon size={64} className="mx-auto mb-4 opacity-50" />
          <p className="text-xl mb-6">No folder selected</p>
          <button onClick={onSelectFolder} className="btn-primary">
            Select Photo Folder
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-6">
        <div className="flex items-center justify-between text-white">
          <div>
            <h3 className="font-semibold text-lg">{selectedFolderName}</h3>
            <p className="text-sm opacity-75">
              {currentPhotoIndex + 1} of {photos.length}
            </p>
          </div>
          <button
            onClick={onSelectFolder}
            className="btn-secondary bg-white/20 text-white hover:bg-white/30 border-white/30"
          >
            Change Folder
          </button>
        </div>
      </div>

      {/* Photo Display */}
      <div className="flex-1 flex items-center justify-center p-4 relative">
        {isLoading ? (
          <div className="loading-spinner"></div>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={currentPhoto?.name}
            className="max-w-full max-h-full object-contain fade-enter-active"
            onClick={togglePlayback}
          />
        ) : (
          <p className="text-white">Failed to load image</p>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/70 to-transparent p-6">
        <div className="flex items-center justify-center gap-4">
          {/* Previous */}
          <button
            onClick={previousPhoto}
            className="btn-icon bg-white/20 text-white hover:bg-white/30 touch-optimized"
            aria-label="Previous photo"
          >
            <ChevronLeft size={32} />
          </button>

          {/* Play/Pause */}
          <button
            onClick={togglePlayback}
            className="btn-icon bg-white/20 text-white hover:bg-white/30 w-16 h-16 touch-optimized"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={32} /> : <Play size={32} />}
          </button>

          {/* Next */}
          <button
            onClick={nextPhoto}
            className="btn-icon bg-white/20 text-white hover:bg-white/30 touch-optimized"
            aria-label="Next photo"
          >
            <ChevronRight size={32} />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="btn-icon bg-white/20 text-white hover:bg-white/30 touch-optimized ml-4"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            <Maximize size={24} />
          </button>
        </div>

        {/* Photo name */}
        {currentPhoto && (
          <p className="text-center text-white text-sm mt-4 opacity-75">
            {currentPhoto.name}
          </p>
        )}
      </div>
    </div>
  );
};
