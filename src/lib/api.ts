const API_BASE = '';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('pw_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T = any>(method: string, url: string, data?: any, params?: Record<string, any>): Promise<T> {
  let fullUrl = API_BASE + url;
  if (params && Object.keys(params).length > 0) {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    fullUrl += (fullUrl.includes('?') ? '&' : '?') + qs;
  }

  const res = await fetch(fullUrl, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: data !== undefined ? JSON.stringify(data) : undefined,
  });

  if (res.status === 401) {
    localStorage.removeItem('pw_token');
    localStorage.removeItem('pw_user');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw errData;
  }

  return res.json();
}

export const get = (url: string, params?: Record<string, any>) => request('GET', url, undefined, params);
export const post = (url: string, data?: any) => request('POST', url, data);
export const put = (url: string, data?: any) => request('PUT', url, data);
export const del = (url: string) => request('DELETE', url);
export const patch = (url: string, data?: any) => request('PATCH', url, data);

// Token management
export const tokenManager = {
  save(token: string, user: any) {
    localStorage.setItem('pw_token', token);
    localStorage.setItem('pw_user', JSON.stringify(user));
  },
  get() {
    return localStorage.getItem('pw_token');
  },
  getUser() {
    const raw = localStorage.getItem('pw_user');
    return raw ? JSON.parse(raw) : null;
  },
  clear() {
    localStorage.removeItem('pw_token');
    localStorage.removeItem('pw_user');
  },
};
