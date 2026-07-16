"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { IUser } from "@/lib/types/schemas/user";
import { supabaseClient } from "@/lib/supabase/client";

type UserProfileContextType = {
  userProfile: IUser | null;
  loading: boolean;
  refetch: () => Promise<void>;
};

const UserProfileContext = createContext<UserProfileContextType>({
  userProfile: null,
  loading: true,
  refetch: async () => {},
});

export const useUserProfile = () => {
  return useContext(UserProfileContext);
};

// Session storage key
const SESSION_STORAGE_KEY = "user_profile_data";

const getStoredUserProfile = (): IUser | null => {
  if (typeof window === "undefined") return null;
  try {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (error) {
    console.error("Error reading from session storage:", error);
  }
  return null;
};

const setStoredUserProfile = (userProfile: IUser | null) => {
  if (typeof window === "undefined") return;
  try {
    if (userProfile) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(userProfile));
    } else {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch (error) {
    console.error("Error writing to session storage:", error);
  }
};

const UserProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [userProfile, setUserProfile] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string, useCache: boolean = true) => {
    try {
      setLoading(true);

      let cachedProfile: IUser | null = null;
      if (useCache) {
        cachedProfile = getStoredUserProfile();
        if (cachedProfile && cachedProfile.id === userId) {
          setUserProfile(cachedProfile);
          setLoading(false);
        }
      }

      const supabase = supabaseClient();
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        setUserProfile(null);
        setStoredUserProfile(null);
      } else {
        const currentProfile = cachedProfile || userProfile;
        const isDifferent =
          !currentProfile ||
          JSON.stringify(currentProfile) !== JSON.stringify(data);

        if (isDifferent) {
          setUserProfile(data);
          setStoredUserProfile(data);
        }
      }
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
      setUserProfile(null);
      setStoredUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    if (userProfile?.id) {
      await fetchUserProfile(userProfile.id);
    }
  };

  useEffect(() => {
    const supabase = supabaseClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.id) {
        fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user?.id) {
        fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <UserProfileContext.Provider value={{ userProfile, loading, refetch }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export default UserProfileProvider;
