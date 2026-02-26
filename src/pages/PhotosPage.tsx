import React, { useState } from 'react';
import { Image } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { LoginButton } from '../components/auth/LoginButton';
import { PhotoSlideshow } from '../components/photos/PhotoSlideshow';
import { FolderPicker } from '../components/photos/FolderPicker';

export const PhotosPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [isFolderPickerOpen, setIsFolderPickerOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md">
          <Image size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Photo Slideshow
          </h2>
          <p className="text-gray-600 mb-6">
            Sign in to view photos from your OneDrive folder.
          </p>
          <LoginButton />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <PhotoSlideshow onSelectFolder={() => setIsFolderPickerOpen(true)} />

      <FolderPicker
        isOpen={isFolderPickerOpen}
        onClose={() => setIsFolderPickerOpen(false)}
      />
    </div>
  );
};
