import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { graphService } from '../services/graph.service';
import { cacheService } from '../services/idb-cache.service';

/**
 * Fetches and caches Microsoft Graph profile photos for all authenticated accounts.
 * Returns a map of homeAccountId → object URL (or base64 data URL from cache).
 */
export function useProfilePhotos() {
  const { accounts, isAuthenticated, getAccessToken } = useAuth();
  const [photos, setPhotos] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isAuthenticated || accounts.length === 0) return;

    let cancelled = false;

    const fetchPhotos = async () => {
      const result: Record<string, string> = {};

      // 1. Load from IndexedDB cache first
      const cached = await cacheService.get<Record<string, string>>('profile-photos');
      if (cached && !cancelled) {
        setPhotos(cached.data);
        Object.assign(result, cached.data);
      }

      // 2. Fetch fresh from Graph in background
      const fresh: Record<string, string> = {};
      await Promise.all(
        accounts.map(async (account) => {
          try {
            const token = await getAccessToken(account.homeAccountId);
            const photoUrl = await graphService.getProfilePhoto(token);
            if (photoUrl && !cancelled) {
              // Convert blob URL to base64 for IndexedDB storage
              const resp = await fetch(photoUrl);
              const blob = await resp.blob();
              const base64 = await blobToBase64(blob);
              fresh[account.homeAccountId] = base64;
              URL.revokeObjectURL(photoUrl);
            }
          } catch {
            // No photo available — will fall back to initials
          }
        })
      );

      if (!cancelled && Object.keys(fresh).length > 0) {
        const { changed } = await cacheService.setIfChanged('profile-photos', fresh);
        if (changed || !cached) {
          setPhotos(fresh);
        }
      }
    };

    fetchPhotos();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts.length, isAuthenticated]);

  return photos;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
