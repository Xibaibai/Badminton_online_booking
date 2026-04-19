import { createIcon, createVenueCard, createLoading, createRating, showToast, createBottomNav } from '../components';
import { getVenues, getVenueDetail } from '../api';
import type { Venue } from '../types';
import { router, ROUTES } from '../router';

// 场地列表页
export function renderVenuePage(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'min-h-screen bg-gray-50 pb-20';
  
  // 头部
  const header = document.createElement('header');
  header.className = 'bg-white px-4 py-4 sticky top-0 z-10 border-b border-gray-100';
  header.innerHTML = `
    <h1 class="text-xl font-bold text-gray-900 mb-4">附近场地</h1>
    <div class="flex gap-2 overflow-x-auto pb-2">
      <button class="filter-btn px-3 py-1.5 rounded-full text-sm bg-blue-500 text-white whitespace-nowrap" data-filter="all">全部</button>
      <button class="filter-btn px-3 py-1.5 rounded-full text-sm bg-gray-100 text-gray-600 whitespace-nowrap" data-filter="rating">评分最高</button>
      <button class="filter-btn px-3 py-1.5 rounded-full text-sm bg-gray-100 text-gray-600 whitespace-nowrap" data-filter="price_low">价格最低</button>
      <button class="filter-btn px-3 py-1.5 rounded-full text-sm bg-gray-100 text-gray-600 whitespace-nowrap" data-filter="price_high">价格最高</button>
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
        b.className = 'filter-btn px-3 py-1.5 rounded-full text-sm bg-gray-100 text-gray-600 whitespace-nowrap';
      });
      target.className = 'filter-btn px-3 py-1.5 rounded-full text-sm bg-blue-500 text-white whitespace-nowrap';
      
      loadVenues(listContainer, filter);
    });
  });
  
  // 加载场地
  loadVenues(listContainer);
  
  return container;
}

async function loadVenues(container: HTMLElement, filter?: string): Promise<void> {
  container.innerHTML = '';
  container.appendChild(createLoading('加载场地中...'));
  
  try {
    const response = await getVenues();
    container.innerHTML = '';
    
    if (!response.success || !response.data || response.data.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12">
          <div class="text-4xl mb-4">🏸</div>
          <p class="text-gray-500">暂无场地信息</p>
        </div>
      `;
      return;
    }
    
    const venues = [...response.data];
    
    // 排序
    if (filter === 'rating') {
      venues.sort((a, b) => b.rating - a.rating);
    } else if (filter === 'price_low') {
      venues.sort((a, b) => a.price.weekday - b.price.weekday);
    } else if (filter === 'price_high') {
      venues.sort((a, b) => b.price.weekday - a.price.weekday);
    }
    
    venues.forEach(venue => {
      const card = createVenueCard(venue, () => {
        router.navigate(`/venue/${venue.id}`);
      });
      container.appendChild(card);
    });
    
  } catch {
    container.innerHTML = `
      <div class="text-center py-12">
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

// 场地详情页
export function renderVenueDetailPage(id: string): HTMLElement {
  const container = document.createElement('div');
  container.className = 'min-h-screen bg-gray-50 pb-24';
  
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
          <div class="text-4xl mb-4">🔍</div>
          <p class="text-gray-500 mb-4">场地不存在</p>
          <button class="px-4 py-2 bg-blue-500 text-white rounded-lg" id="back-venues">
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
        <p class="text-red-500">加载失败</p>
      </div>
    `;
  }
}

