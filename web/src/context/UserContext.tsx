"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

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

// ==========================================
// 2. Create the Context
// ==========================================
const UserContext = createContext<UserContextType | undefined>(undefined);

// ==========================================
// 3. User Provider Component
// ==========================================
// Wraps your app (in layout.tsx) so all child components can access this state
export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<UserState>(defaultUserState);

  // When app loads in the browser, check if we previously saved user details
  useEffect(() => {
    const savedUser = localStorage.getItem("user_data");
    if (savedUser) {
      try {
        setUserState(JSON.parse(savedUser));
      } catch (error) {
        console.error("Could not parse saved user data:", error);
      }
    }
  }, []);

  // Updates any user fields (e.g. userId and userName on login, or organization later)
  const setUser = (data: Partial<UserState>) => {
    setUserState((prev) => {
      const updatedUser = { ...prev, ...data };
      // Save to localStorage so state stays after page refresh
      localStorage.setItem("user_data", JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  // Clears all user fields and removes saved data on logout
  const clearUser = () => {
    localStorage.removeItem("user_data");
    setUserState(defaultUserState);
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
// In any component: const { userId, userName, setUser, clearUser } = useUser();
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used inside a <UserProvider>");
  }
  return context;
}

export default UserContext;
