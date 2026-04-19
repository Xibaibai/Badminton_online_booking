import { createIcon, createLoading, createRating, showToast } from '../components';
import { getVenues, getVenueDetail } from '../api';
import type { Venue } from '../types';
import { router, ROUTES } from '../router';

// 场地列表页 - 活力运动风格
export function renderVenuePage(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'min-h-screen bg-gray-50 pb-20';
  
  // 头部
  const header = document.createElement('header');
  header.className = 'relative overflow-hidden';
  header.innerHTML = `
    <!-- 渐变背景 -->
    <div class="absolute inset-0 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500"></div>
    <div class="absolute inset-0 opacity-20">
      <div class="absolute top-10 left-10 w-32 h-32 bg-yellow-300 rounded-full filter blur-3xl animate-spin-slow"></div>
      <div class="absolute bottom-5 right-10 w-24 h-24 bg-cyan-300 rounded-full filter blur-3xl animate-float"></div>
    </div>
    
    <div class="relative px-5 pt-12 pb-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span class="text-3xl">📍</span>
            附近场地
          </h1>
          <p class="text-white/80 text-sm mt-1">发现身边的羽毛球馆</p>
        </div>
        <button class="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
          ${createIcon('search', 'w-5 h-5 text-white')}
        </button>
      </div>
    </div>
    
    <!-- 筛选标签 -->
    <div class="relative bg-gray-50 rounded-t-3xl px-4 pt-4">
      <div class="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
        <button class="filter-btn px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-200 whitespace-nowrap" data-filter="all">全部</button>
        <button class="filter-btn px-4 py-2 rounded-full text-sm font-bold bg-white text-gray-600 border border-gray-200 whitespace-nowrap hover:border-green-300" data-filter="rating">⭐ 评分最高</button>
        <button class="filter-btn px-4 py-2 rounded-full text-sm font-bold bg-white text-gray-600 border border-gray-200 whitespace-nowrap hover:border-green-300" data-filter="price_low">💰 价格最低</button>
        <button class="filter-btn px-4 py-2 rounded-full text-sm font-bold bg-white text-gray-600 border border-gray-200 whitespace-nowrap hover:border-green-300" data-filter="nearby">📍 距离最近</button>
      </div>
    </div>
  `;
  
  // 场地列表
  const listContainer = document.createElement('div');
  listContainer.className = 'p-4 space-y-4';
  listContainer.appendChild(createLoading('加载场地中...'));
  
  container.appendChild(header);
  container.appendChild(listContainer);
  
  // 底部导航
  container.appendChild(createBottomNav([
    { id: 'home', label: '首页', icon: 'home' },
    { id: 'activity', label: '活动', icon: 'calendar' },
    { id: 'venue', label: '场地', icon: 'location', active: true },
    { id: 'profile', label: '我的', icon: 'user' },
  ], (id) => handleNavChange(id)));
  
  // 绑定筛选事件
  header.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLElement;
      const filter = target.dataset.filter;
      
      header.querySelectorAll('.filter-btn').forEach(b => {
        b.className = b === target 
          ? 'filter-btn px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-200 whitespace-nowrap'
          : 'filter-btn px-4 py-2 rounded-full text-sm font-bold bg-white text-gray-600 border border-gray-200 whitespace-nowrap hover:border-green-300';
      });
      
      loadVenues(listContainer, filter);
    });
  });
  
  // 加载场地
  loadVenues(listContainer);
  
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
    btn.className = `flex-1 flex flex-col items-center py-2.5 transition-all ${isActive ? 'text-green-500' : 'text-gray-400'}`;
    btn.innerHTML = `
      <div class="relative">
        ${createIcon(item.icon, 'w-6 h-6')}
        ${isActive ? '<span class="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>' : ''}
      </div>
      <span class="text-xs mt-1 font-medium">${item.label}</span>
    `;
    btn.addEventListener('click', () => onChange(item.id));
    container.appendChild(btn);
  });
  
  nav.appendChild(container);
  return nav;
}

