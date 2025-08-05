// src/context/AuthContext.tsx
"use client";

import * as React from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import Image from 'next/image'; // 👈 Import the Image component

interface UserProfile {
  uid: string;
  email: string | null;
  fullName: string | null;
  role: 'captain' | 'core' | 'normal';
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile);
        } else {
          const defaultProfile: UserProfile = {
            uid: currentUser.uid,
            email: currentUser.email,
            fullName: currentUser.displayName || "New Member",
            role: "normal",
          };
          await setDoc(userDocRef, defaultProfile);
          setUserProfile(defaultProfile);
        }
        setUser(currentUser);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      // Add a small delay to prevent flickering on fast connections
      setTimeout(() => setLoading(false), 500);
    });

    return () => unsubscribe();
  }, []);

  const value = { user, userProfile, loading };

  // 👇 This is the updated loading screen
  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen bg-background">
            <div className="relative flex items-center justify-center">
                <div className="spinner"></div>
                <Image 
                    src="/images/logo.png" 
                    alt="SJECAero Logo" 
                    width={80} 
                    height={80}
                    className="rounded-full" // Optional: if your logo looks better rounded
                />
            </div>
        </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}