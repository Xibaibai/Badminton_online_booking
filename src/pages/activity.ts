import { createIcon, createActivityCard, createLoading, showToast } from '../components';
import { getActivities, getActivityDetail, joinActivity, leaveActivity, createActivity } from '../api';
import type { Activity, SkillLevel } from '../types';
import { router, ROUTES } from '../router';
import { store, STATE_KEYS, initUserFromStorage } from '../store';

// 活动列表页
export function renderActivityPage(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'min-h-screen bg-gray-50 pb-20';
  
  // 头部
  const header = document.createElement('header');
  header.className = 'bg-white px-4 py-4 sticky top-0 z-10 border-b border-gray-100';
  header.innerHTML = `
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-xl font-bold text-gray-900">活动</h1>
      <button id="create-activity-btn" class="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded-full text-sm font-medium">
        ${createIcon('plus', 'w-4 h-4')}
        发起活动
      </button>
    </div>
    
    <div class="flex gap-2 overflow-x-auto pb-2">
      <button class="filter-btn px-3 py-1.5 rounded-full text-sm bg-blue-500 text-white whitespace-nowrap" data-filter="all">全部</button>
      <button class="filter-btn px-3 py-1.5 rounded-full text-sm bg-gray-100 text-gray-600 whitespace-nowrap" data-filter="today">今天</button>
      <button class="filter-btn px-3 py-1.5 rounded-full text-sm bg-gray-100 text-gray-600 whitespace-nowrap" data-filter="tomorrow">明天</button>
      <button class="filter-btn px-3 py-1.5 rounded-full text-sm bg-gray-100 text-gray-600 whitespace-nowrap" data-filter="weekend">本周末</button>
      <button class="filter-btn px-3 py-1.5 rounded-full text-sm bg-gray-100 text-gray-600 whitespace-nowrap" data-filter="free">免费</button>
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
        b.className = 'filter-btn px-3 py-1.5 rounded-full text-sm bg-gray-100 text-gray-600 whitespace-nowrap';
      });
      target.className = 'filter-btn px-3 py-1.5 rounded-full text-sm bg-blue-500 text-white whitespace-nowrap';
      
      loadActivities(listContainer, filter);
    });
  });
  
  // 加载活动
  loadActivities(listContainer);
  
  return container;
}

function createBottomNav(items: { id: string; label: string; icon: string; active?: boolean }[], onChange: (id: string) => void): HTMLElement {
  const nav = document.createElement('nav');
  nav.className = 'fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 pb-safe';
  
  const container = document.createElement('div');
  container.className = 'flex';
  
  items.forEach(item => {
    const btn = document.createElement('button');
    btn.className = `flex-1 flex flex-col items-center py-2 transition-colors ${item.active ? 'text-blue-500' : 'text-gray-400'}`;
    btn.innerHTML = `${createIcon(item.icon, 'w-6 h-6')}<span class="text-xs mt-1">${item.label}</span>`;
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
        <div class="text-center py-12">
          <div class="text-4xl mb-4">🏸</div>
          <p class="text-gray-500">暂无相关活动</p>
        </div>
      `;
      return;
    }
    
    response.data.forEach(activity => {
      const card = createActivityCard(activity, () => {
        router.navigate(`/activity/${activity.id}`);
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
      break;
    case 'venue':
      router.navigate(ROUTES.VENUE);
      break;
    case 'profile':
      router.navigate(ROUTES.PROFILE);
      break;
  }
}

// 活动详情页
export function renderActivityDetailPage(id: string): HTMLElement {
  const container = document.createElement('div');
  container.className = 'min-h-screen bg-gray-50 pb-24';
  
  // 加载状态
  container.appendChild(createLoading('加载活动详情...'));
  
  // 加载活动详情
  loadActivityDetail(container, id);
  
  return container;
}

async function loadActivityDetail(container: HTMLElement, id: string): Promise<void> {
  try {
    const response = await getActivityDetail(id);
    
    if (!response.success || !response.data) {
      container.innerHTML = `
        <div class="flex flex-col items-center justify-center py-20">
          <div class="text-4xl mb-4">🔍</div>
          <p class="text-gray-500 mb-4">活动不存在或已被删除</p>
          <button class="px-4 py-2 bg-blue-500 text-white rounded-lg" id="back-home">
            返回首页
          </button>
        </div>
      `;
      
      container.querySelector('#back-home')?.addEventListener('click', () => {
        router.navigate(ROUTES.HOME);
      });
      return;
    }
    
    const activity = response.data;
    renderActivityDetail(container, activity);
    
  } catch {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center py-20">
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
  header.className = 'bg-white px-4 py-4 sticky top-0 z-10 border-b border-gray-100 flex items-center gap-3';
  header.innerHTML = `
    <button id="back-btn" class="p-2 -ml-2 hover:bg-gray-100 rounded-lg">
      ${createIcon('chevronLeft', 'w-6 h-6')}
    </button>
    <h1 class="text-lg font-semibold text-gray-900 flex-1 truncate">活动详情</h1>
    ${isHost ? '<span class="px-2 py-0.5 bg-orange-100 text-orange-600 rounded text-xs">发起人</span>' : ''}
  `;
  
  // 内容
  const content = document.createElement('div');
  content.className = 'p-4 space-y-4';
  
  // 基本信息卡片
  const infoCard = document.createElement('div');
  infoCard.className = 'bg-white rounded-xl p-4';
  infoCard.innerHTML = `
    <div class="flex items-start justify-between mb-4">
      <h2 class="text-xl font-bold text-gray-900 flex-1 pr-4">${activity.title}</h2>
      <span class="px-2 py-1 rounded text-xs font-medium ${getLevelBadgeClass(activity.level)}">
        ${activity.levelName}
      </span>
    </div>
    
    ${activity.description ? `<p class="text-gray-600 mb-4">${activity.description}</p>` : ''}
    
    <div class="space-y-3">
      <div class="flex items-center text-gray-600">
        ${createIcon('calendar', 'w-5 h-5 mr-3 text-gray-400')}
        <span>${activity.date} ${activity.time}</span>
      </div>
      <div class="flex items-center text-gray-600">
        ${createIcon('clock', 'w-5 h-5 mr-3 text-gray-400')}
        <span>${activity.duration}分钟</span>
      </div>
      <div class="flex items-center text-gray-600">
        ${createIcon('location', 'w-5 h-5 mr-3 text-gray-400')}
        <span class="flex-1">${activity.venue?.name || '场地待定'}</span>
      </div>
      <div class="flex items-center text-gray-600">
        ${createIcon('users', 'w-5 h-5 mr-3 text-gray-400')}
        <span>${activity.currentParticipants}/${activity.maxParticipants} 人</span>
      </div>
      <div class="flex items-center text-gray-600">
        ${createIcon('ticket', 'w-5 h-5 mr-3 text-gray-400')}
        ${activity.fee > 0 ? `<span class="text-orange-500 font-semibold">¥${activity.fee}/人</span>` : '<span class="text-green-500">免费</span>'}
      </div>
    </div>
  `;
  
  // 发起人信息
  const hostCard = document.createElement('div');
  hostCard.className = 'bg-white rounded-xl p-4';
  hostCard.innerHTML = `
    <h3 class="text-sm font-medium text-gray-500 mb-3">发起人</h3>
    <div class="flex items-center gap-3 cursor-pointer" id="host-info">
      <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-lg">
        ${activity.host?.nickname?.[0] || '?'}
      </div>
      <div class="flex-1">
        <div class="flex items-center gap-2">
          <span class="font-medium text-gray-900">${activity.host?.nickname || '未知用户'}</span>
          <span class="px-1.5 py-0.5 rounded text-xs ${getLevelBadgeClass(activity.host?.level || 'beginner')}">${activity.host?.levelName || '新手级'}</span>
        </div>
        <p class="text-sm text-gray-500">信用分 ${activity.host?.creditScore || 0}</p>
      </div>
      ${createIcon('chevronRight', 'w-5 h-5 text-gray-400').outerHTML}
    </div>
  `;
  
  // 参与者列表
  const participantsCard = document.createElement('div');
  participantsCard.className = 'bg-white rounded-xl p-4';
  participantsCard.innerHTML = `
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-medium text-gray-500">参与者 (${activity.currentParticipants})</h3>
    </div>
    <div class="flex flex-wrap gap-2" id="participants-list">
      ${activity.participants.map(p => `
        <div class="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-full">
          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
            ${p.user?.nickname?.[0] || '?'}
          </div>
          <span class="text-sm text-gray-700">${p.user?.nickname || '未知'}</span>
          ${p.userId === activity.hostId ? '<span class="text-xs text-orange-500">👑</span>' : ''}
        </div>
      `).join('')}
    </div>
    ${activity.currentParticipants < activity.maxParticipants ? `
      <p class="text-sm text-gray-400 mt-3">还差 ${activity.maxParticipants - activity.currentParticipants} 人</p>
    ` : '<p class="text-sm text-green-500 mt-3">已满员</p>'}
  `;
  
  // 场地信息
  if (activity.venue) {
    const venueCard = document.createElement('div');
    venueCard.className = 'bg-white rounded-xl p-4 cursor-pointer';
    venueCard.innerHTML = `
      <h3 class="text-sm font-medium text-gray-500 mb-3">活动场地</h3>
      <div class="flex gap-3">
        <div class="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-2xl">
          🏸
        </div>
        <div class="flex-1">
          <h4 class="font-medium text-gray-900">${activity.venue.name}</h4>
          <p class="text-sm text-gray-500">${activity.venue.address}</p>
          <p class="text-sm text-orange-500 mt-1">¥${activity.venue.price.weekday}/小时起</p>
        </div>
        ${createIcon('chevronRight', 'w-5 h-5 text-gray-400 self-center').outerHTML}
      </div>
    `;
    venueCard.addEventListener('click', () => {
      router.navigate(`/venue/${activity.venueId}`);
    });
    content.appendChild(venueCard);
  }
  
  content.appendChild(infoCard);
  content.appendChild(hostCard);
  content.appendChild(participantsCard);
  
  // 底部操作栏
  const bottomBar = document.createElement('div');
  bottomBar.className = 'fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex gap-3';
  
  if (isHost) {
    bottomBar.innerHTML = `
      <button class="flex-1 py-3 bg-gray-100 text-gray-500 rounded-lg font-medium">
        你是发起人
      </button>
    `;
  } else if (isJoined) {
    bottomBar.innerHTML = `
      <button class="flex-1 py-3 bg-orange-500 text-white rounded-lg font-medium" id="leave-btn">
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
      <button class="flex-1 py-3 bg-gray-200 text-gray-500 rounded-lg font-medium" disabled>
        已满员
      </button>
    `;
  } else {
    bottomBar.innerHTML = `
      <div class="flex-1">
        ${activity.fee > 0 ? `<p class="text-sm text-gray-500">费用 ¥${activity.fee}</p>` : ''}
        <button class="w-full py-3 bg-blue-500 text-white rounded-lg font-medium" id="join-btn">
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
          // 重新加载详情
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
  
  // 绑定返回按钮
  header.querySelector('#back-btn')?.addEventListener('click', () => {
    router.navigate(ROUTES.ACTIVITY);
  });
}

function getLevelBadgeClass(level: SkillLevel | string): string {
  const colors: Record<string, string> = {
    beginner: 'bg-green-100 text-green-700',
    entry: 'bg-blue-100 text-blue-700',
    intermediate: 'bg-orange-100 text-orange-700',
    advanced: 'bg-red-100 text-red-700',
    expert: 'bg-purple-100 text-purple-700',
  };
  return colors[level] || 'bg-gray-100 text-gray-700';
}

// 创建活动页
export function renderCreateActivityPage(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'min-h-screen bg-gray-50 pb-24';
  
  // 头部
  const header = document.createElement('header');
  header.className = 'bg-white px-4 py-4 sticky top-0 z-10 border-b border-gray-100 flex items-center gap-3';
  header.innerHTML = `
    <button id="back-btn" class="p-2 -ml-2 hover:bg-gray-100 rounded-lg">
      ${createIcon('chevronLeft', 'w-6 h-6')}
    </button>
    <h1 class="text-lg font-semibold text-gray-900 flex-1">发起活动</h1>
  `;
  
  // 表单
  const form = document.createElement('div');
  form.className = 'p-4 space-y-4';
  
  form.innerHTML = `
    <div class="bg-white rounded-xl p-4 space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">活动标题</label>
        <input 
          type="text" 
          id="activity-title"
          class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
          placeholder="给你的活动起个名字"
          maxlength="30"
        />
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">活动描述</label>
        <textarea 
          id="activity-desc"
          class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-none"
          placeholder="介绍一下活动，吸引更多球友加入"
          rows="3"
          maxlength="200"
        ></textarea>
      </div>
      
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">日期</label>
          <input 
            type="date" 
            id="activity-date"
            class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">时间</label>
          <input 
            type="time" 
            id="activity-time"
            class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            value="10:00"
          />
        </div>
      </div>
      
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">时长(分钟)</label>
          <select id="activity-duration" class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 outline-none bg-white">
            <option value="60">1小时</option>
            <option value="90">1.5小时</option>
            <option value="120" selected>2小时</option>
            <option value="180">3小时</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">人数上限</label>
          <select id="activity-max" class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 outline-none bg-white">
            <option value="4">4人</option>
            <option value="6">6人</option>
            <option value="8" selected>8人</option>
            <option value="12">12人</option>
            <option value="16">16人</option>
          </select>
        </div>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">运动水平</label>
        <select id="activity-level" class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 outline-none bg-white">
          <option value="beginner">新手级 - 刚学不久，能打几个回合</option>
          <option value="entry">入门级 - 有基础，能进行简单对抗</option>
          <option value="intermediate" selected>中级 - 可以打比赛，有一定战术</option>
          <option value="advanced">高级 - 技术全面，经常参加比赛</option>
          <option value="expert">高手级 - 专业或半专业水平</option>
        </select>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">人均费用(元)</label>
        <input 
          type="number" 
          id="activity-fee"
          class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
          placeholder="0 表示免费"
          value="0"
          min="0"
        />
      </div>
    </div>
    
    <div class="bg-white rounded-xl p-4">
      <h3 class="text-sm font-medium text-gray-500 mb-3">免责声明</h3>
      <p class="text-xs text-gray-400 leading-relaxed">
        羽毛球运动存在固有风险，包括运动损伤等。参与者应确保自身身体状况适合参加运动，并了解并承担运动可能带来的风险。平台不对活动现场状况负责。
      </p>
      <label class="flex items-center gap-2 mt-3 cursor-pointer">
        <input type="checkbox" id="agree-disclaimer" class="w-4 h-4 text-blue-500 rounded" />
        <span class="text-sm text-gray-600">我已阅读并同意上述免责声明</span>
      </label>
    </div>
  `;
  
  // 底部按钮
  const bottomBar = document.createElement('div');
  bottomBar.className = 'fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4';
  bottomBar.innerHTML = `
    <button class="w-full py-3 bg-blue-500 text-white rounded-lg font-medium" id="publish-btn">
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
        venueId: 'v1', // 默认场地
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
      btn.textContent = '发布活动';
      btn.disabled = false;
    }
  });
  
  // 设置默认日期为明天
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  (form.querySelector('#activity-date') as HTMLInputElement).value = tomorrow.toISOString().split('T')[0];
  
  return container;
}
