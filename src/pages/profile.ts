import { createIcon, showToast } from '../components';
import { router, ROUTES } from '../router';
import { store, STATE_KEYS, clearUser, initUserFromStorage } from '../store';
import type { User } from '../types';

// 个人中心页 - 激情运动风格
export function renderProfilePage(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'min-h-screen bg-gray-50 pb-20';
  
  initUserFromStorage();
  const user = store.getState<User>(STATE_KEYS.USER);
  
  if (!user) {
    return renderLoginPrompt();
  }
  
  // 头部
  const header = document.createElement('header');
  header.className = 'relative overflow-hidden';
  header.innerHTML = `
    <!-- 渐变背景 -->
    <div class="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500"></div>
    <div class="absolute inset-0 opacity-20">
      <div class="absolute top-10 right-5 w-40 h-40 bg-yellow-300 rounded-full filter blur-3xl animate-spin-slow"></div>
      <div class="absolute -bottom-10 left-10 w-32 h-32 bg-pink-300 rounded-full filter blur-3xl animate-float"></div>
    </div>
    
    <div class="relative px-5 pt-12 pb-6">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-xl font-black text-white tracking-tight flex items-center gap-2">
          <span class="text-2xl">👤</span>
          个人中心
        </h1>
        <button class="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all">
          ${createIcon('settings', 'w-5 h-5 text-white')}
        </button>
      </div>
      
      <!-- 用户信息卡片 -->
      <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
        <div class="flex items-center gap-4">
          <div class="w-20 h-20 rounded-2xl bg-white shadow-xl flex items-center justify-center text-3xl font-black text-gradient bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
            ${user.nickname?.[0] || '?'}
          </div>
          <div class="flex-1">
            <h2 class="text-xl font-bold text-white leading-tight">${user.nickname || '羽毛球爱好者'}</h2>
            <p class="text-white/80 text-sm mt-1">ID: ${user.id || '未知'}</p>
            <div class="flex items-center gap-2 mt-2">
              <span class="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                ${user.levelName || '新手级'}
              </span>
            </div>
          </div>
        </div>
        
        <!-- 数据统计 -->
        <div class="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-white/20">
          <div class="text-center">
            <p class="text-2xl font-black text-white">${user.activities || 0}</p>
            <p class="text-white/70 text-xs">参与活动</p>
          </div>
          <div class="text-center">
            <p class="text-2xl font-black text-white">${user.wins || 0}</p>
            <p class="text-white/70 text-xs">胜场</p>
          </div>
          <div class="text-center">
            <p class="text-2xl font-black text-white">${user.creditScore || 0}</p>
            <p class="text-white/70 text-xs">信用分</p>
          </div>
          <div class="text-center">
            <p class="text-2xl font-black text-white">${user.streak || 0}</p>
            <p class="text-white/70 text-xs">连续打卡</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="absolute -bottom-1 left-0 right-0">
      <svg viewBox="0 0 375 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
        <path d="M0 24H375V0C335.19 0 307.5 12 259.5 12C211.5 12 183.5 0 148 0C112.5 0 84 12 60 12C36 12 0 0 0 0V24Z" fill="#F9FAFB"/>
      </svg>
    </div>
  `;
  
  // 内容
  const content = document.createElement('div');
  content.className = 'px-4 space-y-4';
  
  // 我的运动数据
  const statsCard = document.createElement('div');
  statsCard.className = 'card-passion p-5';
  statsCard.innerHTML = `
    <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
      <span class="text-xl">📊</span>
      我的运动数据
    </h3>
    
    <div class="grid grid-cols-2 gap-3 mb-4">
      <div class="p-4 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl">
        <div class="flex items-center gap-2 mb-2">
          <span class="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white text-sm">🏸</span>
          <span class="text-sm font-medium text-orange-600">累计运动</span>
        </div>
        <p class="text-2xl font-black text-orange-600">${user.totalHours || 0}<span class="text-sm font-normal">小时</span></p>
      </div>
      
      <div class="p-4 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl">
        <div class="flex items-center gap-2 mb-2">
          <span class="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white text-sm">🔥</span>
          <span class="text-sm font-medium text-blue-600">本周消耗</span>
        </div>
        <p class="text-2xl font-black text-blue-600">${user.weekCalories || 0}<span class="text-sm font-normal">千卡</span></p>
      </div>
    </div>
    
    <!-- 周运动日历 -->
    <div class="bg-gray-50 rounded-2xl p-4">
      <div class="flex items-center justify-between mb-3">
        <span class="text-sm font-medium text-gray-600">本周运动</span>
        <span class="text-sm text-orange-500 font-medium">🔥 连续${user.streak || 0}天</span>
      </div>
      <div class="flex justify-between">
        ${['一', '二', '三', '四', '五', '六', '日'].map((day, i) => `
          <div class="flex flex-col items-center gap-1">
            <span class="text-xs text-gray-400">${day}</span>
            <div class="w-8 h-8 rounded-lg ${i < 3 ? 'bg-gradient-to-br from-green-400 to-emerald-500' : 'bg-gray-200'} flex items-center justify-center">
              ${i < 3 ? '<span class="text-white text-xs">✓</span>' : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  // 功能菜单
  const menuCard = document.createElement('div');
  menuCard.className = 'card-passion p-5';
  menuCard.innerHTML = `
    <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
      <span class="text-xl">⚡</span>
      我的服务
    </h3>
    
    <div class="space-y-1">
      ${[
        { icon: 'calendar', label: '我的活动', value: '', emoji: '🏸' },
        { icon: 'heart', label: '我的收藏', value: '', emoji: '❤️' },
        { icon: 'clock', label: '历史记录', value: '', emoji: '📋' },
        { icon: 'star', label: '我的积分', value: `${user.points || 0}`, emoji: '⭐' },
      ].map(item => `
        <div class="menu-item flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-all group" data-action="${item.label}">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
            ${item.emoji}
          </div>
          <div class="flex-1">
            <span class="font-medium text-gray-900">${item.label}</span>
          </div>
          ${item.value ? `<span class="text-orange-500 font-bold">${item.value}</span>` : ''}
          <span class="text-gray-300 group-hover:text-gray-500 transition-colors">${createIcon('chevronRight', 'w-5 h-5').outerHTML}</span>
        </div>
      `).join('')}
    </div>
  `;
  
  // 设置菜单
  const settingsCard = document.createElement('div');
  settingsCard.className = 'card-passion p-5';
  settingsCard.innerHTML = `
    <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
      <span class="text-xl">⚙️</span>
      设置
    </h3>
    
    <div class="space-y-1">
      ${[
        { icon: 'bell', label: '消息通知', emoji: '🔔' },
        { icon: 'shield', label: '隐私设置', emoji: '🔒' },
        { icon: 'help', label: '帮助中心', emoji: '❓' },
        { icon: 'info', label: '关于我们', emoji: 'ℹ️' },
      ].map(item => `
        <div class="menu-item flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-all group" data-action="${item.label}">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
            ${item.emoji}
          </div>
          <div class="flex-1">
            <span class="font-medium text-gray-900">${item.label}</span>
          </div>
          <span class="text-gray-300 group-hover:text-gray-500 transition-colors">${createIcon('chevronRight', 'w-5 h-5').outerHTML}</span>
        </div>
      `).join('')}
    </div>
  `;
  
  // 退出按钮
  const logoutBtn = document.createElement('button');
  logoutBtn.className = 'w-full py-4 bg-white rounded-2xl font-bold text-red-500 shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2';
  logoutBtn.innerHTML = `
    <span class="text-xl">🚪</span>
    退出登录
  `;
  logoutBtn.addEventListener('click', () => {
    if (confirm('确定要退出登录吗？')) {
      clearUser();
      showToast('已退出登录', 'success');
      router.navigate(ROUTES.HOME);
    }
  });
  
  content.appendChild(statsCard);
  content.appendChild(menuCard);
  content.appendChild(settingsCard);
  content.appendChild(logoutBtn);
  
  container.appendChild(header);
  container.appendChild(content);
  
  // 底部导航
  container.appendChild(createBottomNav([
    { id: 'home', label: '首页', icon: 'home' },
    { id: 'activity', label: '活动', icon: 'calendar' },
    { id: 'venue', label: '场地', icon: 'location' },
    { id: 'profile', label: '我的', icon: 'user', active: true },
  ], (id) => handleNavChange(id)));
  
  // 绑定菜单事件
  content.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const action = (e.currentTarget as HTMLElement).dataset.action;
      showToast(`${action}功能开发中`, 'info');
    });
  });
  
  return container;
}

