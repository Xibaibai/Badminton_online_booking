import { CLASS_NAMES } from '../styles/constants';
import type { SkillLevel, Activity, Venue, User } from '../types';

// 创建图标 SVG
export function createIcon(name: string, className = 'w-5 h-5'): string {
  const icons: Record<string, string> = {
    home: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>',
    search: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>',
    user: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>',
    plus: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>',
    location: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>',
    calendar: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>',
    clock: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>',
    users: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>',
    star: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>',
    chevronRight: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>',
    chevronLeft: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>',
    check: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>',
    x: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>',
    menu: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>',
    setting: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>',
    logout: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>',
    badminton: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z"/>',
    phone: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>',
    ticket: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>',
  };
  
  return `<svg class="${className}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">${icons[name] || ''}</svg>`;
}

// Button 组件
export function createButton(
  text: string,
  onClick: () => void,
  options: {
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    className?: string;
    icon?: string;
  } = {}
): HTMLElement {
  const { variant = 'primary', size = 'md', disabled = false, loading = false, className = '', icon } = options;
  
  const button = document.createElement('button');
  button.className = `${CLASS_NAMES.BUTTON_BASE} ${getButtonVariant(variant)} ${getButtonSize(size)} ${className}`;
  button.disabled = disabled || loading;
  
  if (loading) {
    button.innerHTML = `<svg class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>加载中...`;
  } else {
    button.innerHTML = icon ? `${createIcon(icon, 'w-4 h-4 mr-2')}${text}` : text;
  }
  
  button.addEventListener('click', () => !disabled && !loading && onClick());
  
  return button;
}

function getButtonVariant(variant: string): string {
  const variants: Record<string, string> = {
    primary: CLASS_NAMES.BUTTON_PRIMARY,
    secondary: CLASS_NAMES.BUTTON_SECONDARY,
    outline: CLASS_NAMES.BUTTON_OUTLINE,
    danger: CLASS_NAMES.BUTTON_DANGER,
  };
  return variants[variant] || CLASS_NAMES.BUTTON_PRIMARY;
}

function getButtonSize(size: string): string {
  const sizes: Record<string, string> = {
    sm: CLASS_NAMES.BUTTON_SM,
    lg: CLASS_NAMES.BUTTON_LG,
  };
  return sizes[size] || '';
}

// 卡片组件
export function createCard(content: string | HTMLElement, className = ''): HTMLElement {
  const card = document.createElement('div');
  card.className = `${CLASS_NAMES.CARD} ${CLASS_NAMES.CARD_HOVER} ${className}`;
  
  if (typeof content === 'string') {
    card.innerHTML = content;
  } else {
    card.appendChild(content);
  }
  
  return card;
}

// 头像组件
export function createAvatar(src?: string, size: 'sm' | 'md' | 'lg' | 'xl' = 'md', fallback = ''): HTMLElement {
  const sizeMap = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-16 h-16', xl: 'w-24 h-24' };
  
  const avatar = document.createElement('div');
  avatar.className = `${sizeMap[size]} rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold overflow-hidden`;
  
  if (src) {
    const img = document.createElement('img');
    img.src = src;
    img.className = 'w-full h-full object-cover';
    img.onerror = () => {
      avatar.textContent = fallback || '?';
    };
    avatar.appendChild(img);
  } else {
    avatar.textContent = fallback || '?';
  }
  
  return avatar;
}

// 标签组件
export function createTag(text: string, color: string = 'blue'): HTMLElement {
  const tag = document.createElement('span');
  tag.className = `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${color}-100 text-${color}-700`;
  tag.textContent = text;
  return tag;
}

// 星级评分组件
export function createRating(rating: number, max = 5): HTMLElement {
  const container = document.createElement('div');
  container.className = 'flex items-center space-x-0.5';
  
  for (let i = 1; i <= max; i++) {
    const star = document.createElement('span');
    star.className = i <= rating ? 'text-yellow-400' : 'text-gray-300';
    star.innerHTML = createIcon('star', 'w-4 h-4');
    container.appendChild(star);
  }
  
  return container;
}

// 加载动画
export function createLoading(text = '加载中...'): HTMLElement {
  const container = document.createElement('div');
  container.className = 'flex flex-col items-center justify-center py-12';
  container.innerHTML = `
    <svg class="animate-spin h-8 w-8 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <p class="text-gray-500">${text}</p>
  `;
  return container;
}

