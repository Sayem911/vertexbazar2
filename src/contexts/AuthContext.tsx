"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie"; // Import js-cookie for cookie management

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Fetch user data based on the cookie
    const fetchUser = async () => {
      try {
        const response = await axios.get("/api/user/profile"); // Automatically sends cookies
        setUser(response.data.user);
      } catch (error) {
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await axios.post("/api/auth/signin", { email, password });
      const { user } = response.data;

      // Set the user state
      setUser(user);

      // Redirect to the profile page
      router.push("/user/profile");
    } catch (error) {
      console.error("Failed to sign in:", error);
      throw error; // Optionally handle the error in the component
    }
  };

  const signOut = async () => {
    try {
      await axios.post("/api/auth/signout"); // Call your existing signout route

      // Clear the cookie and reset user state
      Cookies.remove("accessToken"); // Remove the JWT cookie
      setUser(null);

      // Redirect to the sign-in page
      router.push("/signin");
    } catch (error) {
      console.error("Failed to sign out:", error);
      throw error; // Optionally handle the error in the component
    }
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
