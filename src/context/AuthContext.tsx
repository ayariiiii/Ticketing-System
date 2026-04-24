import { createContext, useContext, useState } from "react";
import { User } from "../types";

interface AuthContextType {
  user: User | null;
  login: (role: "admin" | "user") => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (role: "admin" | "user") => {
    const mockUser: User = {
      id: "1",
      name: role === "admin" ? "Admin User" : "Regular User",
      email: "demo@email.com",
      role,
    };

    setUser(mockUser);
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};