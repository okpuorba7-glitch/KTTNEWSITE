export interface Media {
  url: string;
  type: 'image' | 'video';
  name: string;
}

export interface Service {
  id: string;
  cardClass: string;
  label: string;
  emoji: string;
  number: string;
  numColor: string;
  stripe: string;
  iconBg: string;
  title: string;
  sub: string;
  tap: string;
  btnLabel: string;
  btnBg: string;
  btnColor: string;
  featColor: string;
  barColor: string;
  basePrice: string;
  deliveryFee: string;
  minOrder: string;
  features: string[];
  media: Media[];
}

export interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  cta: string;
  ctaClass: string;
  featured: boolean;
  badge?: string;
  features: string[];
}

export interface Settings {
  phone: string;
  email: string;
  whatsapp: string;
  address: string;
  monSat: string;
  sunday: string;
  holidays: string;
  instagram: string;
  facebook: string;
  twitter: string;
  tiktok: string;
  banner: string;
  bannerLink: string;
}

export interface Booking {
  id?: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  address: string;
  notes: string;
  status: 'new' | 'confirmed' | 'done' | 'cancelled';
  createdAt?: any; // Firestore Timestamp
}
