/**
 * apiClient.ts — HTTP Client tập trung với JWT Bearer Token tự động
 *
 * Hành vi khi token hết hạn:
 *  - access_token hết hạn (15 phút): Silent-refresh tự động, người dùng không hay biết
 *  - refresh_token hết hạn (30 ngày): Toast đỏ "Phiên đăng nhập đã hết hạn" → redirect /login sau 3 giây
 */

const API_BASE = 'http://localhost:4000/v1';

// ─── Token Storage ──────────────────────────────────────────────────────────

export const tokenStorage = {
  getAccessToken: (): string | null => localStorage.getItem('t_access_token'),
  getRefreshToken: (): string | null => localStorage.getItem('t_refresh_token'),
  setTokens: (access: string, refresh: string) => {
    localStorage.setItem('t_access_token', access);
    localStorage.setItem('t_refresh_token', refresh);
  },
  clearTokens: () => {
    localStorage.removeItem('t_access_token');
    localStorage.removeItem('t_refresh_token');
    localStorage.removeItem('t_user');
  },
};

// ─── Session Expired Toast ──────────────────────────────────────────────────

let sessionExpiredToastShown = false;

function showSessionExpiredToast() {
  if (sessionExpiredToastShown) return;
  sessionExpiredToastShown = true;

  // Tạo toast element
  const toast = document.createElement('div');
  toast.id = 'session-expired-toast';
  toast.style.cssText = `
    position: fixed;
    top: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #dc2626, #b91c1c);
    color: white;
    padding: 16px 28px;
    border-radius: 12px;
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 15px;
    font-weight: 500;
    box-shadow: 0 8px 32px rgba(220, 38, 38, 0.4);
    z-index: 99999;
    display: flex;
    align-items: center;
    gap: 12px;
    animation: slideDownToast 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    max-width: 480px;
    text-align: center;
  `;

  // Thêm CSS animation
  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      @keyframes slideDownToast {
        from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        to   { opacity: 1; transform: translateX(-50%) translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }

  toast.innerHTML = `
    <span style="font-size: 20px;">🔒</span>
    <div>
      <div style="font-weight: 600; margin-bottom: 2px;">Phiên đăng nhập đã hết hạn</div>
      <div style="font-size: 13px; opacity: 0.9;">Đang chuyển về trang đăng nhập sau 3 giây...</div>
    </div>
  `;

  document.body.appendChild(toast);

  // Xóa token và redirect sau 3 giây
  tokenStorage.clearTokens();

  setTimeout(() => {
    toast.remove();
    sessionExpiredToastShown = false;
    window.location.href = '/login';
  }, 3000);
}

// ─── Token Refresh ──────────────────────────────────────────────────────────

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: any) => void; reject: (reason?: any) => void }> = [];

function processQueue(error: any) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(null);
    }
  });
  failedQueue = [];
}

async function silentRefreshToken(): Promise<string> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token');

  const res = await fetch(`http://localhost:4000/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!res.ok) throw new Error('Refresh failed');

  const data = await res.json();
  tokenStorage.setTokens(data.access_token, data.refresh_token);
  return data.access_token;
}

// ─── Core Request Function ──────────────────────────────────────────────────

async function request<T = any>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const accessToken = tokenStorage.getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  // Xử lý 401 (token hết hạn hoặc không hợp lệ)
  if (res.status === 401 && retry) {
    if (isRefreshing) {
      // Đang refresh → queue request lại
      return new Promise<T>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() =>
        request<T>(path, options, false),
      );
    }

    isRefreshing = true;

    try {
      await silentRefreshToken();
      processQueue(null);
      isRefreshing = false;
      return request<T>(path, options, false);
    } catch (err) {
      processQueue(err);
      isRefreshing = false;
      // Refresh token cũng hết hạn → hiện toast và redirect
      showSessionExpiredToast();
      throw new Error('SESSION_EXPIRED');
    }
  }

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({ message: 'Lỗi không xác định' }));
    throw new Error(errBody.message || `HTTP ${res.status}`);
  }

  // Trả về null nếu response body rỗng (ví dụ: 204 No Content)
  const text = await res.text();
  if (!text) return null as T;

  return JSON.parse(text) as T;
}

// ─── Public API Client ──────────────────────────────────────────────────────

export const apiClient = {
  get: <T = any>(path: string, options?: RequestInit) =>
    request<T>(path, { ...options, method: 'GET' }),

  post: <T = any>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  patch: <T = any>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T = any>(path: string, options?: RequestInit) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};
