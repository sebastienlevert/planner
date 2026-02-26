import { appConfig } from '../config/app.config';

export class GraphService {
  private baseUrl: string;

  constructor(baseUrl: string = appConfig.graph.baseUrl) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    accessToken: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${accessToken}`);
    headers.set('Content-Type', 'application/json');

    // Set timezone preference for date/time responses
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    headers.set('Prefer', `outlook.timezone="${userTimeZone}"`);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      // Handle no content responses
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      console.error('Graph API request failed:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string, accessToken: string): Promise<T> {
    return this.request<T>(endpoint, accessToken, { method: 'GET' });
  }

  async post<T>(endpoint: string, accessToken: string, body: any): Promise<T> {
    return this.request<T>(endpoint, accessToken, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async patch<T>(endpoint: string, accessToken: string, body: any): Promise<T> {
    return this.request<T>(endpoint, accessToken, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  async delete(endpoint: string, accessToken: string): Promise<void> {
    await this.request(endpoint, accessToken, { method: 'DELETE' });
  }

  // User operations
  async getMe(accessToken: string) {
    return this.get('/me', accessToken);
  }

  // Calendar operations
  async getCalendars(accessToken: string) {
    return this.get('/me/calendars', accessToken);
  }

  async getCalendar(calendarId: string, accessToken: string) {
    return this.get(`/me/calendars/${calendarId}`, accessToken);
  }

  async getEvents(calendarId: string, accessToken: string, startDateTime?: string, endDateTime?: string) {
    let endpoint = `/me/calendars/${calendarId}/events`;

    const params = new URLSearchParams();
    if (startDateTime && endDateTime) {
      params.append('$filter', `start/dateTime ge '${startDateTime}' and end/dateTime le '${endDateTime}'`);
    }
    params.append('$orderby', 'start/dateTime');
    params.append('$top', '100');

    const queryString = params.toString();
    if (queryString) {
      endpoint += `?${queryString}`;
    }

    return this.get(endpoint, accessToken);
  }

  async getCalendarView(accessToken: string, startDateTime: string, endDateTime: string) {
    const params = new URLSearchParams({
      startDateTime,
      endDateTime,
      $orderby: 'start/dateTime',
      $top: '100',
    });

    return this.get(`/me/calendarview?${params.toString()}`, accessToken);
  }

  async getCalendarViewForCalendar(calendarId: string, accessToken: string, startDateTime: string, endDateTime: string) {
    const params = new URLSearchParams({
      startDateTime,
      endDateTime,
      $orderby: 'start/dateTime',
      $top: '100',
    });

    return this.get(`/me/calendars/${calendarId}/calendarview?${params.toString()}`, accessToken);
  }

  async createEvent(calendarId: string, accessToken: string, event: any) {
    return this.post(`/me/calendars/${calendarId}/events`, accessToken, event);
  }

  async updateEvent(eventId: string, accessToken: string, updates: any) {
    return this.patch(`/me/events/${eventId}`, accessToken, updates);
  }

  async deleteEvent(eventId: string, accessToken: string) {
    return this.delete(`/me/events/${eventId}`, accessToken);
  }

  // OneDrive operations
  async getDriveRoot(accessToken: string) {
    return this.get('/me/drive/root', accessToken);
  }

  async getFolderChildren(folderId: string, accessToken: string) {
    return this.get(`/me/drive/items/${folderId}/children`, accessToken);
  }

  async getDriveItemsByPath(path: string, accessToken: string) {
    return this.get(`/me/drive/root:${path}:/children`, accessToken);
  }

  async getImageThumbnails(itemId: string, accessToken: string) {
    return this.get(`/me/drive/items/${itemId}/thumbnails`, accessToken);
  }

  async getImageContent(itemId: string, accessToken: string): Promise<Blob> {
    const url = `${this.baseUrl}/me/drive/items/${itemId}/content`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    return response.blob();
  }

  // Batch requests (for efficiency)
  async batchRequest(requests: any[], accessToken: string) {
    return this.post('/$batch', accessToken, {
      requests,
    });
  }
}

export const graphService = new GraphService();