function renderVenueDetail(container: HTMLElement, venue: Venue): void {
  container.innerHTML = '';
  
  // 头部
  const header = document.createElement('header');
  header.className = 'bg-white px-4 py-4 sticky top-0 z-10 border-b border-gray-100 flex items-center gap-3';
  header.innerHTML = `
    <button id="back-btn" class="p-2 -ml-2 hover:bg-gray-100 rounded-lg">
      ${createIcon('chevronLeft', 'w-6 h-6')}
    </button>
    <h1 class="text-lg font-semibold text-gray-900 flex-1 truncate">场地详情</h1>
  `;
  
  // 内容
  const content = document.createElement('div');
  content.className = 'p-4 space-y-4';
  
  // 场地图片/图标
  const imageCard = document.createElement('div');
  imageCard.className = 'bg-white rounded-xl p-4 flex items-center justify-center';
  imageCard.innerHTML = `
    <div class="w-full h-48 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-8xl">
      🏸
    </div>
  `;
  
  // 基本信息
  const infoCard = document.createElement('div');
  infoCard.className = 'bg-white rounded-xl p-4';
  infoCard.innerHTML = `
    <div class="flex items-start justify-between mb-3">
      <h2 class="text-xl font-bold text-gray-900">${venue.name}</h2>
      <div class="flex items-center">
        ${createRating(venue.rating).outerHTML}
        <span class="ml-1 text-orange-500 font-semibold">${venue.rating}</span>
        <span class="text-gray-400 text-sm ml-1">(${venue.reviewCount}条评价)</span>
      </div>
    </div>
    
    <div class="flex items-start gap-2 text-gray-600 mb-4">
      ${createIcon('location', 'w-5 h-5 mr-2 text-gray-400 flex-shrink-0 mt-0.5')}
      <span>${venue.address}</span>
    </div>
    
    ${venue.phone ? `
      <div class="flex items-center gap-2 text-gray-600 mb-4">
        ${createIcon('phone', 'w-5 h-5 mr-2 text-gray-400')}
        <span>${venue.phone}</span>
      </div>
    ` : ''}
    
    <div class="flex items-center gap-2 text-gray-600">
      ${createIcon('clock', 'w-5 h-5 mr-2 text-gray-400')}
      <span>营业时间: ${venue.openTime} - ${venue.closeTime}</span>
    </div>
  `;
  
  // 价格信息
  const priceCard = document.createElement('div');
  priceCard.className = 'bg-white rounded-xl p-4';
  priceCard.innerHTML = `
    <h3 class="text-sm font-medium text-gray-500 mb-3">价格信息</h3>
    <div class="grid grid-cols-3 gap-4 text-center">
      <div class="p-3 bg-blue-50 rounded-lg">
        <p class="text-xs text-gray-500 mb-1">工作日</p>
        <p class="text-xl font-bold text-blue-600">¥${venue.price.weekday}</p>
        <p class="text-xs text-gray-400">/小时</p>
      </div>
      <div class="p-3 bg-orange-50 rounded-lg">
        <p class="text-xs text-gray-500 mb-1">周末</p>
        <p class="text-xl font-bold text-orange-600">¥${venue.price.weekend}</p>
        <p class="text-xs text-gray-400">/小时</p>
      </div>
      <div class="p-3 bg-red-50 rounded-lg">
        <p class="text-xs text-gray-500 mb-1">黄金时段</p>
        <p class="text-xl font-bold text-red-600">¥${venue.price.peak}</p>
        <p class="text-xs text-gray-400">/小时</p>
      </div>
    </div>
  `;
  
  // 场地设施
  const facilitiesCard = document.createElement('div');
  facilitiesCard.className = 'bg-white rounded-xl p-4';
  facilitiesCard.innerHTML = `
    <h3 class="text-sm font-medium text-gray-500 mb-3">场地设施</h3>
    <div class="flex flex-wrap gap-2">
      ${venue.facilities.map(f => `
        <span class="px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-600">${f}</span>
      `).join('')}
    </div>
    <p class="text-sm text-gray-500 mt-3">共 ${venue.courts} 片场地</p>
  `;
  
  // 位置信息
  const locationCard = document.createElement('div');
  locationCard.className = 'bg-white rounded-xl p-4 cursor-pointer';
  locationCard.innerHTML = `
    <h3 class="text-sm font-medium text-gray-500 mb-3">位置</h3>
    <div class="h-40 bg-gray-100 rounded-lg flex items-center justify-center">
      <div class="text-center">
        <div class="text-3xl mb-2">📍</div>
        <p class="text-sm text-gray-500">${venue.location.district || '查看地图'}</p>
      </div>
    </div>
  `;
  
  content.appendChild(imageCard);
  content.appendChild(infoCard);
  content.appendChild(priceCard);
  content.appendChild(facilitiesCard);
  content.appendChild(locationCard);
  
  // 底部操作栏
  const bottomBar = document.createElement('div');
  bottomBar.className = 'fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex gap-3';
  bottomBar.innerHTML = `
    <button class="flex-1 py-3 bg-blue-500 text-white rounded-lg font-medium" id="book-btn">
      立即预约
    </button>
  `;
  
  container.appendChild(header);
  container.appendChild(content);
  container.appendChild(bottomBar);
  
  // 绑定事件
  header.querySelector('#back-btn')?.addEventListener('click', () => {
    router.navigate(ROUTES.VENUE);
  });
  
  bottomBar.querySelector('#book-btn')?.addEventListener('click', () => {
    showToast('预约功能开发中', 'info');
  });
}
