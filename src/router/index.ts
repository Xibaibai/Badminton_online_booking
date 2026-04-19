// 简单的 Hash 路由实现
type RouteHandler = (params?: Record<string, string>) => void;

interface Route {
  path: string;
  handler: RouteHandler;
  paramNames?: string[];
}

class Router {
  private routes: Route[] = [];
  private currentRoute: string = '';

  constructor() {
    // 监听 hash 变化
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('load', () => this.handleRoute());
  }

  // 添加路由
  addRoute(path: string, handler: RouteHandler): void {
    const paramNames: string[] = [];
    path.replace(/:([^/]+)/g, (_, name) => {
      paramNames.push(name);
      return '([^/]+)';
    });

    this.routes.push({
      path,
      handler,
      paramNames,
    });
  }

  // 导航到指定路径
  navigate(path: string): void {
    window.location.hash = path;
  }

  // 获取当前路径
  getPath(): string {
    const hash = window.location.hash.slice(1);
    return hash || '/';
  }

  // 处理路由
  private handleRoute(): void {
    const path = this.getPath();
    
    if (path === this.currentRoute) return;
    this.currentRoute = path;

    for (const route of this.routes) {
      const regex = new RegExp(`^${route.path.replace(/:([^/]+)/g, '([^/]+)')}$`);
      const match = path.match(regex);

      if (match) {
        const params: Record<string, string> = {};
        route.paramNames?.forEach((name, index) => {
          params[name] = match[index + 1];
        });
        route.handler(params);
        return;
      }
    }

    // 默认回首页
    this.navigate('/');
  }
}

// 创建全局路由实例
export const router = new Router();

// 页面名称枚举
export type PageName = 
  | 'home' 
  | 'activity' 
  | 'activity-create' 
  | 'activity-detail'
  | 'venue'
  | 'venue-detail'
  | 'profile'
  | 'login'
  | 'register'
  | 'my-activities'
  | 'settings';

// 路由路径常量
export const ROUTES = {
  HOME: '/',
  ACTIVITY: '/activity',
  ACTIVITY_CREATE: '/activity/create',
  ACTIVITY_DETAIL: '/activity/:id',
  VENUE: '/venue',
  VENUE_DETAIL: '/venue/:id',
  PROFILE: '/profile',
  LOGIN: '/login',
  REGISTER: '/register',
  MY_ACTIVITIES: '/my-activities',
  SETTINGS: '/settings',
} as const;
