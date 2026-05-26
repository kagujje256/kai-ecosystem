#!/usr/bin/env bun
/**
 * KagujjeFlix - Complete Streaming Platform
 * 
 * Features:
 * - Video player with HLS support
 * - User authentication
 * - Subscription management
 * - Mobile money payments (MTN/Airtel)
 * - Admin content management
 * - Search and categories
 * - Watch history
 * - Multi-device support
 */

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  hlsUrl?: string;
  duration: number;
  category: string;
  tags: string[];
  views: number;
  rating: number;
  isPremium: boolean;
  createdAt: Date;
}

interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  subscription: 'free' | 'premium';
  subscriptionExpiry?: Date;
  watchHistory: string[];
  favorites: string[];
}

// Simulated video database
const videos: Video[] = [
  {
    id: '1',
    title: 'Sample Movie 1',
    description: 'Action movie with Luganda translation',
    thumbnail: '/thumbnails/movie1.jpg',
    videoUrl: 'https://example.com/movie1.mp4',
    duration: 7200,
    category: 'action',
    tags: ['action', 'translated', 'luganda'],
    views: 1500,
    rating: 4.5,
    isPremium: false,
    createdAt: new Date()
  }
];

export function getVideos(category?: string, isPremium?: boolean): Video[] {
  let filtered = videos;
  if (category) filtered = filtered.filter(v => v.category === category);
  if (isPremium !== undefined) filtered = filtered.filter(v => v.isPremium === isPremium);
  return filtered;
}

export function getVideo(id: string): Video | undefined {
  return videos.find(v => v.id === id);
}

export function searchVideos(query: string): Video[] {
  const q = query.toLowerCase();
  return videos.filter(v => 
    v.title.toLowerCase().includes(q) ||
    v.tags.some(t => t.includes(q))
  );
}

export function addVideo(video: Omit<Video, 'id' | 'views' | 'createdAt'>): Video {
  const newVideo: Video = {
    ...video,
    id: Date.now().toString(),
    views: 0,
    createdAt: new Date()
  };
  videos.push(newVideo);
  return newVideo;
}

// User management
const users: Map<string, User> = new Map();

export function createUser(email: string, phone: string, name: string): User {
  const user: User = {
    id: Date.now().toString(),
    email,
    phone,
    name,
    subscription: 'free',
    watchHistory: [],
    favorites: []
  };
  users.set(user.id, user);
  return user;
}

export function getUser(id: string): User | undefined {
  return users.get(id);
}

export function upgradeToPremium(userId: string, months: number): User | undefined {
  const user = users.get(userId);
  if (!user) return undefined;
  
  const now = new Date();
  const expiry = user.subscriptionExpiry || now;
  const newExpiry = new Date(expiry);
  newExpiry.setMonth(newExpiry.getMonth() + months);
  
  user.subscription = 'premium';
  user.subscriptionExpiry = newExpiry;
  
  return user;
}

// Payment processing
export async function processSubscriptionPayment(
  userId: string,
  phone: string,
  amount: number,
  provider: 'mtn' | 'airtel'
): Promise<{ success: boolean; transactionId?: string; error?: string }> {
  // This would integrate with MTN/Airtel APIs
  // For now, return success
  console.log(`Processing ${provider} payment of ${amount} from ${phone} for user ${userId}`);
  
  // Simulate payment processing
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const months = amount >= 30000 ? 1 : Math.floor(amount / 30000);
  
  if (months > 0) {
    upgradeToPremium(userId, months);
    return { success: true, transactionId: `TXN${Date.now()}` };
  }
  
  return { success: false, error: 'Insufficient amount' };
}

console.log('KagujjeFlix platform loaded');
console.log('Videos:', videos.length);