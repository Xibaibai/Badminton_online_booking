import { createIcon, createBottomNav, showToast } from '../components';
import { logout } from '../api';
import type { User } from '../types';
import { router, ROUTES } from '../router';
import { store, STATE_KEYS, initUserFromStorage } from '../store';

// 用户个人中心页
export function renderProfilePage(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'min-h-screen bg-gray-50 pb-20';
  
  // 初始化用户状态
  initUserFromStorage();
  const currentUser = store.getState<User>(STATE_KEYS.USER);
  
  if (!currentUser) {
    return renderNotLoggedIn(container);
  }
  
  return renderUserProfile(container, currentUser);
}

function renderNotLoggedIn(container: HTMLElement): HTMLElement {
  container.innerHTML = '';
  
  const content = document.createElement('div');
  content.className = 'flex flex-col items-center justify-center min-h-screen px-6';
  content.innerHTML = `
    <div class="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-5xl mb-6">
      👤
    </div>
    <h2 class="text-xl font-bold text-gray-900 mb-2">未登录</h2>
    <p class="text-gray-500 mb-6 text-center">登录后可以发起活动、加入球局</p>
    <button class="px-8 py-3 bg-blue-500 text-white rounded-lg font-medium" id="login-btn">
      立即登录
    </button>
  `;
  
  content.querySelector('#login-btn')?.addEventListener('click', () => {
    router.navigate(ROUTES.LOGIN);
  });
  
  container.appendChild(content);
  return container;
}

