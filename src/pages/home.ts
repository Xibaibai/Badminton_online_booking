import { createIcon, createBottomNav, createLoading, formatDate, getWeekday } from '../components';
import { getActivities } from '../api';
import type { Activity, SkillLevel } from '../types';
import { router, ROUTES } from '../router';
import { store, STATE_KEYS, initUserFromStorage } from '../store';

// 首页组件 - 激情运动风格
export function renderHomePage(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'min-h-screen bg-gray-50 pb-20';
  
  // 初始化用户
  initUserFromStorage();
  const user = store.getState<{ nickname: string; level: string }>(STATE_KEYS.USER);
  
  // 渲染头部 - 激情渐变背景
  container.appendChild(renderHeader(user?.nickname || '球友'));
  
  // 渲染动态Banner
  container.appendChild(renderBanner());
  
  // 渲染筛选标签 - 活力风格
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
  header.className = 'relative overflow-hidden';
  header.innerHTML = `
    <!-- 渐变背景 -->
    <div class="absolute inset-0 bg-gradient-to-br from-orange-500 via-pink-500 to-red-500"></div>
    <div class="absolute inset-0 opacity-30">
      <div class="absolute top-10 left-10 w-32 h-32 bg-white rounded-full filter blur-3xl animate-float"></div>
      <div class="absolute top-20 right-10 w-24 h-24 bg-yellow-300 rounded-full filter blur-3xl animate-float" style="animation-delay: 1s"></div>
    </div>
    
    <!-- 内容 -->
    <div class="relative px-5 pt-12 pb-8">
      <!-- 顶部导航 -->
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg animate-breathe">
            <span class="text-2xl">🏸</span>
          </div>
          <div>
            <h1 class="text-2xl font-black text-white tracking-tight">拍档</h1>
            <p class="text-white/80 text-xs font-medium">约球不孤单，打球更来电</p>
          </div>
        </div>
        <button class="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white/30 transition-all hover:scale-105 active:scale-95" id="header-avatar">
          ${createIcon('user', 'w-5 h-5 text-white')}
        </button>
      </div>
      
      <!-- 用户欢迎卡片 -->
      <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-300 to-orange-400 flex items-center justify-center text-2xl shadow-lg animate-heartbeat">
            🏆
          </div>
          <div class="flex-1">
            <p class="text-white font-bold text-lg">Hi，${nickname}！</p>
            <p class="text-white/80 text-sm flex items-center gap-1">
              <span class="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              发现附近 ${Math.floor(Math.random() * 20 + 10)} 场精彩活动
            </p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 底部波浪装饰 -->
    <div class="absolute -bottom-1 left-0 right-0">
      <svg viewBox="0 0 375 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
        <path d="M0 24H375V0C335.19 0 307.5 12 259.5 12C211.5 12 183.5 0 148 0C112.5 0 84 12 60 12C36 12 0 0 0 0V24Z" fill="#F9FAFB"/>
      </svg>
    </div>
  `;
  
  header.querySelector('#header-avatar')?.addEventListener('click', () => {
    router.navigate(ROUTES.PROFILE);
  });
  
  return header;
}

