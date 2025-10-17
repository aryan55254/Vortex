import { createContext, useState, useEffect, useContext } from "react";
import type { ReactNode } from "react";
import axios from "axios";

interface User {
  _id: string;
  displayName: string;
  email: string;
  avatar?: string;
}
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  avatar?: string;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setisLoading] = useState(true);

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const response = await axios.get("/api/auth/me");
        if (response.data) {
          setUser(response.data);
        }
      } catch (error: any) {
        console.error("no active session found", error);
      } finally {
        setisLoading(false);
      }
    };
    checkUserSession();
  }, []);

  const logout = async () => {
    try {
      await axios.post("/api/auth/logout");
      setUser(null);
      window.location.href = "/";
    } catch (error: any) {
      console.error("Logout failed", error);
    }
  };

  const value = { user, isAuthenticated: !!user, isLoading, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context == undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