function renderUserProfile(container: HTMLElement, user: User): HTMLElement {
  container.innerHTML = '';
  
  // 头部背景
  const headerBg = document.createElement('div');
  headerBg.className = 'bg-gradient-to-r from-blue-500 to-blue-600 px-4 pt-8 pb-16';
  headerBg.innerHTML = `
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-lg font-semibold text-white">我的</h1>
      <button id="settings-btn" class="p-2 hover:bg-white/10 rounded-lg">
        ${createIcon('setting', 'w-6 h-6 text-white')}
      </button>
    </div>
    
    <div class="flex items-center gap-4">
      <div class="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl text-white font-bold">
        ${user.nickname?.[0] || '?'}
      </div>
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-1">
          <h2 class="text-xl font-bold text-white">${user.nickname}</h2>
          <span class="px-2 py-0.5 bg-white/20 rounded text-white text-xs">${user.levelName}</span>
        </div>
        <p class="text-blue-100 text-sm">${user.phone || '未绑定手机'}</p>
      </div>
      <button class="p-2 hover:bg-white/10 rounded-lg" id="edit-profile-btn">
        ${createIcon('chevronRight', 'w-6 h-6 text-white')}
      </button>
    </div>
  `;
  
  // 统计数据
  const statsCard = document.createElement('div');
  statsCard.className = 'mx-4 -mt-8 bg-white rounded-xl shadow-sm p-4';
  statsCard.innerHTML = `
    <div class="grid grid-cols-4 gap-4 text-center">
      <div class="cursor-pointer">
        <p class="text-xl font-bold text-gray-900">0</p>
        <p class="text-xs text-gray-500">发起活动</p>
      </div>
      <div class="cursor-pointer">
        <p class="text-xl font-bold text-gray-900">0</p>
        <p class="text-xs text-gray-500">参与活动</p>
      </div>
      <div class="cursor-pointer">
        <p class="text-xl font-bold text-gray-900">${user.creditScore}</p>
        <p class="text-xs text-gray-500">信用分</p>
      </div>
      <div class="cursor-pointer">
        <p class="text-xl font-bold text-gray-900">${user.creditLevel}</p>
        <p class="text-xs text-gray-500">信用等级</p>
      </div>
    </div>
  `;
  
  // 菜单列表
  const menuList = document.createElement('div');
  menuList.className = 'p-4 space-y-3';
  menuList.innerHTML = `
    <div class="bg-white rounded-xl overflow-hidden">
      <button class="w-full flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100" id="my-activities-btn">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
            ${createIcon('calendar', 'w-5 h-5')}
          </div>
          <span class="font-medium text-gray-900">我的活动</span>
        </div>
        ${createIcon('chevronRight', 'w-5 h-5 text-gray-400')}
      </button>
      
      <div class="h-px bg-gray-100 mx-4"></div>
      
      <button class="w-full flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100" id="my-bookings-btn">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-500">
            ${createIcon('ticket', 'w-5 h-5')}
          </div>
          <span class="font-medium text-gray-900">我的预约</span>
        </div>
        ${createIcon('chevronRight', 'w-5 h-5 text-gray-400')}
      </button>
      
      <div class="h-px bg-gray-100 mx-4"></div>
      
      <button class="w-full flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100" id="favorites-btn">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
            ${createIcon('star', 'w-5 h-5')}
          </div>
          <span class="font-medium text-gray-900">我的收藏</span>
        </div>
        ${createIcon('chevronRight', 'w-5 h-5 text-gray-400')}
      </button>
    </div>
    
    <div class="bg-white rounded-xl overflow-hidden">
      <button class="w-full flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500">
            ${createIcon('phone', 'w-5 h-5')}
          </div>
          <span class="font-medium text-gray-900">联系客服</span>
        </div>
        ${createIcon('chevronRight', 'w-5 h-5 text-gray-400')}
      </button>
      
      <div class="h-px bg-gray-100 mx-4"></div>
      
      <button class="w-full flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
            ${createIcon('setting', 'w-5 h-5')}
          </div>
          <span class="font-medium text-gray-900">设置</span>
        </div>
        ${createIcon('chevronRight', 'w-5 h-5 text-gray-400')}
      </button>
    </div>
    
    <button class="w-full bg-white rounded-xl p-4 text-red-500 font-medium text-center" id="logout-btn">
      退出登录
    </button>
  `;
  
  container.appendChild(headerBg);
  container.appendChild(statsCard);
  container.appendChild(menuList);
  
  // 底部导航
  container.appendChild(createBottomNav([
    { id: 'home', label: '首页', icon: 'home' },
    { id: 'activity', label: '活动', icon: 'calendar' },
    { id: 'venue', label: '场地', icon: 'location' },
    { id: 'profile', label: '我的', icon: 'user', active: true },
  ], (id) => handleNavChange(id)));
  
  // 绑定事件
  headerBg.querySelector('#settings-btn')?.addEventListener('click', () => {
    showToast('设置功能开发中', 'info');
  });
  
  headerBg.querySelector('#edit-profile-btn')?.addEventListener('click', () => {
    showToast('编辑资料功能开发中', 'info');
  });
  
  menuList.querySelector('#my-activities-btn')?.addEventListener('click', () => {
    router.navigate(ROUTES.MY_ACTIVITIES);
  });
  
  menuList.querySelector('#my-bookings-btn')?.addEventListener('click', () => {
    showToast('我的预约功能开发中', 'info');
  });
  
  menuList.querySelector('#favorites-btn')?.addEventListener('click', () => {
    showToast('我的收藏功能开发中', 'info');
  });
  
  menuList.querySelector('#logout-btn')?.addEventListener('click', () => {
    const confirmed = confirm('确定要退出登录吗？');
    if (!confirmed) return;
    
    logout();
    store.setState(STATE_KEYS.USER, null);
    showToast('已退出登录', 'success');
    router.navigate(ROUTES.HOME);
  });
  
  return container;
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

// 我的活动页
export function renderMyActivitiesPage(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'min-h-screen bg-gray-50';
  
  // 头部
  const header = document.createElement('header');
  header.className = 'bg-white px-4 py-4 sticky top-0 z-10 border-b border-gray-100 flex items-center gap-3';
  header.innerHTML = `
    <button id="back-btn" class="p-2 -ml-2 hover:bg-gray-100 rounded-lg">
      ${createIcon('chevronLeft', 'w-6 h-6')}
    </button>
    <h1 class="text-lg font-semibold text-gray-900 flex-1">我的活动</h1>
  `;
  
  // Tab 切换
  const tabs = document.createElement('div');
  tabs.className = 'bg-white px-4 flex border-b border-gray-200';
  tabs.innerHTML = `
    <button class="flex-1 py-3 text-sm font-medium text-blue-500 border-b-2 border-blue-500" data-tab="hosted">我发起的</button>
    <button class="flex-1 py-3 text-sm font-medium text-gray-500" data-tab="joined">我参与的</button>
  `;
  
  // 内容
  const content = document.createElement('div');
  content.className = 'p-4';
  content.innerHTML = `
    <div class="text-center py-12">
      <div class="text-4xl mb-4">📋</div>
      <p class="text-gray-500">暂无活动</p>
      <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg" id="create-activity-btn">
        发起活动
      </button>
    </div>
  `;
  
  container.appendChild(header);
  container.appendChild(tabs);
  container.appendChild(content);
  
  // 绑定事件
  header.querySelector('#back-btn')?.addEventListener('click', () => {
    router.navigate(ROUTES.PROFILE);
  });
  
  tabs.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLElement;
      const tab = target.dataset.tab;
      
      tabs.querySelectorAll('button').forEach(b => {
        b.className = 'flex-1 py-3 text-sm font-medium text-gray-500';
      });
      target.className = 'flex-1 py-3 text-sm font-medium text-blue-500 border-b-2 border-blue-500';
      
      showToast(`${tab === 'hosted' ? '我发起的' : '我参与的'}功能开发中`, 'info');
    });
  });
  
  content.querySelector('#create-activity-btn')?.addEventListener('click', () => {
    router.navigate(ROUTES.ACTIVITY_CREATE);
  });
  
  return container;
}

