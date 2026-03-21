import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { graphService } from '../services/graph.service';

/**
 * Fetches and caches Microsoft Graph profile photos for all authenticated accounts.
 * Returns a map of homeAccountId → object URL.
 */
export function useProfilePhotos() {
  const { accounts, isAuthenticated, getAccessToken } = useAuth();
  const [photos, setPhotos] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isAuthenticated || accounts.length === 0) return;

    let cancelled = false;

    const fetchPhotos = async () => {
      const result: Record<string, string> = {};

      await Promise.all(
        accounts.map(async (account) => {
          try {
            const token = await getAccessToken(account.homeAccountId);
            const photoUrl = await graphService.getProfilePhoto(token);
            if (photoUrl && !cancelled) {
              result[account.homeAccountId] = photoUrl;
            }
          } catch {
            // No photo available — will fall back to initials
          }
        })
      );

      if (!cancelled) setPhotos(result);
    };

    fetchPhotos();

    return () => {
      cancelled = true;
      // Revoke object URLs to prevent memory leaks
      Object.values(photos).forEach((url) => URL.revokeObjectURL(url));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts.length, isAuthenticated]);

  return photos;
}
