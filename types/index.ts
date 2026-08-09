export interface NavLink {
  label: string;
  href: string;
  children?: NavLink[];
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  description: string;
  longDesc: string;
  icon: string;
  image?: string | null;
  features: string[];
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PortfolioResult {
  metric: string;
  value: string;
}

export interface Portfolio {
  id: string;
  title: string;
  slug: string;
  client: string;
  description: string;
  longDesc: string;
  coverImage: string | null;
  images: string[];
  tags: string[];
  results: PortfolioResult[];
  serviceId?: string | null;
  service?: Service | null;
  isFeatured: boolean;
  isPublished: boolean;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string | null;
  tags: string[];
  author: string;
  authorImage?: string | null;
  isFeatured: boolean;
  isPublished: boolean;
  publishedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  name: string;
  company: string;
  role: string;
  content: string;
  rating: number;
  avatar?: string | null;
  isFeatured: boolean;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio?: string | null;
  image?: string | null;
  linkedin?: string | null;
  twitter?: string | null;
  order: number;
  isActive: boolean;
}

export type ContactStatus = "NEW" | "IN_PROGRESS" | "REPLIED" | "CLOSED";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  service?: string | null;
  budget?: string | null;
  message: string;
  status: ContactStatus;
  notes?: string | null;
  createdAt: Date;
}

export interface Stat {
  value: string;
  label: string;
  suffix?: string;
}