function renderLoginPrompt(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 flex items-center justify-center p-6';
  
  container.innerHTML = `
    <div class="text-center animate-fade-in">
      <div class="w-32 h-32 mx-auto mb-8 rounded-3xl bg-white/20 backdrop-blur-lg flex items-center justify-center text-6xl shadow-2xl animate-bounce">
        🏸
      </div>
      <h1 class="text-3xl font-black text-white mb-3">欢迎来到拍档</h1>
      <p class="text-white/80 mb-8 max-w-xs mx-auto">发现身边的羽毛球爱好者，一起享受运动的乐趣</p>
      <button id="login-btn" class="w-full max-w-xs py-4 bg-white rounded-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all">
        立即登录 / 注册
      </button>
    </div>
  `;
  
  container.querySelector('#login-btn')?.addEventListener('click', () => {
    router.navigate(ROUTES.LOGIN);
  });
  
  return container;
}

function createBottomNav(items: { id: string; label: string; icon: string; active?: boolean }[], onChange: (id: string) => void): HTMLElement {
  const nav = document.createElement('nav');
  nav.className = 'fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-100 z-40 pb-safe';
  
  const container = document.createElement('div');
  container.className = 'flex';
  
  items.forEach(item => {
    const btn = document.createElement('button');
    const isActive = item.active;
    btn.className = `flex-1 flex flex-col items-center py-2.5 transition-all ${isActive ? 'text-purple-500' : 'text-gray-400'}`;
    btn.innerHTML = `
      <div class="relative">
        ${createIcon(item.icon, 'w-6 h-6')}
        ${isActive ? '<span class="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>' : ''}
      </div>
      <span class="text-xs mt-1 font-medium">${item.label}</span>
    `;
    btn.addEventListener('click', () => onChange(item.id));
    container.appendChild(btn);
  });
  
  nav.appendChild(container);
  return nav;
}

