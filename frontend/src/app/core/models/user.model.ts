export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  timezone: string;
  locale: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  preferences?: UserPreferences;
}
