import { createIcon, createActivityCard, createLoading, showToast } from '../components';
import { getActivities, getActivityDetail, joinActivity, leaveActivity, createActivity } from '../api';
import type { Activity, SkillLevel } from '../types';
import { router, ROUTES } from '../router';
import { store, STATE_KEYS, initUserFromStorage } from '../store';

// 活动列表页 - 激情运动风格
export function renderActivityPage(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'min-h-screen bg-gray-50 pb-20';
  
  // 头部
  const header = document.createElement('header');
  header.className = 'relative overflow-hidden';
  header.innerHTML = `
    <!-- 渐变背景 -->
    <div class="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500"></div>
    <div class="absolute inset-0 opacity-20">
      <div class="absolute top-5 right-5 w-40 h-40 bg-yellow-300 rounded-full filter blur-3xl animate-spin-slow"></div>
      <div class="absolute -bottom-10 -left-10 w-32 h-32 bg-pink-300 rounded-full filter blur-3xl animate-float"></div>
    </div>
    
    <div class="relative px-5 pt-12 pb-5">
      <!-- 标题 -->
      <div class="flex items-center justify-between mb-5">
        <div>
          <h1 class="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span class="text-3xl">⚡</span>
            发现活动
          </h1>
          <p class="text-white/80 text-sm mt-1">和志同道合的球友一起嗨</p>
        </div>
      </div>
      
      <!-- 发起活动按钮 -->
      <button id="create-activity-btn" class="w-full py-3.5 px-4 bg-white rounded-2xl font-bold text-orange-500 shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
        <span class="text-xl">🎉</span>
        发起活动
      </button>
    </div>
    
    <!-- 筛选标签 -->
    <div class="relative bg-gray-50 rounded-t-3xl px-4 pt-4">
      <div class="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
        <button class="filter-btn px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-200 whitespace-nowrap" data-filter="all">全部</button>
        <button class="filter-btn px-4 py-2 rounded-full text-sm font-bold bg-white text-gray-600 border border-gray-200 whitespace-nowrap hover:border-orange-300" data-filter="today">🔥 今天</button>
        <button class="filter-btn px-4 py-2 rounded-full text-sm font-bold bg-white text-gray-600 border border-gray-200 whitespace-nowrap hover:border-orange-300" data-filter="tomorrow">📅 明天</button>
        <button class="filter-btn px-4 py-2 rounded-full text-sm font-bold bg-white text-gray-600 border border-gray-200 whitespace-nowrap hover:border-orange-300" data-filter="weekend">🎊 周末</button>
        <button class="filter-btn px-4 py-2 rounded-full text-sm font-bold bg-white text-gray-600 border border-gray-200 whitespace-nowrap hover:border-orange-300" data-filter="free">💚 免费</button>
      </div>
    </div>
  `;
  
  // 活动列表
  const listContainer = document.createElement('div');
  listContainer.className = 'p-4 space-y-4';
  listContainer.appendChild(createLoading('加载活动中...'));
  
  container.appendChild(header);
  container.appendChild(listContainer);
  
  // 底部导航
  container.appendChild(createBottomNav([
    { id: 'home', label: '首页', icon: 'home' },
    { id: 'activity', label: '活动', icon: 'calendar', active: true },
    { id: 'venue', label: '场地', icon: 'location' },
    { id: 'profile', label: '我的', icon: 'user' },
  ], (id) => handleNavChange(id)));
  
  // 绑定事件
  header.querySelector('#create-activity-btn')?.addEventListener('click', () => {
    router.navigate(ROUTES.ACTIVITY_CREATE);
  });
  
  header.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLElement;
      const filter = target.dataset.filter;
      
      header.querySelectorAll('.filter-btn').forEach(b => {
        b.className = b === target 
          ? 'filter-btn px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-200 whitespace-nowrap'
          : 'filter-btn px-4 py-2 rounded-full text-sm font-bold bg-white text-gray-600 border border-gray-200 whitespace-nowrap hover:border-orange-300';
      });
      
      loadActivities(listContainer, filter);
    });
  });
  
  // 加载活动
  loadActivities(listContainer);
  
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
    btn.className = `flex-1 flex flex-col items-center py-2.5 transition-all ${isActive ? 'text-orange-500' : 'text-gray-400'}`;
    btn.innerHTML = `
      <div class="relative">
        ${createIcon(item.icon, 'w-6 h-6')}
        ${isActive ? '<span class="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>' : ''}
      </div>
      <span class="text-xs mt-1 font-medium">${item.label}</span>
    `;
    btn.addEventListener('click', () => onChange(item.id));
    container.appendChild(btn);
  });
  
  nav.appendChild(container);
  return nav;
}

