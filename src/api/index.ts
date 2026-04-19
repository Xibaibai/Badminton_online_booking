import type { 
  User, 
  Activity, 
  Venue, 
  ActivityFilters,
  VenueFilters,
  ApiResponse,
  Review
} from '../types';
import { generateId, getMockLocation, saveUserToStorage } from '../store';

// 模拟延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 模拟数据存储
const mockUsers: Map<string, User> = new Map();
const mockActivities: Map<string, Activity> = new Map();
const mockVenues: Map<string, Venue> = new Map();
const mockReviews: Map<string, Review> = new Map();

// 当前模拟登录用户
let currentUserId: string | null = null;

// 初始化模拟数据
function initMockData(): void {
  if (mockVenues.size > 0) return;

  const location = getMockLocation();
  
  // 初始化场地
  const venues: Venue[] = [
    {
      id: 'v1',
      name: '静安体育馆羽毛球馆',
      address: '上海市静安区武定路358号',
      location: { ...location, lat: 31.2324, lng: 121.4557, district: '静安区' },
      price: { weekday: 45, weekend: 60, peak: 80 },
      facilities: ['淋浴', '更衣室', '停车场', '休息区', '自动售货机'],
      courts: 8,
      rating: 4.8,
      reviewCount: 328,
      openTime: '08:00',
      closeTime: '22:00',
      distance: 1.2,
    },
    {
      id: 'v2',
      name: '黄浦区体育中心',
      address: '上海市黄浦区南京东路666号',
      location: { ...location, lat: 31.2350, lng: 121.4800, district: '黄浦区' },
      price: { weekday: 50, weekend: 70, peak: 90 },
      facilities: ['淋浴', '更衣室', '健身房', '咖啡厅'],
      courts: 12,
      rating: 4.6,
      reviewCount: 512,
      openTime: '07:00',
      closeTime: '23:00',
      distance: 2.1,
    },
    {
      id: 'v3',
      name: '徐汇羽毛球俱乐部',
      address: '上海市徐汇区漕溪北路18号',
      location: { ...location, lat: 31.2200, lng: 121.4400, district: '徐汇区' },
      price: { weekday: 40, weekend: 55, peak: 70 },
      facilities: ['更衣室', '休息区'],
      courts: 6,
      rating: 4.4,
      reviewCount: 189,
      openTime: '09:00',
      closeTime: '21:00',
      distance: 3.5,
    },
    {
      id: 'v4',
      name: '浦东体育公园羽毛球馆',
      address: '上海市浦东新区世纪大道2000号',
      location: { ...location, lat: 31.2400, lng: 121.5500, district: '浦东新区' },
      price: { weekday: 55, weekend: 75, peak: 95 },
      facilities: ['淋浴', '更衣室', '停车场', '餐厅', '儿童游乐区'],
      courts: 16,
      rating: 4.9,
      reviewCount: 876,
      openTime: '06:00',
      closeTime: '22:00',
      distance: 8.2,
    },
  ];
  
  venues.forEach(v => mockVenues.set(v.id, v));

  // 初始化用户
  const users: User[] = [
    {
      id: 'u1',
      phone: '138****1234',
      nickname: '羽毛球达人',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u1',
      level: 'intermediate',
      levelName: '中级',
      bio: '每周打3次球，喜欢双打',
      location: { ...location, district: '静安区' },
      creditScore: 98,
      creditLevel: 4,
      createdAt: '2024-01-15',
    },
    {
      id: 'u2',
      phone: '139****5678',
      nickname: '运动小白',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u2',
      level: 'beginner',
      levelName: '新手级',
      bio: '刚开始学打球，欢迎约我',
      location: { ...location, district: '黄浦区' },
      creditScore: 95,
      creditLevel: 3,
      createdAt: '2024-02-20',
    },
    {
      id: 'u3',
      phone: '136****9012',
      nickname: '周末球友',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u3',
      level: 'advanced',
      levelName: '高级',
      bio: '喜欢竞技，周末约球',
      location: { ...location, district: '徐汇区' },
      creditScore: 100,
      creditLevel: 5,
      createdAt: '2024-01-05',
    },
  ];

  users.forEach(u => mockUsers.set(u.id, u));

  // 初始化活动
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);

  const activities: Activity[] = [
    {
      id: 'a1',
      title: '周六下午双打局',
      description: '新手友好局，欢迎新手加入！',
      hostId: 'u1',
      host: mockUsers.get('u1'),
      venueId: 'v1',
      venue: mockVenues.get('v1'),
      date: tomorrow.toISOString().split('T')[0],
      time: '14:00',
      duration: 120,
      maxParticipants: 8,
      currentParticipants: 4,
      participants: [
        { userId: 'u1', status: 'confirmed', joinedAt: '2024-03-15' },
        { userId: 'u2', status: 'confirmed', joinedAt: '2024-03-15' },
      ],
      level: 'beginner',
      levelName: '新手级',
      fee: 30,
      status: 'upcoming',
      createdAt: '2024-03-15',
    },
    {
      id: 'a2',
      title: '周日友谊赛',
      description: '中级水平对抗赛，锻炼战术配合',
      hostId: 'u3',
      host: mockUsers.get('u3'),
      venueId: 'v2',
      venue: mockVenues.get('v2'),
      date: dayAfter.toISOString().split('T')[0],
      time: '10:00',
      duration: 180,
      maxParticipants: 12,
      currentParticipants: 6,
      participants: [
        { userId: 'u3', status: 'confirmed', joinedAt: '2024-03-14' },
      ],
      level: 'intermediate',
      levelName: '中级',
      fee: 45,
      status: 'upcoming',
      createdAt: '2024-03-14',
    },
    {
      id: 'a3',
      title: '晚间休闲局',
      description: '下班后来放松一下',
      hostId: 'u1',
      host: mockUsers.get('u1'),
      venueId: 'v3',
      venue: mockVenues.get('v3'),
      date: today.toISOString().split('T')[0],
      time: '19:00',
      duration: 90,
      maxParticipants: 6,
      currentParticipants: 3,
      participants: [
        { userId: 'u1', status: 'confirmed', joinedAt: '2024-03-16' },
      ],
      level: 'entry',
      levelName: '入门级',
      fee: 25,
      status: 'upcoming',
      createdAt: '2024-03-16',
    },
  ];

  activities.forEach(a => mockActivities.set(a.id, a));

  // 默认登录用户
  currentUserId = 'u1';
}

