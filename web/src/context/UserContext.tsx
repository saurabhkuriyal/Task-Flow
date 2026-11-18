"use client";

import React, { createContext, useContext, useMemo, useSyncExternalStore } from "react";

// ==========================================
// 1. User State Type Definitions
// ==========================================
// Defines all properties we want to share across components without prop drilling
export interface UserState {
  userId: string | null;
  userName: string | null;
  organizationId: string | null;
  organizationName: string | null;
  departmentId: string | null;
  departmentName: string | null;
  role: string | null;
}

// Defines what the Context provides: state + functions to update/clear + helper
export interface UserContextType extends UserState {
  setUser: (data: Partial<UserState>) => void;
  clearUser: () => void;
  isAuthenticated: boolean;
}

// Initial empty state when user is not logged in
const defaultUserState: UserState = {
  userId: null,
  userName: null,
  organizationId: null,
  organizationName: null,
  departmentId: null,
  departmentName: null,
  role: null,
};

// Helpers for syncing with localStorage safely without hydration mismatch
function subscribeUserStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("user-auth-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("user-auth-change", callback);
  };
}

function getUserSnapshot(): string | null {
  try {
    return localStorage.getItem("user_data");
  } catch {
    return null;
  }
}

function getServerUserSnapshot(): string | null {
  return null;
}

// ==========================================
// 2. Create the Context
// ==========================================
const UserContext = createContext<UserContextType | undefined>(undefined);

// ==========================================
// 3. User Provider Component
// ==========================================
export function UserProvider({ children }: { children: React.ReactNode }) {
  // useSyncExternalStore guarantees server HTML matches initial client hydration snapshot
  const rawUser = useSyncExternalStore(
    subscribeUserStorage,
    getUserSnapshot,
    getServerUserSnapshot
  );

  const user = useMemo<UserState>(() => {
    if (!rawUser) return defaultUserState;
    try {
      return JSON.parse(rawUser) as UserState;
    } catch (error) {
      console.error("Could not parse saved user data:", error);
      return defaultUserState;
    }
  }, [rawUser]);

  // Updates any user fields (e.g. userId and userName on login, or organization later)
  const setUser = (data: Partial<UserState>) => {
    const updatedUser = { ...user, ...data };
    try {
      localStorage.setItem("user_data", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("user-auth-change"));
    } catch (error) {
      console.error("Failed to save user data to localStorage:", error);
    }
  };

  // Clears all user fields and removes saved data on logout
  const clearUser = () => {
    try {
      localStorage.removeItem("user_data");
      window.dispatchEvent(new Event("user-auth-change"));
    } catch (error) {
      console.error("Failed to clear user data from localStorage:", error);
    }
  };

  return (
    <UserContext.Provider
      value={{
        ...user,
        setUser,
        clearUser,
        isAuthenticated: Boolean(user.userId),
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

// ==========================================
// 4. Custom Hook for Simple Usage
// ==========================================
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used inside a <UserProvider>");
  }
  return context;
}

export default UserContext;
