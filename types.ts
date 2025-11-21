

export enum View {
  DASHBOARD = 'DASHBOARD',
  NOTES = 'NOTES',
  CALENDAR = 'CALENDAR',
  WALLET = 'WALLET',
  CRM = 'CRM',
  GOALS = 'GOALS',
  FILES = 'FILES',
  SETTINGS = 'SETTINGS',
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  tags: string[];
  isBookmarked?: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO String
  startTime: string;
  durationMinutes: number;
  description?: string;
}

export interface Habit {
  id: string;
  title: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  description: string;
  date: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  company?: string;
  role?: string;
  status: 'LEAD' | 'CLIENT' | 'PARTNER' | 'INACTIVE';
  lastContacted?: string;
}

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  isCompleted: boolean; // kept for backward compatibility
  status: TaskStatus;
  subtasks?: Subtask[];
  amount?: number;
  completedAt?: string;
}

export type ProjectStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED';

export interface Project {
  id: string;
  title: string;
  clientName: string;
  budget: number;
  deadline: string;
  description: string;
  status: ProjectStatus;
  createdAt: string;
}

export interface GoalEntry {
    id: string;
    amount: number;
    date: string;
    note?: string;
}

export interface Goal {
    id: string;
    title: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string;
    imageUrl: string;
    entries: GoalEntry[];
    createdAt: string;
}

export type FileType = 'FILE' | 'FOLDER';

export interface FileItem {
    id: string;
    parentId: string | null; // null for root
    name: string;
    type: FileType;
    content?: string; // Only for files
    createdAt: string;
    updatedAt: string;
}

export type BankAccountType = 'CHECKING' | 'SAVINGS' | 'CREDIT' | 'INVESTMENT' | 'CASH';

export interface BankAccount {
    id: string;
    bankName: string; // e.g., "Chase", "Amex"
    accountName: string; // e.g., "Sapphire Reserve", "Emergency Fund"
    type: BankAccountType;
    balance: number;
    accountNumberLast4?: string;
    colorTheme: string; // hex code or gradient name
    currency: string;
    isExcluded?: boolean;
}

export type AIProvider = 'GEMINI' | 'OPENAI' | 'CLAUDE';

export interface UserProfile {
    name: string;
    email?: string;
    isLoggedIn: boolean;
}

export interface AISettings {
  provider: AIProvider;
  currency: string; // '$', '€', '£', etc.
  apiKeys: {
    GEMINI: string;
    OPENAI: string;
    CLAUDE: string;
  };
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isError?: boolean;
}