async function loadVenues(container: HTMLElement, filter?: string): Promise<void> {
  container.innerHTML = '';
  container.appendChild(createLoading('加载场地中...'));
  
  try {
    const response = await getVenues();
    container.innerHTML = '';
    
    if (!response.success || !response.data || response.data.length === 0) {
      container.innerHTML = `
        <div class="text-center py-16 animate-fade-in">
          <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center text-5xl animate-bounce">
            🏸
          </div>
          <p class="text-gray-500 font-medium mb-2">暂无场地信息</p>
          <p class="text-gray-400 text-sm">附近暂无羽毛球场地</p>
        </div>
      `;
      return;
    }
    
    const sortedVenues = [...response.data];
    
    // 排序
    if (filter === 'rating') {
      sortedVenues.sort((a, b) => b.rating - a.rating);
    } else if (filter === 'price_low') {
      sortedVenues.sort((a, b) => a.price.weekday - b.price.weekday);
    } else if (filter === 'nearby') {
      sortedVenues.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }
    
    sortedVenues.forEach((venue, index) => {
      const card = createVenueCardPassion(venue, () => {
        router.navigate(`/venue/${venue.id}`);
      });
      card.classList.add('animate-slide-up');
      card.style.animationDelay = `${index * 50}ms`;
      container.appendChild(card);
    });
    
  } catch {
    container.innerHTML = `
      <div class="text-center py-16">
        <div class="text-4xl mb-4">😢</div>
        <p class="text-red-500">加载失败</p>
      </div>
    `;
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
      break;
    case 'profile':
      router.navigate(ROUTES.PROFILE);
      break;
  }
}

// 激情版场地卡片
function createVenueCardPassion(venue: Venue, onClick: () => void): HTMLElement {
  const card = document.createElement('div');
  card.className = 'card-passion p-4 mb-3 cursor-pointer';
  
  card.innerHTML = `
    <div class="flex gap-4">
      <!-- 场地图片占位 -->
      <div class="w-24 h-24 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-4xl shadow-lg flex-shrink-0">
        🏸
      </div>
      
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between mb-2">
          <h3 class="font-bold text-gray-900 text-base leading-tight pr-2">${venue.name}</h3>
          ${venue.distance !== undefined ? `
            <span class="px-2 py-0.5 bg-green-50 text-green-600 rounded-full text-xs font-medium flex-shrink-0">
              ${venue.distance}km
            </span>
          ` : ''}
        </div>
        
        <p class="text-sm text-gray-500 flex items-center gap-1 mb-2 truncate">
          ${createIcon('location', 'w-3 h-3 flex-shrink-0')}
          ${venue.address}
        </p>
        
        <div class="flex items-center gap-3 mb-2">
          ${createRating(venue.rating).outerHTML}
          <span class="text-sm font-bold text-orange-500">${venue.rating}</span>
          <span class="text-xs text-gray-400">(${venue.reviewCount}条评价)</span>
        </div>
        
        <div class="flex items-center justify-between">
          <div class="flex gap-1.5">
            ${venue.facilities.slice(0, 2).map(f => `
              <span class="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">${f}</span>
            `).join('')}
            ${venue.facilities.length > 2 ? `<span class="text-xs text-gray-400">+${venue.facilities.length - 2}</span>` : ''}
          </div>
          <div class="text-right">
            <span class="text-xs text-gray-400">¥</span>
            <span class="text-lg font-black text-orange-500">${venue.price.weekday}</span>
            <span class="text-xs text-gray-400">/小时</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 特色标签 -->
    <div class="flex gap-2 mt-3 pt-3 border-t border-gray-100">
      <span class="px-2 py-1 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg text-xs text-green-600 font-medium flex items-center gap-1">
        <span>🏟️</span> ${venue.courts}片场地
      </span>
      <span class="px-2 py-1 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg text-xs text-blue-600 font-medium flex items-center gap-1">
        <span>🕐</span> ${venue.openTime}-${venue.closeTime}
      </span>
    </div>
  `;
  
  card.addEventListener('click', onClick);
  return card;
}