async function loadActivities(container: HTMLElement, filter?: string): Promise<void> {
  container.innerHTML = '';
  container.appendChild(createLoading('加载活动中...'));
  
  try {
    let filters: { level?: SkillLevel; date?: string; hasFee?: boolean } | undefined;
    
    if (filter === 'today') {
      filters = { date: new Date().toISOString().split('T')[0] };
    } else if (filter === 'free') {
      filters = { hasFee: false };
    }
    
    const response = await getActivities(filters);
    container.innerHTML = '';
    
    if (!response.success || !response.data || response.data.length === 0) {
      container.innerHTML = `
        <div class="text-center py-16 animate-fade-in">
          <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-5xl animate-bounce">
            🏸
          </div>
          <p class="text-gray-500 font-medium mb-2">暂无相关活动</p>
          <p class="text-gray-400 text-sm">成为第一个发起人吧！</p>
        </div>
      `;
      return;
    }
    
    response.data.forEach((activity, index) => {
      const card = createActivityCard(activity, () => {
        router.navigate(`/activity/${activity.id}`);
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
      break;
    case 'venue':
      router.navigate(ROUTES.VENUE);
      break;
    case 'profile':
      router.navigate(ROUTES.PROFILE);
      break;
  }
}

// 活动详情页 - 激情风格
export function renderActivityDetailPage(id: string): HTMLElement {
  const container = document.createElement('div');
  container.className = 'min-h-screen bg-gray-50 pb-32';
  
  container.appendChild(createLoading('加载活动详情...'));
  loadActivityDetail(container, id);
  
  return container;
}

async function loadActivityDetail(container: HTMLElement, id: string): Promise<void> {
  try {
    const response = await getActivityDetail(id);
    
    if (!response.success || !response.data) {
      container.innerHTML = `
        <div class="flex flex-col items-center justify-center py-20">
          <div class="text-5xl mb-4 animate-bounce">🔍</div>
          <p class="text-gray-500 mb-4 font-medium">活动不存在或已被删除</p>
          <button class="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl font-bold shadow-lg" id="back-home">
            返回首页
          </button>
        </div>
      `;
      
      container.querySelector('#back-home')?.addEventListener('click', () => {
        router.navigate(ROUTES.HOME);
      });
      return;
    }
    
    renderActivityDetail(container, response.data);
    
  } catch {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center py-20">
        <div class="text-4xl mb-4">😢</div>
        <p class="text-red-500">加载失败</p>
      </div>
    `;
  }
}

function renderActivityDetail(container: HTMLElement, activity: Activity): void {
  container.innerHTML = '';
  
  initUserFromStorage();
  const currentUser = store.getState<{ id: string }>(STATE_KEYS.USER);
  const isHost = currentUser?.id === activity.hostId;
  const isJoined = activity.participants.some(p => p.userId === currentUser?.id);
  
  // 头部
  const header = document.createElement('header');
  header.className = 'relative overflow-hidden';
  header.innerHTML = `
    <!-- 渐变背景 -->
    <div class="absolute inset-0 bg-gradient-to-br from-orange-500 via-pink-500 to-red-500"></div>
    <div class="absolute inset-0 opacity-20">
      <div class="absolute top-10 right-10 w-32 h-32 bg-yellow-300 rounded-full filter blur-3xl animate-float"></div>
    </div>
    
    <div class="relative px-5 pt-12 pb-6">
      <div class="flex items-center gap-3 mb-4">
        <button id="back-btn" class="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all">
          ${createIcon('chevronLeft', 'w-6 h-6 text-white')}
        </button>
        <h1 class="text-lg font-bold text-white flex-1">活动详情</h1>
        ${isHost ? '<span class="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">👑 发起人</span>' : ''}
      </div>
      
      <!-- 活动标题卡片 -->
      <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
        <div class="flex items-start justify-between mb-3">
          <h2 class="text-xl font-black text-white leading-tight flex-1 pr-4">${activity.title}</h2>
          <span class="px-3 py-1 bg-white rounded-full text-orange-500 text-sm font-bold">
            ${activity.levelName}
          </span>
        </div>
        ${activity.description ? `<p class="text-white/80 text-sm mb-3">${activity.description}</p>` : ''}
        
        <!-- 活动信息 -->
        <div class="grid grid-cols-2 gap-3">
          <div class="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
            <span class="text-lg">📅</span>
            <div>
              <p class="text-white text-xs">日期时间</p>
              <p class="text-white font-medium text-sm">${activity.date} ${activity.time}</p>
            </div>
          </div>
          <div class="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
            <span class="text-lg">⏱️</span>
            <div>
              <p class="text-white text-xs">持续时间</p>
              <p class="text-white font-medium text-sm">${activity.duration}分钟</p>
            </div>
          </div>
          <div class="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
            <span class="text-lg">👥</span>
            <div>
              <p class="text-white text-xs">参与人数</p>
              <p class="text-white font-medium text-sm">${activity.currentParticipants}/${activity.maxParticipants}</p>
            </div>
          </div>
          <div class="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
            <span class="text-lg">💰</span>
            <div>
              <p class="text-white text-xs">人均费用</p>
              <p class="text-white font-bold text-sm">${activity.fee > 0 ? `¥${activity.fee}` : '免费'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 波浪装饰 -->
    <div class="absolute -bottom-1 left-0 right-0">
      <svg viewBox="0 0 375 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
        <path d="M0 24H375V0C335.19 0 307.5 12 259.5 12C211.5 12 183.5 0 148 0C112.5 0 84 12 60 12C36 12 0 0 0 0V24Z" fill="#F9FAFB"/>
      </svg>
    </div>
  `;
  
  // 内容
  const content = document.createElement('div');
  content.className = 'px-4 space-y-4';
  
  // 场地信息
  if (activity.venue) {
    const venueCard = document.createElement('div');
    venueCard.className = 'card-passion p-4 cursor-pointer';
    venueCard.innerHTML = `
      <div class="flex items-center gap-3 mb-3">
        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-2xl shadow-lg">
          🏸
        </div>
        <div class="flex-1">
          <h3 class="font-bold text-gray-900">${activity.venue.name}</h3>
          <p class="text-sm text-gray-500 flex items-center gap-1">
            ${createIcon('location', 'w-3 h-3')}
            ${activity.venue.address}
          </p>
        </div>
        <span class="text-orange-500 font-bold">¥${activity.venue.price.weekday}/h</span>
      </div>
      ${activity.venue.distance ? `
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <span class="px-2 py-0.5 bg-orange-50 text-orange-500 rounded-full font-medium">距您 ${activity.venue.distance}km</span>
        </div>
      ` : ''}
    `;
    venueCard.addEventListener('click', () => {
      router.navigate(`/venue/${activity.venueId}`);
    });
    content.appendChild(venueCard);
  }
  
  // 发起人信息
  const hostCard = document.createElement('div');
  hostCard.className = 'card-passion p-4';
  hostCard.innerHTML = `
    <h3 class="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
      <span class="w-5 h-5 rounded-full bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center text-white text-xs">👑</span>
      发起人
    </h3>
    <div class="flex items-center gap-3">
      <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
        ${activity.host?.nickname?.[0] || '?'}
      </div>
      <div class="flex-1">
        <div class="flex items-center gap-2">
          <span class="font-bold text-gray-900">${activity.host?.nickname || '未知用户'}</span>
          <span class="px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full text-xs font-medium">${activity.host?.levelName || '新手级'}</span>
        </div>
        <p class="text-sm text-gray-500 flex items-center gap-1 mt-1">
          <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          信用分 ${activity.host?.creditScore || 0} | 发起活动 ${Math.floor(Math.random() * 20 + 5)} 场
        </p>
      </div>
    </div>
  `;
  content.appendChild(hostCard);
  
  // 参与者列表
  const participantsCard = document.createElement('div');
  participantsCard.className = 'card-passion p-4';
  participantsCard.innerHTML = `
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-sm font-medium text-gray-500 flex items-center gap-2">
        <span>👥</span>
        已报名 (${activity.currentParticipants})
      </h3>
      ${activity.currentParticipants < activity.maxParticipants 
        ? `<span class="text-xs text-orange-500 font-medium bg-orange-50 px-2 py-1 rounded-full">还差 ${activity.maxParticipants - activity.currentParticipants} 人</span>`
        : '<span class="text-xs text-green-500 font-medium bg-green-50 px-2 py-1 rounded-full">已满员</span>'
      }
    </div>
    
    <!-- 参与者头像 -->
    <div class="flex flex-wrap gap-2">
      ${activity.participants.map((p, i) => `
        <div class="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
          <div class="w-8 h-8 rounded-xl bg-gradient-to-br ${['from-orange-400 to-red-500', 'from-blue-400 to-purple-500', 'from-green-400 to-emerald-500', 'from-yellow-400 to-orange-500'][i % 4]} flex items-center justify-center text-white text-sm font-bold">
            ${p.user?.nickname?.[0] || '?'}
          </div>
          <span class="text-sm text-gray-700 font-medium">${p.user?.nickname || '未知'}</span>
          ${p.userId === activity.hostId ? '<span class="text-xs">👑</span>' : ''}
        </div>
      `).join('')}
    </div>
    
    <!-- 进度条 -->
    <div class="mt-4 pt-4 border-t border-gray-100">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs text-gray-500">报名进度</span>
        <span class="text-sm font-bold text-orange-500">${Math.round((activity.currentParticipants / activity.maxParticipants) * 100)}%</span>
      </div>
      <div class="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div class="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-pulse" style="width: ${(activity.currentParticipants / activity.maxParticipants) * 100}%"></div>
      </div>
    </div>
  `;
  content.appendChild(participantsCard);
  
  // 底部操作栏
  const bottomBar = document.createElement('div');
  bottomBar.className = 'fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-100 p-4 z-50';
  
  if (isHost) {
    bottomBar.innerHTML = `
      <div class="flex items-center justify-center gap-2 py-3 bg-gray-100 rounded-2xl text-gray-500 font-bold">
        <span>👑</span>
        你是发起人
      </div>
    `;
  } else if (isJoined) {
    bottomBar.innerHTML = `
      <button class="w-full py-3.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl font-bold shadow-lg shadow-red-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2" id="leave-btn">
        <span>🚪</span>
        退出活动
      </button>
    `;
    
    bottomBar.querySelector('#leave-btn')?.addEventListener('click', async () => {
      const confirmed = confirm('确定要退出此活动吗？');
      if (!confirmed) return;
      
      try {
        const response = await leaveActivity(activity.id);
        if (response.success) {
          showToast('已退出活动', 'success');
          router.navigate(ROUTES.ACTIVITY);
        } else {
          showToast(response.error || '操作失败', 'error');
        }
      } catch {
        showToast('网络错误', 'error');
      }
    });
  } else if (activity.currentParticipants >= activity.maxParticipants) {
    bottomBar.innerHTML = `
      <div class="flex items-center justify-center gap-2 py-3.5 bg-gray-200 rounded-2xl text-gray-500 font-bold">
        <span>😢</span>
        已满员
      </div>
    `;
  } else {
    bottomBar.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="text-right">
          ${activity.fee > 0 ? `
            <p class="text-xs text-gray-500">人均费用</p>
            <p class="text-xl font-black text-orange-500">¥${activity.fee}</p>
          ` : `
            <p class="text-xl font-black text-green-500">免费</p>
          `}
        </div>
        <button class="flex-1 py-3.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl font-bold shadow-lg shadow-orange-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2" id="join-btn">
          <span class="text-xl">🎉</span>
          立即报名
        </button>
      </div>
    `;
    
    bottomBar.querySelector('#join-btn')?.addEventListener('click', async () => {
      if (!currentUser) {
        router.navigate(ROUTES.LOGIN);
        return;
      }
      
      try {
        const response = await joinActivity(activity.id);
        if (response.success) {
          showToast('报名成功', 'success');
          loadActivityDetail(container, activity.id);
        } else {
          showToast(response.error || '报名失败', 'error');
        }
      } catch {
        showToast('网络错误', 'error');
      }
    });
  }
  
  container.appendChild(header);
  container.appendChild(content);
  container.appendChild(bottomBar);
  
  header.querySelector('#back-btn')?.addEventListener('click', () => {
    router.navigate(ROUTES.ACTIVITY);
  });
}

// 创建活动页 - 激情风格
export function renderCreateActivityPage(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'min-h-screen bg-gray-50 pb-32';
  
  // 头部
  const header = document.createElement('header');
  header.className = 'relative overflow-hidden';
  header.innerHTML = `
    <div class="absolute inset-0 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500"></div>
    <div class="absolute inset-0 opacity-20">
      <div class="absolute -top-10 -right-10 w-40 h-40 bg-yellow-300 rounded-full filter blur-3xl animate-float"></div>
    </div>
    
    <div class="relative px-5 pt-12 pb-6">
      <div class="flex items-center gap-3">
        <button id="back-btn" class="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all">
          ${createIcon('chevronLeft', 'w-6 h-6 text-white')}
        </button>
        <div>
          <h1 class="text-lg font-bold text-white flex items-center gap-2">
            <span class="text-2xl">🎉</span>
            发起活动
          </h1>
          <p class="text-white/80 text-xs">创建一个属于你的球局</p>
        </div>
      </div>
    </div>
  `;
  
  // 表单
  const form = document.createElement('div');
  form.className = 'px-4 space-y-4';
  
  form.innerHTML = `
    <!-- 基本信息 -->
    <div class="card-passion p-5">
      <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span class="w-1 h-5 rounded-full bg-gradient-to-b from-green-500 to-emerald-500"></span>
        基本信息
      </h3>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">活动标题</label>
          <input 
            type="text" 
            id="activity-title"
            class="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
            placeholder="给你的活动起个响亮的名字"
            maxlength="30"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">活动描述</label>
          <textarea 
            id="activity-desc"
            class="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all resize-none"
            placeholder="介绍一下活动，吸引更多球友"
            rows="3"
            maxlength="200"
          ></textarea>
        </div>
      </div>
    </div>
    
    <!-- 时间设置 -->
    <div class="card-passion p-5">
      <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span class="w-1 h-5 rounded-full bg-gradient-to-b from-orange-500 to-red-500"></span>
        时间设置
      </h3>
      
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">日期</label>
          <input 
            type="date" 
            id="activity-date"
            class="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-orange-500 outline-none bg-white"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">时间</label>
          <input 
            type="time" 
            id="activity-time"
            class="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-orange-500 outline-none bg-white"
            value="10:00"
          />
        </div>
      </div>
      
      <div class="grid grid-cols-2 gap-4 mt-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">时长</label>
          <select id="activity-duration" class="w-full px-4 py-3.5 rounded-xl border border-gray-200 outline-none bg-white">
            <option value="60">1小时</option>
            <option value="90">1.5小时</option>
            <option value="120" selected>2小时</option>
            <option value="180">3小时</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">人数上限</label>
          <select id="activity-max" class="w-full px-4 py-3.5 rounded-xl border border-gray-200 outline-none bg-white">
            <option value="4">4人</option>
            <option value="6">6人</option>
            <option value="8" selected>8人</option>
            <option value="12">12人</option>
            <option value="16">16人</option>
          </select>
        </div>
      </div>
    </div>
    
    <!-- 水平与费用 -->
    <div class="card-passion p-5">
      <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span class="w-1 h-5 rounded-full bg-gradient-to-b from-blue-500 to-purple-500"></span>
        水平与费用
      </h3>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">运动水平</label>
          <select id="activity-level" class="w-full px-4 py-3.5 rounded-xl border border-gray-200 outline-none bg-white">
            <option value="beginner">🌱 新手级 - 刚学不久</option>
            <option value="entry">⭐ 入门级 - 有基础</option>
            <option value="intermediate" selected>🔥 中级 - 可以比赛</option>
            <option value="advanced">💪 高级 - 技术全面</option>
            <option value="expert">👑 高手级 - 专业水平</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">人均费用</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">¥</span>
            <input 
              type="number" 
              id="activity-fee"
              class="w-full pl-8 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-orange-500 outline-none"
              placeholder="0 表示免费"
              value="0"
              min="0"
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- 免责声明 -->
    <div class="card-passion p-5">
      <div class="flex items-start gap-3 mb-4">
        <span class="text-2xl">⚠️</span>
        <div>
          <h3 class="font-bold text-gray-900 mb-1">运动风险提示</h3>
          <p class="text-xs text-gray-500 leading-relaxed">
            羽毛球运动存在固有风险，包括运动损伤等。请确保自身身体状况适合参加运动，并了解并承担运动可能带来的风险。
          </p>
        </div>
      </div>
      <label class="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" id="agree-disclaimer" class="w-5 h-5 rounded bg-gradient-to-r from-orange-500 to-red-500 border-0 cursor-pointer" />
        <span class="text-sm text-gray-600">我已阅读并同意上述免责声明</span>
      </label>
    </div>
  `;
  
  // 底部按钮
  const bottomBar = document.createElement('div');
  bottomBar.className = 'fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-100 p-4 z-50';
  bottomBar.innerHTML = `
    <button class="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-bold shadow-lg shadow-green-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2" id="publish-btn">
      <span class="text-xl">🚀</span>
      发布活动
    </button>
  `;
  
  container.appendChild(header);
  container.appendChild(form);
  container.appendChild(bottomBar);
  
  // 绑定事件
  header.querySelector('#back-btn')?.addEventListener('click', () => {
    router.navigate(ROUTES.ACTIVITY);
  });
  
  bottomBar.querySelector('#publish-btn')?.addEventListener('click', async () => {
    const title = (form.querySelector('#activity-title') as HTMLInputElement).value.trim();
    const desc = (form.querySelector('#activity-desc') as HTMLTextAreaElement).value.trim();
    const date = (form.querySelector('#activity-date') as HTMLInputElement).value;
    const time = (form.querySelector('#activity-time') as HTMLInputElement).value;
    const duration = parseInt((form.querySelector('#activity-duration') as HTMLSelectElement).value);
    const max = parseInt((form.querySelector('#activity-max') as HTMLSelectElement).value);
    const level = (form.querySelector('#activity-level') as HTMLSelectElement).value as SkillLevel;
    const fee = parseInt((form.querySelector('#activity-fee') as HTMLInputElement).value) || 0;
    const agree = (form.querySelector('#agree-disclaimer') as HTMLInputElement).checked;
    
    if (!title) {
      showToast('请输入活动标题', 'error');
      return;
    }
    
    if (!date) {
      showToast('请选择活动日期', 'error');
      return;
    }
    
    if (!agree) {
      showToast('请阅读并同意免责声明', 'error');
      return;
    }
    
    const btn = bottomBar.querySelector('#publish-btn') as HTMLButtonElement;
    btn.textContent = '发布中...';
    btn.disabled = true;
    
    try {
      const response = await createActivity({
        title,
        description: desc,
        date,
        time,
        duration,
        maxParticipants: max,
        level,
        fee,
        venueId: 'v1',
      });
      
      if (response.success) {
        showToast('活动发布成功', 'success');
        router.navigate(`/activity/${response.data?.id}`);
      } else {
        showToast(response.error || '发布失败', 'error');
      }
    } catch {
      showToast('网络错误', 'error');
    } finally {
      btn.innerHTML = `<span class="text-xl">🚀</span>发布活动`;
      btn.disabled = false;
    }
  });
  
  // 设置默认日期为明天
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  (form.querySelector('#activity-date') as HTMLInputElement).value = tomorrow.toISOString().split('T')[0];
  
  return container;
}
