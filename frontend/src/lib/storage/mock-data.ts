import { Collection, Memory, MemoryConnection, Profile, Reminder } from "@/types/database";

export const initialProfile: Profile = {
  id: "usr_00000000-0000-0000-0000-000000000001",
  email: "traveler@wayfarer.io",
  full_name: "Wayfarer Traveler",
  avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
  bio: "Exploring destinations and sharing firsthand hotel rates & travel intel.",
  theme: "dark",
  ai_auto_organize: true,
  ai_auto_link: true,
  default_privacy: "private",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const initialCollections: Collection[] = [];
export const initialMemories: Memory[] = [];
export const initialReminders: Reminder[] = [];
export const initialMemoryLinks: MemoryConnection[] = [];