// 场地详情页
export function renderVenueDetailPage(id: string): HTMLElement {
  const container = document.createElement('div');
  container.className = 'min-h-screen bg-gray-50 pb-32';
  
  container.appendChild(createLoading('加载场地信息...'));
  loadVenueDetail(container, id);
  
  return container;
}

async function loadVenueDetail(container: HTMLElement, id: string): Promise<void> {
  try {
    const response = await getVenueDetail(id);
    
    if (!response.success || !response.data) {
      container.innerHTML = `
        <div class="flex flex-col items-center justify-center py-20">
          <div class="text-5xl mb-4 animate-bounce">🔍</div>
          <p class="text-gray-500 mb-4 font-medium">场地不存在</p>
          <button class="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-bold shadow-lg" id="back-venues">
            返回场地列表
          </button>
        </div>
      `;
      
      container.querySelector('#back-venues')?.addEventListener('click', () => {
        router.navigate(ROUTES.VENUE);
      });
      return;
    }
    
    renderVenueDetail(container, response.data);
    
  } catch {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center py-20">
        <div class="text-4xl mb-4">😢</div>
        <p class="text-red-500">加载失败</p>
      </div>
    `;
  }
}

function renderVenueDetail(container: HTMLElement, venue: Venue): void {
  container.innerHTML = '';
  
  // 头部
  const header = document.createElement('header');
  header.className = 'relative overflow-hidden';
  header.innerHTML = `
    <!-- 渐变背景 -->
    <div class="absolute inset-0 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500"></div>
    <div class="absolute inset-0 opacity-20">
      <div class="absolute top-10 right-10 w-32 h-32 bg-yellow-300 rounded-full filter blur-3xl animate-float"></div>
    </div>
    
    <div class="relative px-5 pt-12 pb-6">
      <div class="flex items-center gap-3 mb-4">
        <button id="back-btn" class="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all">
          ${createIcon('chevronLeft', 'w-6 h-6 text-white')}
        </button>
        <h1 class="text-lg font-bold text-white flex-1">场地详情</h1>
      </div>
      
      <!-- 场地信息卡片 -->
      <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
        <div class="flex items-center gap-4 mb-4">
          <div class="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-4xl shadow-lg">
            🏸
          </div>
          <div class="flex-1">
            <h2 class="text-xl font-black text-white leading-tight">${venue.name}</h2>
            <div class="flex items-center gap-2 mt-1">
              ${createRating(venue.rating).outerHTML}
              <span class="text-white font-bold">${venue.rating}</span>
              <span class="text-white/70 text-sm">(${venue.reviewCount}条评价)</span>
            </div>
          </div>
        </div>
        
        <div class="flex items-center gap-2 text-white/80 text-sm">
          ${createIcon('location', 'w-4 h-4')}
          <span>${venue.address}</span>
        </div>
        
        ${venue.distance !== undefined ? `
          <div class="mt-2 px-3 py-1.5 bg-white/20 rounded-full inline-flex items-center gap-1 text-white text-sm">
            <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            距您 ${venue.distance}km
          </div>
        ` : ''}
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
  
  // 价格卡片
  const priceCard = document.createElement('div');
  priceCard.className = 'card-passion p-5';
  priceCard.innerHTML = `
    <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
      <span class="text-xl">💰</span>
      价格信息
    </h3>
    <div class="grid grid-cols-3 gap-3">
      <div class="text-center p-3 bg-blue-50 rounded-2xl">
        <p class="text-xs text-blue-600 font-medium mb-1">工作日</p>
        <p class="text-2xl font-black text-blue-600">¥${venue.price.weekday}</p>
        <p class="text-xs text-blue-400">/小时</p>
      </div>
      <div class="text-center p-3 bg-orange-50 rounded-2xl">
        <p class="text-xs text-orange-600 font-medium mb-1">周末</p>
        <p class="text-2xl font-black text-orange-600">¥${venue.price.weekend}</p>
        <p class="text-xs text-orange-400">/小时</p>
      </div>
      <div class="text-center p-3 bg-red-50 rounded-2xl">
        <p class="text-xs text-red-600 font-medium mb-1">黄金时段</p>
        <p class="text-2xl font-black text-red-600">¥${venue.price.peak}</p>
        <p class="text-xs text-red-400">/小时</p>
      </div>
    </div>
  `;
  
  // 设施卡片
  const facilitiesCard = document.createElement('div');
  facilitiesCard.className = 'card-passion p-5';
  facilitiesCard.innerHTML = `
    <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
      <span class="text-xl">🏢</span>
      场地设施
    </h3>
    <div class="flex flex-wrap gap-2">
      ${venue.facilities.map(f => `
        <span class="px-3 py-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl text-sm text-gray-700 font-medium flex items-center gap-1.5">
          ${getFacilityEmoji(f)}
          ${f}
        </span>
      `).join('')}
    </div>
    <div class="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl flex items-center justify-between">
      <span class="text-sm text-gray-700">场地数量</span>
      <span class="font-bold text-green-600">${venue.courts} 片</span>
    </div>
  `;
  
  // 营业时间卡片
  const timeCard = document.createElement('div');
  timeCard.className = 'card-passion p-5';
  timeCard.innerHTML = `
    <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
      <span class="text-xl">🕐</span>
      营业时间
    </h3>
    <div class="flex items-center justify-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl">
      <div class="text-center">
        <p class="text-xs text-gray-500 mb-1">开门</p>
        <p class="text-xl font-black text-blue-600">${venue.openTime}</p>
      </div>
      <div class="w-8 h-0.5 bg-gray-300 rounded-full"></div>
      <div class="text-center">
        <p class="text-xs text-gray-500 mb-1">关门</p>
        <p class="text-xl font-black text-red-600">${venue.closeTime}</p>
      </div>
    </div>
  `;
  
  // 位置卡片
  const locationCard = document.createElement('div');
  locationCard.className = 'card-passion p-5';
  locationCard.innerHTML = `
    <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
      <span class="text-xl">📍</span>
      位置导航
    </h3>
    <div class="h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
      <div class="text-center">
        <div class="text-4xl mb-2">🗺️</div>
        <p class="text-gray-600 text-sm">${venue.address}</p>
      </div>
    </div>
  `;
  
  content.appendChild(priceCard);
  content.appendChild(facilitiesCard);
  content.appendChild(timeCard);
  content.appendChild(locationCard);
  
  // 底部操作栏
  const bottomBar = document.createElement('div');
  bottomBar.className = 'fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-100 p-4 z-50';
  bottomBar.innerHTML = `
    <button class="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-bold shadow-lg shadow-green-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2" id="book-btn">
      <span class="text-xl">📅</span>
      立即预约
    </button>
  `;
  
  container.appendChild(header);
  container.appendChild(content);
  container.appendChild(bottomBar);
  
  header.querySelector('#back-btn')?.addEventListener('click', () => {
    router.navigate(ROUTES.VENUE);
  });
  
  bottomBar.querySelector('#book-btn')?.addEventListener('click', () => {
    showToast('预约功能开发中', 'info');
  });
}

function getFacilityEmoji(facility: string): string {
  const emojis: Record<string, string> = {
    '淋浴': '🚿',
    '更衣室': '👕',
    '停车场': '🚗',
    '休息区': '🛋️',
    '自动售货机': '🥤',
    '健身房': '💪',
    '咖啡厅': '☕',
    '餐厅': '🍽️',
    '儿童游乐区': '🎠',
  };
  return emojis[facility] || '✨';
}
