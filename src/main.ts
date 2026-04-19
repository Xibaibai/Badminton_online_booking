import { router, ROUTES } from './router';
import { renderHomePage } from './pages/home';
import { renderLoginPage, renderRegisterPage } from './pages/auth';
import { renderActivityPage, renderActivityDetailPage, renderCreateActivityPage } from './pages/activity';
import { renderVenuePage, renderVenueDetailPage } from './pages/venue';
import { renderProfilePage, renderMyActivitiesPage, renderSettingsPage } from './pages/profile';
import { initUserFromStorage } from './store';

// 全局样式
import './styles/global.css';

// 注册路由
function setupRoutes(): void {
  // 首页
  router.addRoute(ROUTES.HOME, () => {
    renderPage(renderHomePage());
  });
  
  // 登录/注册
  router.addRoute(ROUTES.LOGIN, () => {
    renderPage(renderLoginPage());
  });
  
  router.addRoute(ROUTES.REGISTER, () => {
    renderPage(renderRegisterPage());
  });
  
  // 活动相关
  router.addRoute(ROUTES.ACTIVITY, () => {
    renderPage(renderActivityPage());
  });
  
  router.addRoute('/activity/create', () => {
    renderPage(renderCreateActivityPage());
  });
  
  router.addRoute('/activity/:id', (params) => {
    renderPage(renderActivityDetailPage(params?.id || ''));
  });
  
  // 场地相关
  router.addRoute(ROUTES.VENUE, () => {
    renderPage(renderVenuePage());
  });
  
  router.addRoute('/venue/:id', (params) => {
    renderPage(renderVenueDetailPage(params?.id || ''));
  });
  
  // 用户相关
  router.addRoute(ROUTES.PROFILE, () => {
    renderPage(renderProfilePage());
  });
  
  router.addRoute(ROUTES.MY_ACTIVITIES, () => {
    renderPage(renderMyActivitiesPage());
  });
  
  router.addRoute(ROUTES.SETTINGS, () => {
    renderPage(renderSettingsPage());
  });
}

// 渲染页面
function renderPage(component: HTMLElement): void {
  const app = document.querySelector('#app');
  if (app) {
    app.innerHTML = '';
    app.appendChild(component);
  }
}

// 初始化应用
export function initApp(): void {
  // 初始化用户状态
  initUserFromStorage();
  
  // 设置路由
  setupRoutes();
  
  // 跳转到首页
  router.navigate(ROUTES.HOME);
  
  console.log('拍档 App 已初始化');
}
