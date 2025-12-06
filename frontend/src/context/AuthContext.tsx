import { createContext, useState, useEffect, useContext } from "react";
import type { ReactNode } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_BaseAPI;

interface User {
  _id: string;
  displayName: string;
  email: string;
  avatar?: string;
}
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  avatar?: string;
  logout: () => Promise<void>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setisLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const response = await axios.get(`${API}/api/auth/me`, {
          withCredentials: true,
        });
        if (response.data) {
          setUser(response.data);
          if (
            response.data &&
            (window.location.pathname === "/" ||
              window.location.pathname === "/auth")
          ) {
            navigate("/video");
          }
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
      await axios.post(`${API}/api/auth/logout`, {
        withCredentials: true,
      });
      setUser(null);
      navigate("/");
    } catch (error: any) {
      console.error("Logout failed", error);
    }
  };

  const value = { user, isLoading, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context == undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
