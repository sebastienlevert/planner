import type { DriveItem } from '../services/onedrive.service';

export interface PhotoState {
  selectedFolderId: string | null;
  selectedFolderName: string | null;
  photos: DriveItem[];
  currentPhotoIndex: number;
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface PhotoContextType extends PhotoState {
  setSelectedFolder: (folderId: string, folderName: string) => void;
  loadPhotos: () => Promise<void>;
  nextPhoto: () => void;
  previousPhoto: () => void;
  togglePlayback: () => void;
  setPhotoIndex: (index: number) => void;
}
