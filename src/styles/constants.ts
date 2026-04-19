// 通用样式类名常量
export const CLASS_NAMES = {
  // 按钮
  BUTTON_BASE: 'inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
  BUTTON_PRIMARY: 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm',
  BUTTON_SECONDARY: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  BUTTON_OUTLINE: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
  BUTTON_DANGER: 'bg-red-500 text-white hover:bg-red-600',
  BUTTON_SM: 'px-3 py-1.5 text-sm',
  BUTTON_LG: 'px-6 py-3 text-lg',
  
  // 卡片
  CARD: 'bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden',
  CARD_HOVER: 'hover:shadow-md transition-shadow',
  
  // 输入框
  INPUT_BASE: 'w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all',
  INPUT_ERROR: 'border-red-500 focus:border-red-500 focus:ring-red-200',
  
  // 标签
  TAG: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
  TAG_BLUE: 'bg-blue-100 text-blue-700',
  TAG_GREEN: 'bg-green-100 text-green-700',
  TAG_ORANGE: 'bg-orange-100 text-orange-700',
  TAG_GRAY: 'bg-gray-100 text-gray-700',
  TAG_RED: 'bg-red-100 text-red-700',
  
  // 头像
  AVATAR: 'w-10 h-10 rounded-full bg-gray-200 object-cover',
  AVATAR_SM: 'w-8 h-8',
  AVATAR_LG: 'w-16 h-16',
  AVATAR_XL: 'w-24 h-24',
  
  // 间距
  PAGE_PADDING: 'px-4 py-4',
  SECTION_GAP: 'space-y-4',
  
  // 布局
  FLEX_CENTER: 'flex items-center justify-center',
  FLEX_BETWEEN: 'flex items-center justify-between',
  FLEX_COL: 'flex flex-col',
  
  // 文字
  TEXT_TITLE: 'text-lg font-semibold text-gray-900',
  TEXT_SUBTITLE: 'text-sm text-gray-500',
  TEXT_PRIMARY: 'text-blue-500',
  TEXT_SUCCESS: 'text-green-500',
  TEXT_DANGER: 'text-red-500',
} as const;

// 水平等级颜色
export const LEVEL_COLORS: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700',
  entry: 'bg-blue-100 text-blue-700',
  intermediate: 'bg-orange-100 text-orange-700',
  advanced: 'bg-red-100 text-red-700',
  expert: 'bg-purple-100 text-purple-700',
};

// 状态颜色
export const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  upcoming: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  in_progress: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  completed: { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
};

// 星级评分颜色
export const RATING_COLOR = 'text-yellow-400';