function handleNavChange(id: string): void {
  switch (id) {
    case 'home':
      router.navigate(ROUTES.HOME);
      break;
    case 'activity':
      router.navigate(ROUTES.ACTIVITY);
      break;
    case 'venue':
      router.navigate(ROUTES.VENUE);
      break;
    case 'profile':
      break;
  }
}

// 我的活动页面
export function renderMyActivitiesPage(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'min-h-screen bg-gray-50 pb-20';
  
  const header = document.createElement('header');
  header.className = 'relative overflow-hidden';
  header.innerHTML = `
    <div class="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500"></div>
    <div class="relative px-5 pt-12 pb-6">
      <div class="flex items-center gap-3">
        <button id="back-btn" class="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
          ${createIcon('chevronLeft', 'w-6 h-6 text-white')}
        </button>
        <h1 class="text-lg font-bold text-white">我的活动</h1>
      </div>
    </div>
  `;
  
  const content = document.createElement('div');
  content.className = 'p-4';
  content.innerHTML = `
    <div class="text-center py-20 animate-fade-in">
      <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-5xl animate-bounce">
        🏸
      </div>
      <p class="text-gray-500 font-medium mb-2">暂无参与的活动</p>
      <p class="text-gray-400 text-sm mb-4">快去发现精彩活动吧</p>
      <button class="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl font-bold shadow-lg" id="find-activity">
        发现活动
      </button>
    </div>
  `;
  
  container.appendChild(header);
  container.appendChild(content);
  
  header.querySelector('#back-btn')?.addEventListener('click', () => {
    router.navigate(ROUTES.PROFILE);
  });
  
  content.querySelector('#find-activity')?.addEventListener('click', () => {
    router.navigate(ROUTES.ACTIVITY);
  });
  
  container.appendChild(createBottomNav([
    { id: 'home', label: '首页', icon: 'home' },
    { id: 'activity', label: '活动', icon: 'calendar' },
    { id: 'venue', label: '场地', icon: 'location' },
    { id: 'profile', label: '我的', icon: 'user', active: true },
  ], handleNavChange));
  
  return container;
}

// 设置页面
export function renderSettingsPage(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'min-h-screen bg-gray-50 pb-20';
  
  const header = document.createElement('header');
  header.className = 'relative overflow-hidden';
  header.innerHTML = `
    <div class="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500"></div>
    <div class="relative px-5 pt-12 pb-6">
      <div class="flex items-center gap-3">
        <button id="back-btn" class="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
          ${createIcon('chevronLeft', 'w-6 h-6 text-white')}
        </button>
        <h1 class="text-lg font-bold text-white">设置</h1>
      </div>
    </div>
  `;
  
  const content = document.createElement('div');
  content.className = 'p-4 space-y-4';
  content.innerHTML = `
    <div class="card-passion p-5">
      <h3 class="font-bold text-gray-900 mb-4">账号设置</h3>
      <div class="space-y-3">
        ${['修改昵称', '修改头像', '修改密码'].map(item => `
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-all">
            <span class="text-gray-700">${item}</span>
            ${createIcon('chevronRight', 'w-5 h-5 text-gray-400').outerHTML}
          </div>
        `).join('')}
      </div>
    </div>
    
    <div class="card-passion p-5">
      <h3 class="font-bold text-gray-900 mb-4">通知设置</h3>
      <div class="space-y-3">
        ${['活动提醒', '消息通知', '系统通知'].map(item => `
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <span class="text-gray-700">${item}</span>
            <div class="w-12 h-7 bg-green-500 rounded-full relative cursor-pointer">
              <div class="absolute right-1 top-1 w-5 h-5 bg-white rounded-full shadow"></div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
    
    <div class="card-passion p-5">
      <h3 class="font-bold text-gray-900 mb-4">其他</h3>
      <div class="space-y-3">
        ${['清除缓存', '关于我们', '用户协议', '隐私政策'].map(item => `
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-all">
            <span class="text-gray-700">${item}</span>
            ${createIcon('chevronRight', 'w-5 h-5 text-gray-400').outerHTML}
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  container.appendChild(header);
  container.appendChild(content);
  
  header.querySelector('#back-btn')?.addEventListener('click', () => {
    router.navigate(ROUTES.PROFILE);
  });
  
  return container;
}