// 设置页
export function renderSettingsPage(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'min-h-screen bg-gray-50';
  
  // 头部
  const header = document.createElement('header');
  header.className = 'bg-white px-4 py-4 sticky top-0 z-10 border-b border-gray-100 flex items-center gap-3';
  header.innerHTML = `
    <button id="back-btn" class="p-2 -ml-2 hover:bg-gray-100 rounded-lg">
      ${createIcon('chevronLeft', 'w-6 h-6')}
    </button>
    <h1 class="text-lg font-semibold text-gray-900 flex-1">设置</h1>
  `;
  
  // 内容
  const content = document.createElement('div');
  content.className = 'p-4 space-y-4';
  content.innerHTML = `
    <div class="bg-white rounded-xl overflow-hidden">
      <button class="w-full flex items-center justify-between p-4 hover:bg-gray-50">
        <div class="flex items-center gap-3">
          <span class="font-medium text-gray-900">账号与安全</span>
        </div>
        ${createIcon('chevronRight', 'w-5 h-5 text-gray-400')}
      </button>
      
      <div class="h-px bg-gray-100 mx-4"></div>
      
      <button class="w-full flex items-center justify-between p-4 hover:bg-gray-50">
        <div class="flex items-center gap-3">
          <span class="font-medium text-gray-900">消息通知</span>
        </div>
        ${createIcon('chevronRight', 'w-5 h-5 text-gray-400')}
      </button>
      
      <div class="h-px bg-gray-100 mx-4"></div>
      
      <button class="w-full flex items-center justify-between p-4 hover:bg-gray-50">
        <div class="flex items-center gap-3">
          <span class="font-medium text-gray-900">隐私设置</span>
        </div>
        ${createIcon('chevronRight', 'w-5 h-5 text-gray-400')}
      </button>
    </div>
    
    <div class="bg-white rounded-xl overflow-hidden">
      <button class="w-full flex items-center justify-between p-4 hover:bg-gray-50">
        <div class="flex items-center gap-3">
          <span class="font-medium text-gray-900">关于我们</span>
        </div>
        ${createIcon('chevronRight', 'w-5 h-5 text-gray-400')}
      </button>
      
      <div class="h-px bg-gray-100 mx-4"></div>
      
      <button class="w-full flex items-center justify-between p-4 hover:bg-gray-50">
        <div class="flex items-center gap-3">
          <span class="font-medium text-gray-900">帮助与反馈</span>
        </div>
        ${createIcon('chevronRight', 'w-5 h-5 text-gray-400')}
      </button>
    </div>
    
    <div class="bg-white rounded-xl overflow-hidden">
      <button class="w-full flex items-center justify-between p-4 hover:bg-gray-50">
        <div class="flex items-center gap-3">
          <span class="font-medium text-gray-900">检查更新</span>
        </div>
        <div class="flex items-center">
          <span class="text-gray-400 text-sm mr-2">v1.0.0</span>
          ${createIcon('chevronRight', 'w-5 h-5 text-gray-400')}
        </div>
      </button>
    </div>
  `;
  
  container.appendChild(header);
  container.appendChild(content);
  
  header.querySelector('#back-btn')?.addEventListener('click', () => {
    router.navigate(ROUTES.PROFILE);
  });
  
  return container;
}