// 空状态
export function createEmptyState(message: string, icon = 'search'): HTMLElement {
  const container = document.createElement('div');
  container.className = 'flex flex-col items-center justify-center py-12 text-center';
  container.innerHTML = `
    <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-gray-400">
      ${createIcon(icon)}
    </div>
    <p class="text-gray-500">${message}</p>
  `;
  return container;
}

// Toast 通知
export function showToast(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info'): void {
  const toast = document.createElement('div');
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-orange-500',
  };
  
  toast.className = `fixed top-4 left-1/2 transform -translate-x-1/2 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-down`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('animate-fade-out-up');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// 活动卡片
export function createActivityCard(activity: Activity, onClick: () => void): HTMLElement {
  const card = document.createElement('div');
  card.className = `${CLASS_NAMES.CARD} p-4 cursor-pointer active:bg-gray-50`;
  
  card.innerHTML = `
    <div class="flex items-start justify-between mb-3">
      <div class="flex-1">
        <h3 class="${CLASS_NAMES.TEXT_TITLE} mb-1">${activity.title}</h3>
        <div class="flex items-center text-sm text-gray-500 space-x-3">
          <span class="flex items-center">
            ${createIcon('calendar', 'w-4 h-4 mr-1')}
            ${activity.date} ${activity.time}
          </span>
        </div>
      </div>
      <span class="${getLevelBadgeClass(activity.level)} px-2 py-0.5 rounded text-xs font-medium">
        ${activity.levelName}
      </span>
    </div>
    
    <div class="flex items-center justify-between text-sm">
      <div class="flex items-center text-gray-500">
        ${createIcon('location', 'w-4 h-4 mr-1')}
        <span class="truncate max-w-[150px]">${activity.venue?.name || '待定'}</span>
      </div>
      <div class="flex items-center space-x-3">
        <span class="flex items-center text-gray-500">
          ${createIcon('users', 'w-4 h-4 mr-1')}
          ${activity.currentParticipants}/${activity.maxParticipants}
        </span>
        ${activity.fee > 0 ? `<span class="text-orange-500 font-medium">¥${activity.fee}</span>` : '<span class="text-green-500">免费</span>'}
      </div>
    </div>
  `;
  
  card.addEventListener('click', onClick);
  return card;
}

// 场地卡片
export function createVenueCard(venue: Venue, onClick: () => void): HTMLElement {
  const card = document.createElement('div');
  card.className = `${CLASS_NAMES.CARD} p-4 cursor-pointer active:bg-gray-50`;
  
  card.innerHTML = `
    <div class="flex gap-4">
      <div class="w-20 h-20 rounded-lg bg-gray-200 flex-shrink-0 overflow-hidden">
        ${venue.images?.[0] ? `<img src="${venue.images[0]}" class="w-full h-full object-cover" alt="${venue.name}"/>` : `<div class="w-full h-full flex items-center justify-center text-gray-400">${createIcon('badminton', 'w-8 h-8')}</div>`}
      </div>
      <div class="flex-1 min-w-0">
        <h3 class="${CLASS_NAMES.TEXT_TITLE} mb-1 truncate">${venue.name}</h3>
        <div class="flex items-center text-sm text-gray-500 mb-2">
          ${createIcon('location', 'w-4 h-4 mr-1')}
          <span class="truncate">${venue.address}</span>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            ${createRating(venue.rating).outerHTML}
            <span class="ml-1 text-sm text-gray-600">${venue.rating}</span>
            <span class="ml-1 text-sm text-gray-400">(${venue.reviewCount})</span>
          </div>
          ${venue.distance !== undefined ? `<span class="text-xs text-gray-400">${venue.distance}km</span>` : ''}
        </div>
      </div>
    </div>
    <div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
      <div class="flex gap-2">
        ${venue.facilities.slice(0, 3).map(f => `<span class="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">${f}</span>`).join('')}
      </div>
      <div class="text-sm">
        <span class="text-gray-500">¥</span><span class="text-orange-500 font-semibold">${venue.price.weekday}</span><span class="text-gray-400">/小时</span>
      </div>
    </div>
  `;
  
  card.addEventListener('click', onClick);
  return card;
}