function renderBanner(): HTMLElement {
  const banner = document.createElement('div');
  banner.className = 'mx-4 -mt-4 relative';
  
  const banners = [
    {
      emoji: '🔥',
      title: '周末球局热闘中',
      subtitle: '超过50+球友已报名',
      gradient: 'from-orange-500 to-red-500',
      delay: '0s'
    },
    {
      emoji: '⚡',
      title: '新手友好局',
      subtitle: '轻松开启运动之旅',
      gradient: 'from-blue-500 to-purple-500',
      delay: '0.5s'
    },
    {
      emoji: '🎯',
      title: '竞技对抗赛',
      subtitle: '挑战自我，突破极限',
      gradient: 'from-green-500 to-emerald-500',
      delay: '1s'
    }
  ];
  
  banner.innerHTML = `
    <div class="relative overflow-hidden rounded-2xl">
      <!-- 轮播容器 -->
      <div class="flex transition-transform duration-500 ease-out" id="banner-carousel">
        ${banners.map(b => `
          <div class="w-full flex-shrink-0">
            <div class="bg-gradient-to-r ${b.gradient} p-5 min-h-[120px] relative overflow-hidden">
              <!-- 背景装饰 -->
              <div class="absolute inset-0 opacity-20">
                <div class="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full filter blur-3xl"></div>
                <div class="absolute -bottom-10 -left-10 w-32 h-32 bg-yellow-300 rounded-full filter blur-3xl"></div>
              </div>
              
              <!-- 内容 -->
              <div class="relative flex items-center gap-4">
                <div class="text-5xl animate-bounce" style="animation-duration: 2s">${b.emoji}</div>
                <div>
                  <h3 class="text-white font-black text-lg mb-1">${b.title}</h3>
                  <p class="text-white/80 text-sm">${b.subtitle}</p>
                </div>
              </div>
              
              <!-- 动感线条 -->
              <div class="absolute bottom-0 left-0 right-0 h-1 bg-white/30">
                <div class="h-full bg-white/60 rounded-r-full animate-pulse" style="width: 60%"></div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      
      <!-- 指示器 -->
      <div class="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2">
        ${banners.map((_, i) => `
          <div class="w-2 h-2 rounded-full transition-all ${i === 0 ? 'w-6 bg-white' : 'bg-white/50'}" data-index="${i}"></div>
        `).join('')}
      </div>
    </div>
  `;
  
  // 简单的轮播自动播放
  let currentIndex = 0;
  const carousel = banner.querySelector('#banner-carousel') as HTMLElement;
  const indicators = banner.querySelectorAll('[data-index]');
  
  setInterval(() => {
    currentIndex = (currentIndex + 1) % banners.length;
    if (carousel) {
      carousel.style.transform = `translateX(-${currentIndex * 100}%)`;
    }
    indicators.forEach((ind, i) => {
      ind.className = `w-2 h-2 rounded-full transition-all ${i === currentIndex ? 'w-6 bg-white' : 'bg-white/50'}`;
    });
  }, 3000);
  
  return banner;
}

function renderFilterTabs(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'px-4 py-4';
  
  const levels: { id: SkillLevel | 'all'; label: string; emoji: string }[] = [
    { id: 'all', label: '全部', emoji: '🎯' },
    { id: 'beginner', label: '新手', emoji: '🌱' },
    { id: 'entry', label: '入门', emoji: '⭐' },
    { id: 'intermediate', label: '中级', emoji: '🔥' },
    { id: 'advanced', label: '高级', emoji: '💪' },
    { id: 'expert', label: '高手', emoji: '👑' },
  ];
  
  container.innerHTML = `
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
        <span class="w-1 h-5 rounded-full bg-gradient-to-b from-orange-500 to-red-500"></span>
        热门活动
      </h2>
      <button class="text-sm text-orange-500 font-medium hover:text-orange-600 transition-colors flex items-center gap-1">
        查看更多
        ${createIcon('chevronRight', 'w-4 h-4')}
      </button>
    </div>
    
    <div class="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
      ${levels.map((level, index) => `
        <button 
          class="filter-btn flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all hover:scale-105 active:scale-95 ${
            level.id === 'all' 
              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-200' 
              : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300 hover:bg-orange-50'
          }"
          data-filter="${level.id}"
          style="animation-delay: ${index * 50}ms"
        >
          <span>${level.emoji}</span>
          <span>${level.label}</span>
        </button>
      `).join('')}
    </div>
  `;
  
  container.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLElement;
      const filter = target.dataset.filter;
      
      container.querySelectorAll('.filter-btn').forEach(b => {
        if ((b as HTMLElement).dataset.filter === 'all') {
          b.className = b === target 
            ? 'filter-btn flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-200'
            : 'filter-btn flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all hover:scale-105 active:scale-95 bg-white text-gray-600 border border-gray-200 hover:border-orange-300 hover:bg-orange-50';
        } else {
          b.className = b === target 
            ? 'filter-btn flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-200'
            : 'filter-btn flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all hover:scale-105 active:scale-95 bg-white text-gray-600 border border-gray-200 hover:border-orange-300 hover:bg-orange-50';
        }
      });
      
      filterActivities(filter === 'all' ? undefined : { level: filter as SkillLevel });
    });
  });
  
  return container;
}

async function loadActivities(container: HTMLElement, filters?: { level?: SkillLevel }): Promise<void> {
  container.innerHTML = '';
  container.appendChild(createLoading('加载活动中...'));
  
  try {
    const response = await getActivities(filters);
    
    container.innerHTML = '';
    
    if (!response.success || !response.data || response.data.length === 0) {
      container.innerHTML = `
        <div class="text-center py-16 animate-fade-in">
          <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center text-5xl animate-bounce">
            🏸
          </div>
          <p class="text-gray-500 font-medium mb-2">暂无相关活动</p>
          <p class="text-gray-400 text-sm mb-6">快来发起第一场球局吧！</p>
          <button class="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl font-bold shadow-lg shadow-orange-200 hover:shadow-xl hover:scale-105 active:scale-95 transition-all" id="create-first-activity">
            🎉 发起活动
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
    
    Object.entries(grouped).forEach(([date, activities], dateIndex) => {
      const dateSection = document.createElement('div');
      dateSection.className = 'animate-slide-up list-item-enter';
      dateSection.style.animationDelay = `${dateIndex * 100}ms`;
      
      dateSection.innerHTML = `
        <div class="flex items-center gap-3 mb-4">
          <div class="flex items-center gap-2">
            <span class="text-2xl">${getDateEmoji(date)}</span>
            <div>
              <span class="font-bold text-gray-900 text-lg">${formatDate(date)}</span>
              <span class="text-gray-400 text-sm ml-2">${getWeekday(date)}</span>
            </div>
          </div>
          <div class="flex-1 h-px bg-gradient-to-r from-orange-200 via-red-200 to-transparent"></div>
          <span class="text-xs text-orange-500 font-medium bg-orange-50 px-2 py-1 rounded-full">
            ${activities.length}场
          </span>
        </div>
      `;
      
      activities.forEach((activity, index) => {
        const card = createActivityCardPassion(activity, () => {
          router.navigate(`/activity/${activity.id}`);
        });
        card.classList.add('animate-slide-up');
        card.style.animationDelay = `${(dateIndex * 100) + (index * 50)}ms`;
        dateSection.appendChild(card);
      });
      
      container.appendChild(dateSection);
    });
    
  } catch {
    container.innerHTML = `
      <div class="text-center py-16">
        <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center text-3xl animate-shake">
          😢
        </div>
        <p class="text-red-500 font-medium mb-4">加载失败</p>
        <button class="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl font-bold hover:shadow-lg transition-all" id="retry-load">
          重新加载
        </button>
      </div>
    `;
    
    container.querySelector('#retry-load')?.addEventListener('click', () => loadActivities(container, filters));
  }
}

