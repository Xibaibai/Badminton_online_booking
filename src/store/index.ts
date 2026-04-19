import type { User, Location } from '../types';

// 简单的状态管理
class Store {
  private state: Record<string, unknown> = {};
  private listeners: Set<() => void> = new Set();

  getState<T>(key: string): T | undefined {
    return this.state[key] as T | undefined;
  }

  setState<T>(key: string, value: T): void {
    this.state[key] = value;
    this.notify();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(listener => listener());
  }
}

// 创建全局状态存储
export const store = new Store();

// 应用状态 key
export const STATE_KEYS = {
  USER: 'user',
  TOKEN: 'token',
  ACTIVITIES: 'activities',
  SELECTED_ACTIVITY: 'selectedActivity',
  VENUES: 'venues',
  SELECTED_VENUE: 'selectedVenue',
  CURRENT_PAGE: 'currentPage',
  FILTERS: 'filters',
  IS_LOADING: 'isLoading',
  TOAST: 'toast',
} as const;

// 初始化本地存储中的用户状态
export function initUserFromStorage(): void {
  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');
  
  if (token) {
    store.setState(STATE_KEYS.TOKEN, token);
  }
  
  if (userJson) {
    try {
      const user = JSON.parse(userJson) as User;
      store.setState(STATE_KEYS.USER, user);
    } catch {
      localStorage.removeItem('user');
    }
  }
}

// 保存用户到本地存储
export function saveUserToStorage(user: User | null, token?: string): void {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
  
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
}

// 清除用户状态 (清除登录信息)
export function clearUser(): void {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  store.setState(STATE_KEYS.USER, null);
  store.setState(STATE_KEYS.TOKEN, null);
}

// Toast 通知类型
export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

// 显示 Toast
export function showToast(message: string, type: Toast['type'] = 'info', duration = 3000): void {
  const toast: Toast = {
    id: Date.now().toString(),
    message,
    type,
    duration,
  };
  store.setState(STATE_KEYS.TOAST, toast);
  
  setTimeout(() => {
    store.setState(STATE_KEYS.TOAST, null);
  }, duration);
}

// 模拟用户位置（开发环境）
export function getMockLocation(): Location {
  return {
    lat: 31.2304,
    lng: 121.4737,
    address: '上海市人民广场',
    district: '黄浦区',
  };
}

// 生成唯一ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
