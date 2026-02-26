import { graphService } from './graph.service';
import { appConfig } from '../config/app.config';

export interface DriveItem {
  id: string;
  name: string;
  folder?: { childCount: number };
  file?: { mimeType: string };
  size?: number;
  webUrl?: string;
  thumbnails?: Array<{
    large?: { url: string };
    medium?: { url: string };
    small?: { url: string };
  }>;
  '@microsoft.graph.downloadUrl'?: string;
}

export class OneDriveService {
  // Get root folder
  async getRootFolder(accessToken: string): Promise<DriveItem> {
    return graphService.getDriveRoot(accessToken) as Promise<DriveItem>;
  }

  // Get folder contents
  async getFolderContents(folderId: string, accessToken: string): Promise<DriveItem[]> {
    try {
      const response: any = await graphService.getFolderChildren(folderId, accessToken);
      return response.value || [];
    } catch (error) {
      console.error('Failed to fetch folder contents:', error);
      throw error;
    }
  }

  // Get images from a folder
  async getImagesFromFolder(folderId: string, accessToken: string): Promise<DriveItem[]> {
    try {
      const items = await this.getFolderContents(folderId, accessToken);

      // Filter for image files
      const imageExtensions = appConfig.photos.supportedExtensions;
      const images = items.filter(item => {
        if (!item.file) return false;
        const extension = item.name.toLowerCase().match(/\.[^.]+$/)?.[0];
        return extension && imageExtensions.includes(extension);
      });

      // Fetch thumbnails for images
      const imagesWithThumbnails = await Promise.all(
        images.map(async image => {
          try {
            const thumbnails: any = await graphService.getImageThumbnails(image.id, accessToken);
            return {
              ...image,
              thumbnails: thumbnails.value,
            };
          } catch (error) {
            console.warn(`Failed to fetch thumbnails for ${image.name}:`, error);
            return image;
          }
        })
      );

      return imagesWithThumbnails;
    } catch (error) {
      console.error('Failed to fetch images:', error);
      throw error;
    }
  }

  // Get image download URL
  async getImageDownloadUrl(itemId: string, accessToken: string): Promise<string> {
    try {
      const response: any = await graphService.get(`/me/drive/items/${itemId}`, accessToken);
      return response['@microsoft.graph.downloadUrl'] || '';
    } catch (error) {
      console.error('Failed to get download URL:', error);
      throw error;
    }
  }

  // Navigate folder path
  async navigateToPath(path: string, accessToken: string): Promise<DriveItem[]> {
    try {
      const response: any = await graphService.getDriveItemsByPath(path, accessToken);
      return response.value || [];
    } catch (error) {
      console.error('Failed to navigate to path:', error);
      throw error;
    }
  }

  // Check if item is a folder
  isFolder(item: DriveItem): boolean {
    return Boolean(item.folder);
  }

  // Check if item is an image
  isImage(item: DriveItem): boolean {
    if (!item.file) return false;
    const extension = item.name.toLowerCase().match(/\.[^.]+$/)?.[0];
    return Boolean(extension && appConfig.photos.supportedExtensions.includes(extension));
  }

  // Get thumbnail URL (prefer large, fallback to medium, then small)
  getThumbnailUrl(item: DriveItem): string | null {
    if (!item.thumbnails || item.thumbnails.length === 0) return null;

    const thumbnail = item.thumbnails[0];
    return thumbnail.large?.url || thumbnail.medium?.url || thumbnail.small?.url || null;
  }
}

export const onedriveService = new OneDriveService();
