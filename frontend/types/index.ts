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
  avatar_body_url?: string | null;
  role: Role;
  active_role?: 'CLIENT' | 'STYLIST';
  is_dual_role?: boolean;
  referral_code?: string | null;
  referral_count?: number;
  free_months_earned?: number;
  style_profile?: Record<string, unknown>;
  location?: string;
  created_at: string;
}

export interface ClothingItem {
  id: string;
  user_id: string;
  name?: string | null;
  photo_url: string;
  photo_hash?: string | null;
  bg_removed_url?: string;
  photo_back_url?: string | null;
  photo_back_removed?: string | null;
  has_360_view?: boolean;
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
  try_on_url?: string | null;
  archived?: boolean;
  archived_at?: string | null;
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

export type LookbookType =
  | 'BEFORE_AFTER'
  | 'COMPLETE_LOOK'
  | 'THEME'
  | 'STYLE_ADVICE';

export interface Lookbook {
  id: string;
  stylist_id: string;
  client_id?: string | null;
  stylist?: User;
  client?: User | null;
  title: string;
  description?: string;
  status: LookbookStatus;
  feedback?: string;
  created_at: string;
  outfits?: LookbookOutfit[];
  // Portfolio fields
  type?: LookbookType | string | null;
  price?: number | null;
  photos?: string[];
  before_photos?: string[];
  after_photos?: string[];
  tags?: string[];
  is_public?: boolean;
  favorite_count?: number;
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

// ─── Notifications ─────────────────────────────────────────────────────────
export type NotificationType = 'PROMO' | 'ALERT' | 'INFO' | 'LIMIT' | 'SYSTEM';
export type BroadcastTarget = 'ALL' | 'CLIENTS' | 'STYLISTS' | 'SPECIFIC';

export interface Notification {
  id: string;
  user_id: string | null;
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
  link_label?: string | null;
  read: boolean;
  sent_at: string;
  expires_at?: string | null;
  broadcast_id?: string | null;
}

export interface NotificationListResponse {
  items: Notification[];
  total: number;
  unread_count: number;
  page: number;
  limit: number;
}

export interface AdminBroadcast {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  target: BroadcastTarget;
  link?: string | null;
  link_label?: string | null;
  expires_at?: string | null;
  sent_at: string;
  sent_by: string;
  read_count: number;
  total_sent: number;
  sender?: { id: string; name: string; email: string } | null;
}

// Wallet
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'REFUNDED' | 'WITHDRAWN';

export interface Wallet {
  balance: number;
  pending_balance: number;
  total_earned: number;
  this_month: number;
  stripe_account_id?: string | null;
  platform_fee_percent: number;
}

export interface Transaction {
  id: string;
  stylist_id: string;
  client_id?: string | null;
  session_id?: string | null;
  gross_amount: number;
  platform_fee: number;
  net_amount: number;
  status: TransactionStatus;
  stripe_payment_intent_id?: string | null;
  description?: string | null;
  created_at: string;
  completed_at?: string | null;
  client?: { id: string; name: string; avatar_url?: string | null } | null;
}
