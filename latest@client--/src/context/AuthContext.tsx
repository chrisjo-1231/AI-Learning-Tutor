import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import api from "../services/api";

export type UserRole =
  | "STUDENT"
  | "TEACHER"
  | "ADMIN";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;

  login: (
    email: string,
    password: string
  ) => Promise<User>;

  logout: () => void;
}

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      const token =
        localStorage.getItem("token");

      // Walang token = hindi naka-login
      if (!token) {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }

        return;
      }

      try {
        const response =
          await api.get("/auth/me");

        if (mounted) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.error(
          "Failed to load authenticated user:",
          error
        );

        localStorage.removeItem("token");

        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<User> => {
    const response =
      await api.post("/auth/login", {
        email,
        password,
      });

    const token =
      response.data.token;

    const user =
      response.data.user;

    if (!token || !user) {
      throw new Error(
        "Invalid login response from server."
      );
    }

    localStorage.setItem(
      "token",
      token
    );

    setUser(user);

    return user;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}