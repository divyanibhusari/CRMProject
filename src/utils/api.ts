const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('vip_crm_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('vip_crm_token', token);
}

export function removeAuthToken() {
  localStorage.removeItem('vip_crm_token');
}

export async function apiRequest<T = any>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    if (!response.ok) {
      if (response.status === 401) {
        // Token might be expired, log out
        removeAuthToken();
        // Dispatches event to alert App component of logout
        window.dispatchEvent(new Event('auth-expired'));
      }
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.error || 'API Request failed');
    }
    return await response.json();
  } catch (error: any) {
    console.error(`API Error on ${method} ${endpoint}:`, error);
    throw error;
  }
}