function getDateEmoji(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (date.toDateString() === today.toDateString()) {
    return '📅';
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return '🔥';
  }
  return '⏰';
}

function filterActivities(filters?: { level?: SkillLevel }): void {
  const container = document.querySelector('.p-4.space-y-4') as HTMLElement;
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

// 激情版活动卡片
function createActivityCardPassion(activity: Activity, onClick: () => void): HTMLElement {
  const card = document.createElement('div');
  card.className = 'card-passion p-4 mb-3 cursor-pointer';
  
  // 根据等级选择颜色
  const levelColors: Record<string, { bg: string; text: string; gradient: string }> = {
    beginner: { bg: 'bg-green-100', text: 'text-green-600', gradient: 'from-green-400 to-emerald-500' },
    entry: { bg: 'bg-blue-100', text: 'text-blue-600', gradient: 'from-blue-400 to-cyan-500' },
    intermediate: { bg: 'bg-orange-100', text: 'text-orange-600', gradient: 'from-orange-400 to-amber-500' },
    advanced: { bg: 'bg-red-100', text: 'text-red-600', gradient: 'from-red-400 to-rose-500' },
    expert: { bg: 'bg-purple-100', text: 'text-purple-600', gradient: 'from-purple-400 to-violet-500' },
  };
  
  const colors = levelColors[activity.level] || levelColors.intermediate;
  
  card.innerHTML = `
    <div class="flex items-start justify-between mb-3">
      <div class="flex-1 pr-3">
        <h3 class="font-bold text-gray-900 text-base mb-1 leading-tight">${activity.title}</h3>
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <span class="flex items-center">
            ${createIcon('calendar', 'w-3.5 h-3.5 mr-1')}
            ${activity.time}
          </span>
        </div>
      </div>
      
      <!-- 等级徽章 -->
      <div class="flex flex-col items-end gap-2">
        <span class="px-2.5 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${colors.gradient} shadow-sm">
          ${activity.levelName}
        </span>
        ${activity.fee > 0 
          ? `<span class="text-orange-500 font-bold text-sm">¥${activity.fee}</span>` 
          : `<span class="text-green-500 font-bold text-sm flex items-center gap-1">
              <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              免费
            </span>`
        }
      </div>
    </div>
    
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="flex -space-x-2">
          ${activity.participants.slice(0, 3).map((p, i) => `
            <div class="w-8 h-8 rounded-full bg-gradient-to-br ${['from-orange-400 to-red-500', 'from-blue-400 to-purple-500', 'from-green-400 to-emerald-500'][i % 3]} flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm">
              ${p.user?.nickname?.[0] || '?'}
            </div>
          `).join('')}
        </div>
        <span class="text-sm text-gray-500">${activity.currentParticipants}/${activity.maxParticipants}人</span>
      </div>
      
      <div class="flex items-center gap-2">
        <span class="text-xs text-gray-400 truncate max-w-[100px]">${activity.venue?.name || '待定'}</span>
        <span class="px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-500 flex items-center gap-1">
          ${createIcon('location', 'w-3 h-3')}
          ${activity.venue?.distance ? activity.venue.distance + 'km' : '附近'}
        </span>
      </div>
    </div>
    
    <!-- 进度条 -->
    <div class="mt-3 pt-3 border-t border-gray-100">
      <div class="flex items-center justify-between mb-1.5">
        <span class="text-xs text-gray-500">报名进度</span>
        <span class="text-xs font-medium text-orange-500">${Math.round((activity.currentParticipants / activity.maxParticipants) * 100)}%</span>
      </div>
      <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div class="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full transition-all duration-500" style="width: ${(activity.currentParticipants / activity.maxParticipants) * 100}%"></div>
      </div>
    </div>
  `;
  
  card.addEventListener('click', onClick);
  return card;
}

// 导出函数供路由调用
export { loadActivities as refreshActivities };
