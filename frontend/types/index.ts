// Enums
export type Role = 'CLIENT' | 'STYLIST' | 'ADMIN';
export type Category = 'TOP' | 'BOTTOM' | 'DRESS' | 'JACKET' | 'SHOES' | 'ACCESSORY';
export type Season = 'SUMMER' | 'WINTER' | 'ALL';
export type Occasion = 'CASUAL' | 'WORK' | 'EVENING' | 'SPORT';
export type ConnectionStatus = 'PENDING' | 'ACTIVE' | 'ENDED';
export type LookbookStatus = 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED';
export type MessageType = 'TEXT' | 'IMAGE' | 'LOOKBOOK' | 'OUTFIT' | 'ZOOM_LINK';
export type Plan = 'FREE' | 'CLIENT_PRO' | 'STYLIST_PRO';

// Models
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: Role;
  style_profile?: Record<string, unknown>;
  location?: string;
  created_at: string;
}

export interface ClothingItem {
  id: string;
  user_id: string;
  photo_url: string;
  bg_removed_url?: string;
  category: Category;
  colors: string[];
  material?: string;
  season: Season;
  occasion: Occasion;
  brand?: string;
  purchase_price?: number;
  purchase_date?: string;
  wear_count: number;
  last_worn_at?: string;
  ai_tags?: Record<string, unknown>;
  created_at: string;
}

export interface Outfit {
  id: string;
  user_id: string;
  name: string;
  occasion?: Occasion;
  season?: Season;
  ai_generated: boolean;
  worn_count: number;
  last_worn_at?: string;
  try_on_url?: string;
  created_at: string;
  items?: OutfitItem[];
}

export interface OutfitItem {
  outfit_id: string;
  item_id: string;
  item?: ClothingItem;
}

export interface CalendarEntry {
  id: string;
  user_id: string;
  outfit_id?: string | null;
  outfit?: Outfit | null;
  date: string;
  weather_data?: Record<string, unknown>;
  notes?: string;
  // Stylist appointment fields
  client_id?: string | null;
  event_type?: string | null;
  duration_min?: number | null;
  zoom_link?: string | null;
  title?: string | null;
  client?: { id: string; name: string; avatar_url?: string | null } | null;
}

export interface StylistClient {
  id: string;
  stylist_id: string;
  client_id: string;
  stylist?: User;
  client?: User;
  status: ConnectionStatus;
  permissions?: Record<string, unknown>;
  started_at?: string;
  created_at: string;
}

export interface Lookbook {
  id: string;
  stylist_id: string;
  client_id: string;
  stylist?: User;
  client?: User;
  title: string;
  description?: string;
  status: LookbookStatus;
  feedback?: string;
  created_at: string;
  outfits?: LookbookOutfit[];
}

export interface LookbookOutfit {
  lookbook_id: string;
  outfit_id: string;
  outfit?: Outfit;
}

export interface Message {
  id: string;
  from_id: string;
  to_id: string;
  from?: User;
  to?: User;
  content: string;
  type: MessageType;
  metadata?: Record<string, unknown>;
  read_at?: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: Plan;
  stripe_subscription_id?: string;
  status: string;
  current_period_end?: string;
}

export interface WeatherData {
  temp: number;
  feels_like: number;
  description: string;
  icon: string;
  city: string;
  humidity: number;
  wind_speed: number;
}

export interface ForecastDay {
  date: string;
  temp_min: number;
  temp_max: number;
  description: string;
  icon: string;
}

export interface AIOutfitSuggestion {
  name: string;
  items: string[];
  reasoning: string;
  score: number;
}

export interface StyleDNA {
  style_archetype: string;
  dominant_colors: string[];
  style_score: {
    classic: number;
    trendy: number;
    casual: number;
    formal: number;
    sporty: number;
  };
  wardrobe_gaps: string[];
  personality_traits: string[];
  recommendations: string[];
}

export interface Conversation {
  contact: User;
  lastMessage: Message;
  unreadCount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