// API 响应包装
function successResponse<T>(data: T): ApiResponse<T> {
  return { success: true, data };
}

function errorResponse(error: string): ApiResponse<never> {
  return { success: false, error };
}

// ========== 用户相关 API ==========

export async function login(phone: string, code: string): Promise<ApiResponse<User>> {
  await delay(500);
  initMockData();

  // 模拟验证码验证
  if (code !== '123456' && code !== '000000') {
    return errorResponse('验证码错误');
  }

  // 查找或创建用户
  let user = Array.from(mockUsers.values()).find(u => u.phone === phone);
  
  if (!user) {
    user = {
      id: generateId(),
      phone,
      nickname: `用户${phone.slice(-4)}`,
      level: 'beginner',
      levelName: '新手级',
      creditScore: 100,
      creditLevel: 1,
      createdAt: new Date().toISOString().split('T')[0],
    };
    mockUsers.set(user.id, user);
  }

  currentUserId = user.id;
  saveUserToStorage(user, 'mock-token');
  
  return successResponse(user);
}

export async function getUserInfo(): Promise<ApiResponse<User>> {
  await delay(200);
  initMockData();

  if (!currentUserId) {
    return errorResponse('未登录');
  }

  const user = mockUsers.get(currentUserId);
  if (!user) {
    return errorResponse('用户不存在');
  }

  return successResponse(user);
}

export async function updateUserProfile(updates: Partial<User>): Promise<ApiResponse<User>> {
  await delay(300);
  initMockData();

  if (!currentUserId) {
    return errorResponse('未登录');
  }

  const user = mockUsers.get(currentUserId);
  if (!user) {
    return errorResponse('用户不存在');
  }

  Object.assign(user, updates);
  saveUserToStorage(user, 'mock-token');

  return successResponse(user);
}

export function logout(): void {
  currentUserId = null;
  saveUserToStorage(null);
}

// ========== 活动相关 API ==========

export async function getActivities(filters?: ActivityFilters): Promise<ApiResponse<Activity[]>> {
  await delay(400);
  initMockData();

  let activities = Array.from(mockActivities.values());

  if (filters) {
    if (filters.level) {
      activities = activities.filter(a => a.level === filters.level);
    }
    if (filters.date) {
      activities = activities.filter(a => a.date === filters.date);
    }
    if (filters.gender && filters.gender !== 'any') {
      activities = activities.filter(a => a.gender === 'any' || a.gender === filters.gender);
    }
    if (filters.maxFee !== undefined) {
      activities = activities.filter(a => a.fee <= filters.maxFee!);
    }
  }

  // 按日期排序
  activities.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.time.localeCompare(b.time);
  });

  return successResponse(activities);
}

export async function getActivityDetail(id: string): Promise<ApiResponse<Activity>> {
  await delay(300);
  initMockData();

  const activity = mockActivities.get(id);
  if (!activity) {
    return errorResponse('活动不存在');
  }

  return successResponse(activity);
}

