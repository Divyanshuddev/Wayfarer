"use client";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
}

interface RegisteredAccount extends UserProfile {
  password_hash: string;
}

const STORAGE_KEYS = {
  USERS: "wayfarer_registered_users_v2",
  SESSION: "wayfarer_active_session_v2",
};

class AuthStore {
  private users: RegisteredAccount[] = [];
  private currentUser: UserProfile | null = null;
  private listeners: Set<() => void> = new Set();
  private initialized = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.init();
    }
  }

  private init() {
    if (this.initialized) return;
    try {
      const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      const storedSession = localStorage.getItem(STORAGE_KEYS.SESSION);

      this.users = storedUsers ? JSON.parse(storedUsers) : [];
      this.currentUser = storedSession ? JSON.parse(storedSession) : null;
    } catch {
      this.users = [];
      this.currentUser = null;
    }
    this.initialized = true;
  }

  private save() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
      if (this.currentUser) {
        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(this.currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.SESSION);
      }
    } catch (e) {
      console.warn("Auth store save error:", e);
    }
    this.notify();
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getCurrentUser(): UserProfile | null {
    if (!this.initialized && typeof window !== "undefined") {
      this.init();
    }
    return this.currentUser;
  }

  public isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  public signUp(data: {
    email: string;
    password: string;
    full_name: string;
  }): { success: boolean; error?: string; user?: UserProfile } {
    if (!this.initialized && typeof window !== "undefined") this.init();

    const email = data.email.trim().toLowerCase();
    const fullName = data.full_name.trim();
    const password = data.password.trim();

    if (!email || !email.includes("@")) {
      return { success: false, error: "Please enter a valid email address." };
    }
    if (!fullName) {
      return { success: false, error: "Please enter your name or traveler handle." };
    }
    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters long." };
    }

    const existing = this.users.find((u) => u.email === email);
    if (existing) {
      return {
        success: false,
        error: "An account with this email already exists. Please sign in instead.",
      };
    }

    const newUser: RegisteredAccount = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      email,
      full_name: fullName,
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
      created_at: new Date().toISOString(),
      password_hash: btoa(password), // simple client encoding
    };

    this.users.push(newUser);
    const { password_hash, ...profile } = newUser;
    this.currentUser = profile;
    this.save();

    return { success: true, user: profile };
  }

  public signIn(data: {
    email: string;
    password: string;
  }): { success: boolean; error?: string; user?: UserProfile } {
    if (!this.initialized && typeof window !== "undefined") this.init();

    const email = data.email.trim().toLowerCase();
    const password = data.password.trim();

    if (!email) {
      return { success: false, error: "Please enter your email address." };
    }
    if (!password) {
      return { success: false, error: "Please enter your password." };
    }

    const user = this.users.find((u) => u.email === email);
    if (!user) {
      return {
        success: false,
        error: "No account found with this email. Please create an account first.",
      };
    }

    if (user.password_hash !== btoa(password)) {
      return { success: false, error: "Incorrect password. Please verify your credentials." };
    }

    const { password_hash, ...profile } = user;
    this.currentUser = profile;
    this.save();

    return { success: true, user: profile };
  }

  public signInDemo(): UserProfile {
    if (!this.initialized && typeof window !== "undefined") this.init();
    const demoUser: UserProfile = {
      id: "usr-traveler-1",
      email: "aria@wayfarer.io",
      full_name: "Aria Montgomery",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      created_at: new Date().toISOString(),
    };
    this.currentUser = demoUser;
    this.save();
    return demoUser;
  }

  public signOut(): void {
    this.currentUser = null;
    this.save();
  }
}

export const authStore = new AuthStore();
