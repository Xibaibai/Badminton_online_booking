// 用户相关类型
export interface User {
  id: string;
  phone: string;
  nickname: string;
  avatar?: string;
  gender?: 'male' | 'female' | 'unknown';
  level: SkillLevel;
  levelName: string;
  bio?: string;
  location?: Location;
  creditScore: number;
  creditLevel: number;
  createdAt: string;
}

export type SkillLevel = 'beginner' | 'entry' | 'intermediate' | 'advanced' | 'expert';

export const SKILL_LEVELS: Record<SkillLevel, { name: string; description: string }> = {
  beginner: { name: '新手级', description: '刚学不久，能打几个回合' },
  entry: { name: '入门级', description: '有基础，能进行简单对抗' },
  intermediate: { name: '中级', description: '可以打比赛，有一定战术' },
  advanced: { name: '高级', description: '技术全面，经常参加比赛' },
  expert: { name: '高手级', description: '专业或半专业水平' },
};

// 位置信息
export interface Location {
  lat: number;
  lng: number;
  address?: string;
  district?: string;
}

// 活动相关类型
export interface Activity {
  id: string;
  title: string;
  description?: string;
  hostId: string;
  host?: User;
  venueId: string;
  venue?: Venue;
  date: string;
  time: string;
  duration: number; // 分钟
  maxParticipants: number;
  currentParticipants: number;
  participants: Participant[];
  level: SkillLevel;
  levelName: string;
  gender?: 'male' | 'female' | 'any';
  ageRange?: { min: number; max: number };
  fee: number; // 人均费用
  status: ActivityStatus;
  createdAt: string;
}

export type ActivityStatus = 'upcoming' | 'in_progress' | 'completed' | 'cancelled';

export interface Participant {
  userId: string;
  user?: User;
  status: 'confirmed' | 'checked_in' | 'absent';
  joinedAt: string;
  rating?: number;
}

// 场地相关类型
export interface Venue {
  id: string;
  name: string;
  address: string;
  location: Location;
  images?: string[];
  phone?: string;
  price: {
    weekday: number; // 工作日价格/小时
    weekend: number; // 周末价格/小时
    peak: number; // 黄金时段价格/小时
  };
  facilities: string[];
  courts: number;
  rating: number;
  reviewCount: number;
  openTime: string;
  closeTime: string;
  distance?: number; // km
}

export interface VenueBooking {
  id: string;
  venueId: string;
  venue?: Venue;
  userId: string;
  date: string;
  time: string;
  duration: number;
  court: number;
  totalFee: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
}

// 评价相关类型
export interface Review {
  id: string;
  activityId: string;
  reviewerId: string;
  reviewer?: User;
  targetId: string;
  target?: User;
  rating: number;
  comment?: string;
  tags: string[];
  createdAt: string;
}

export const REVIEW_TAGS = [
  '守时守信', '水平相当', '配合默契', '球技高超', '态度友好',
  '组织有序', '场地不错', '氛围融洽', '值得推荐', '还会再来'
];

// API 响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 分页类型
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// 筛选条件类型
export interface ActivityFilters {
  level?: SkillLevel;
  gender?: 'male' | 'female' | 'any';
  date?: string;
  timeRange?: { start: string; end: string };
  district?: string;
  maxFee?: number;
  hasFee?: boolean;
}

export interface VenueFilters {
  district?: string;
  minPrice?: number;
  maxPrice?: number;
  facilities?: string[];
  minRating?: number;
}