// 用户卡片
export function createUserCard(user: User, onClick?: () => void): HTMLElement {
  const card = document.createElement('div');
  card.className = `${CLASS_NAMES.CARD} p-4 ${onClick ? 'cursor-pointer active:bg-gray-50' : ''}`;
  
  card.innerHTML = `
    <div class="flex items-center gap-3">
      ${createAvatar(user.avatar, 'md', user.nickname?.[0] || 'U').outerHTML}
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <h3 class="${CLASS_NAMES.TEXT_TITLE} truncate">${user.nickname}</h3>
          <span class="${getLevelBadgeClass(user.level)} px-1.5 py-0.5 rounded text-xs">${user.levelName}</span>
        </div>
        ${user.bio ? `<p class="text-sm text-gray-500 truncate">${user.bio}</p>` : ''}
        <div class="flex items-center gap-2 mt-1">
          <span class="flex items-center text-xs text-gray-400">
            ${createIcon('star', 'w-3 h-3 mr-0.5')}
            信用 ${user.creditScore}
          </span>
        </div>
      </div>
    </div>
  `;
  
  if (onClick) {
    card.addEventListener('click', onClick);
  }
  
  return card;
}

function getLevelBadgeClass(level: SkillLevel): string {
  const colors: Record<SkillLevel, string> = {
    beginner: 'bg-green-100 text-green-700',
    entry: 'bg-blue-100 text-blue-700',
    intermediate: 'bg-orange-100 text-orange-700',
    advanced: 'bg-red-100 text-red-700',
    expert: 'bg-purple-100 text-purple-700',
  };
  return colors[level] || 'bg-gray-100 text-gray-700';
}

// Tab 组件
export function createTabs(tabs: { id: string; label: string; icon?: string }[], activeTab: string, onChange: (id: string) => void): HTMLElement {
  const container = document.createElement('div');
  container.className = 'flex border-b border-gray-200 bg-white sticky top-0 z-10';
  
  tabs.forEach(tab => {
    const tabEl = document.createElement('button');
    tabEl.className = `flex-1 flex items-center justify-center gap-1 py-3 text-sm font-medium transition-colors ${
      activeTab === tab.id 
        ? 'text-blue-500 border-b-2 border-blue-500' 
        : 'text-gray-500 hover:text-gray-700'
    }`;
    tabEl.innerHTML = tab.icon ? `${createIcon(tab.icon, 'w-4 h-4')}<span>${tab.label}</span>` : tab.label;
    tabEl.addEventListener('click', () => onChange(tab.id));
    container.appendChild(tabEl);
  });
  
  return container;
}

// Modal 组件
export function createModal(title: string, content: HTMLElement, actions?: HTMLElement[]): { container: HTMLElement; close: () => void } {
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in';
  
  const modal = document.createElement('div');
  modal.className = 'bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-auto animate-slide-up';
  
  modal.innerHTML = `
    <div class="flex items-center justify-between p-4 border-b border-gray-100">
      <h2 class="${CLASS_NAMES.TEXT_TITLE}">${title}</h2>
      <button class="p-1 hover:bg-gray-100 rounded-lg" id="modal-close">
        ${createIcon('x', 'w-5 h-5')}
      </button>
    </div>
    <div class="p-4"></div>
    <div class="flex gap-3 p-4 border-t border-gray-100"></div>
  `;
  
  const contentContainer = modal.querySelector('div:nth-child(2)') as HTMLElement;
  const actionsContainer = modal.querySelector('div:nth-child(3)') as HTMLElement;
  
  contentContainer.appendChild(content);
  actions?.forEach(action => actionsContainer.appendChild(action));
  
  overlay.appendChild(modal);
  
  const close = () => overlay.remove();
  
  (modal.querySelector('#modal-close') as HTMLElement).addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  
  return { container: overlay, close };
}

// 底部导航栏
export function createBottomNav(items: { id: string; label: string; icon: string; active?: boolean }[], onChange: (id: string) => void): HTMLElement {
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

// 格式化日期
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (date.toDateString() === today.toDateString()) {
    return '今天';
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return '明天';
  }
  
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

// 格式化时间
export function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':');
  return `${hours}:${minutes}`;
}

// 获取星期
export function getWeekday(dateStr: string): string {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const date = new Date(dateStr);
  return weekdays[date.getDay()];
}