export async function createActivity(data: Partial<Activity>): Promise<ApiResponse<Activity>> {
  await delay(500);
  initMockData();

  if (!currentUserId) {
    return errorResponse('请先登录');
  }

  const host = mockUsers.get(currentUserId);
  if (!host) {
    return errorResponse('用户不存在');
  }

  const venue = data.venueId ? mockVenues.get(data.venueId) : undefined;

  const activity: Activity = {
    id: generateId(),
    title: data.title || '羽毛球活动',
    description: data.description,
    hostId: currentUserId,
    host,
    venueId: data.venueId || '',
    venue,
    date: data.date || new Date().toISOString().split('T')[0],
    time: data.time || '10:00',
    duration: data.duration || 120,
    maxParticipants: data.maxParticipants || 8,
    currentParticipants: 1,
    participants: [{ userId: currentUserId, status: 'confirmed', joinedAt: new Date().toISOString() }],
    level: data.level || 'intermediate',
    levelName: data.level ? { beginner: '新手级', entry: '入门级', intermediate: '中级', advanced: '高级', expert: '高手级' }[data.level] : '中级',
    fee: data.fee || 0,
    status: 'upcoming',
    createdAt: new Date().toISOString(),
  };

  mockActivities.set(activity.id, activity);

  return successResponse(activity);
}

export async function joinActivity(activityId: string): Promise<ApiResponse<Activity>> {
  await delay(400);
  initMockData();

  if (!currentUserId) {
    return errorResponse('请先登录');
  }

  const activity = mockActivities.get(activityId);
  if (!activity) {
    return errorResponse('活动不存在');
  }

  if (activity.currentParticipants >= activity.maxParticipants) {
    return errorResponse('活动已满员');
  }

  const isJoined = activity.participants.some(p => p.userId === currentUserId);
  if (isJoined) {
    return errorResponse('您已加入此活动');
  }

  const user = mockUsers.get(currentUserId);
  activity.participants.push({
    userId: currentUserId,
    user,
    status: 'confirmed',
    joinedAt: new Date().toISOString(),
  });
  activity.currentParticipants++;

  return successResponse(activity);
}

export async function leaveActivity(activityId: string): Promise<ApiResponse<Activity>> {
  await delay(300);
  initMockData();

  if (!currentUserId) {
    return errorResponse('请先登录');
  }

  const activity = mockActivities.get(activityId);
  if (!activity) {
    return errorResponse('活动不存在');
  }

  if (activity.hostId === currentUserId) {
    return errorResponse('发起人不能退出活动');
  }

  const participantIndex = activity.participants.findIndex(p => p.userId === currentUserId);
  if (participantIndex === -1) {
    return errorResponse('您未加入此活动');
  }

  activity.participants.splice(participantIndex, 1);
  activity.currentParticipants--;

  return successResponse(activity);
}

export async function checkInActivity(activityId: string): Promise<ApiResponse<Activity>> {
  await delay(300);
  initMockData();

  if (!currentUserId) {
    return errorResponse('请先登录');
  }

  const activity = mockActivities.get(activityId);
  if (!activity) {
    return errorResponse('活动不存在');
  }

  const participant = activity.participants.find(p => p.userId === currentUserId);
  if (!participant) {
    return errorResponse('您未加入此活动');
  }

  participant.status = 'checked_in';
  return successResponse(activity);
}

// ========== 场地相关 API ==========

export async function getVenues(filters?: VenueFilters): Promise<ApiResponse<Venue[]>> {
  await delay(400);
  initMockData();

  let venues = Array.from(mockVenues.values());

  if (filters) {
    if (filters.district) {
      venues = venues.filter(v => v.location.district?.includes(filters.district!));
    }
    if (filters.minPrice !== undefined) {
      venues = venues.filter(v => v.price.weekday >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      venues = venues.filter(v => v.price.weekday <= filters.maxPrice!);
    }
    if (filters.minRating !== undefined) {
      venues = venues.filter(v => v.rating >= filters.minRating!);
    }
  }

  // 按距离排序
  venues.sort((a, b) => (a.distance || 0) - (b.distance || 0));

  return successResponse(venues);
}

export async function getVenueDetail(id: string): Promise<ApiResponse<Venue>> {
  await delay(300);
  initMockData();

  const venue = mockVenues.get(id);
  if (!venue) {
    return errorResponse('场地不存在');
  }

  return successResponse(venue);
}

// ========== 评价相关 API ==========

export async function submitReview(
  activityId: string,
  targetId: string,
  rating: number,
  comment?: string,
  tags: string[] = []
): Promise<ApiResponse<Review>> {
  await delay(400);
  initMockData();

  if (!currentUserId) {
    return errorResponse('请先登录');
  }

  const reviewer = mockUsers.get(currentUserId);
  const target = mockUsers.get(targetId);

  const review: Review = {
    id: generateId(),
    activityId,
    reviewerId: currentUserId,
    reviewer,
    targetId,
    target,
    rating,
    comment,
    tags,
    createdAt: new Date().toISOString(),
  };

  mockReviews.set(review.id, review);

  return successResponse(review);
}

export async function getActivityReviews(activityId: string): Promise<ApiResponse<Review[]>> {
  await delay(300);
  initMockData();

  const reviews = Array.from(mockReviews.values()).filter(r => r.activityId === activityId);
  return successResponse(reviews);
}

// ========== 初始化 ==========

// 页面加载时初始化数据
initMockData();
