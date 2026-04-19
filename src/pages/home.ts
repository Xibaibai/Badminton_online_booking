import { createIcon, createActivityCard, createBottomNav, createLoading, formatDate, getWeekday } from '../components';
import { getActivities } from '../api';
import type { Activity, ActivityFilters, SkillLevel } from '../types';
import { router, ROUTES } from '../router';
import { store, STATE_KEYS, initUserFromStorage } from '../store';

// 首页组件
export function renderHomePage(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'min-h-screen bg-gray-50 pb-20';
  
  // 初始化用户
  initUserFromStorage();
  const user = store.getState<{ nickname: string; level: string }>(STATE_KEYS.USER);
  
  // 渲染头部
  container.appendChild(renderHeader(user?.nickname || '球友'));
  
  // 渲染筛选标签
  container.appendChild(renderFilterTabs());
  
  // 渲染活动列表
  const listContainer = document.createElement('div');
  listContainer.className = 'p-4 space-y-4';
  listContainer.appendChild(createLoading('加载活动中...'));
  container.appendChild(listContainer);
  
  // 渲染底部导航
  container.appendChild(createBottomNav([
    { id: 'home', label: '首页', icon: 'home', active: true },
    { id: 'activity', label: '活动', icon: 'calendar' },
    { id: 'venue', label: '场地', icon: 'location' },
    { id: 'profile', label: '我的', icon: 'user' },
  ], (id) => handleNavChange(id)));
  
  // 加载活动数据
  loadActivities(listContainer);
  
  return container;
}

function renderHeader(nickname: string): HTMLElement {
  const header = document.createElement('header');
  header.className = 'bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-6';
  
  header.innerHTML = `
    <div class="flex items-center justify-between mb-4">
      <div>
        <h1 class="text-xl font-bold">拍档</h1>
        <p class="text-blue-100 text-sm">约球不孤单，打球更来电</p>
      </div>
      <button class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center" id="header-avatar">
        ${createIcon('user', 'w-6 h-6')}
      </button>
    </div>
    <div class="flex items-center gap-3">
      <div class="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center text-2xl">
        🎾
      </div>
      <div>
        <p class="text-lg font-medium">${nickname}</p>
        <p class="text-blue-100 text-sm">发现附近的羽毛球活动</p>
      </div>
    </div>
  `;
  
  header.querySelector('#header-avatar')?.addEventListener('click', () => {
    router.navigate(ROUTES.PROFILE);
  });
  
  return header;
}

function renderFilterTabs(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'bg-white px-4 py-3 overflow-x-auto';
  
  const levels: { id: SkillLevel | 'all'; label: string }[] = [
    { id: 'all', label: '全部' },
    { id: 'beginner', label: '新手' },
    { id: 'entry', label: '入门' },
    { id: 'intermediate', label: '中级' },
    { id: 'advanced', label: '高级' },
    { id: 'expert', label: '高手' },
  ];
  
  const tabs = document.createElement('div');
  tabs.className = 'flex gap-2';
  
  levels.forEach(level => {
    const tab = document.createElement('button');
    tab.className = `px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
      level.id === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`;
    tab.textContent = level.label;
    tab.addEventListener('click', () => {
      tabs.querySelectorAll('button').forEach(btn => {
        btn.className = btn === tab ? 'px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap bg-blue-500 text-white' : 'px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap bg-gray-100 text-gray-600';
      });
      filterActivities(level.id === 'all' ? undefined : { level: level.id as SkillLevel });
    });
    tabs.appendChild(tab);
  });
  
  container.appendChild(tabs);
  return container;
}

async function loadActivities(container: HTMLElement, filters?: ActivityFilters): Promise<void> {
  container.innerHTML = '';
  container.appendChild(createLoading('加载活动中...'));
  
  try {
    const response = await getActivities(filters);
    
    container.innerHTML = '';
    
    if (!response.success || !response.data || response.data.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12">
          <div class="text-4xl mb-4">🏸</div>
          <p class="text-gray-500">暂无相关活动</p>
          <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg" id="create-first-activity">
            发起第一个活动
          </button>
        </div>
      `;
      
      container.querySelector('#create-first-activity')?.addEventListener('click', () => {
        router.navigate(ROUTES.ACTIVITY_CREATE);
      });
      return;
    }
    
    // 按日期分组显示
    const grouped: Record<string, Activity[]> = {};
    response.data.forEach(activity => {
      const key = activity.date;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(activity);
    });
    
    Object.entries(grouped).forEach(([date, activities]) => {
      const dateSection = document.createElement('div');
      dateSection.className = 'mb-4';
      
      dateSection.innerHTML = `
        <div class="flex items-center gap-2 mb-3">
          <span class="font-semibold text-gray-900">${formatDate(date)}</span>
          <span class="text-gray-400">${getWeekday(date)}</span>
        </div>
      `;
      
      activities.forEach(activity => {
        const card = createActivityCard(activity, () => {
          router.navigate(`/activity/${activity.id}`);
        });
        dateSection.appendChild(card);
      });
      
      container.appendChild(dateSection);
    });
    
  } catch {
    container.innerHTML = `
      <div class="text-center py-12">
        <p class="text-red-500">加载失败，请重试</p>
        <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg" id="retry-load">
          重新加载
        </button>
      </div>
    `;
    
    container.querySelector('#retry-load')?.addEventListener('click', () => loadActivities(container, filters));
  }
}

function filterActivities(filters?: ActivityFilters): void {
  const container = document.querySelector('.space-y-4') as HTMLElement;
  if (container) {
    loadActivities(container, filters);
  }
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
      router.navigate(ROUTES.PROFILE);
      break;
  }
}

// 导出函数供路由调用
export { loadActivities as refreshActivities };
