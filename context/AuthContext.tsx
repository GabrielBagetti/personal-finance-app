import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useRouter, useSegments } from 'expo-router';
import { Platform } from 'react-native';

interface User {
  id: number;
  email: string;
  profilePhotoUrl?: string | null;
  role: string;
}

const API_URL = 'http://192.168.0.103:3000'; 
const TOKEN_KEY = 'session_token';
const USER_KEY = 'user_data';

interface AuthContextType {
  signIn: (token: string, user: User) => void; 
  signOut: () => void;
  session: string | null;
  user: User | null; 
  isLoading: boolean;
  updateUserEmail: (newEmail: string) => Promise<void>;
  updateUserProfilePhoto: (photoUrl: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


async function saveData(token: string, user: User) {
  const userString = JSON.stringify(user);
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, userString);
    } catch (e) {
      console.error('Falha ao salvar dados no localStorage', e);
    }
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(USER_KEY, userString);
  }
}

async function loadData() {
  if (Platform.OS === 'web') {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const userString = localStorage.getItem(USER_KEY);
      const user = userString ? JSON.parse(userString) : null;
      return { token, user };
    } catch (e) {
      return { token: null, user: null };
    }
  } else {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    const userString = await SecureStore.getItemAsync(USER_KEY);
    const user = userString ? JSON.parse(userString) : null;
    return { token, user };
  }
}

async function deleteData() {
  if (Platform.OS === 'web') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null); 
  const [isLoading, setIsLoading] = useState(true);
  
  const segments = useSegments();
  const router = useRouter();
  
  useEffect(() => {
    async function loadSession() {
      try {
        const { token, user } = await loadData();
        if (token && user) {
          setSession(token);
          setUser(user);
        }
      } catch (e) {
        console.error("Erro ao carregar a sessão:", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadSession();
  }, []);



  useEffect(() => {
    if (isLoading) return;
    const inAppGroup = segments[0] === '(tabs)';
    if (!session && inAppGroup) {
      router.replace('/login');
    } else if (session && !inAppGroup) {
      router.replace('/');
    }
  }, [session, segments, isLoading, router]);


  const authActions = {
    signIn: async (token: string, userData: User) => {
      await saveData(token, userData); 
      setSession(token);
      setUser(userData);
    },
    signOut: async () => {
      await deleteData();
      setSession(null);
      setUser(null);
    },
    updateUserEmail: async (newEmail: string) => {
      if (user && session) {
        const updatedUser = { ...user, email: newEmail };
        setUser(updatedUser);
        await saveData(session, updatedUser);
      }
    },
    updateUserProfilePhoto: (photoUrl: string | null) => {
      setUser(currentUser => {
        if (!currentUser) return null;
        const updatedUser = { ...currentUser, profilePhotoUrl: photoUrl };
        saveData(session!, updatedUser);
        return updatedUser;
      });
    },
    session,
    user,
    isLoading,
  };

  return (
    <AuthContext.Provider value={authActions}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { API_URL };