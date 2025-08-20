"use client";

import * as React from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import Image from 'next/image';

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
  
  // --- Read environment variables with fallbacks ---
  const defaultUserRole = (process.env.NEXT_PUBLIC_DEFAULT_USER_ROLE || "normal") as 'captain' | 'core' | 'normal';
  const logoUrl = process.env.NEXT_PUBLIC_LOGO_URL;

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile);
        } else {
          // --- Use environment variable for the default role ---
          const defaultProfile: UserProfile = {
            uid: currentUser.uid,
            email: currentUser.email,
            fullName: currentUser.displayName || "New Member",
            role: defaultUserRole,
          };
          await setDoc(userDocRef, defaultProfile);
          setUserProfile(defaultProfile);
        }
        setUser(currentUser);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setTimeout(() => setLoading(false), 500);
    });

    return () => unsubscribe();
  // Added defaultUserRole to the dependency array
  }, [defaultUserRole]);

  const value = { user, userProfile, loading };

  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen bg-background">
            <div className="relative flex items-center justify-center">
                <div className="spinner"></div>
                {/* --- Use logo from environment variable for the loading screen --- */}
                {logoUrl && (
                  <Image 
                      src={logoUrl} 
                      alt="SJECAero Logo" 
                      width={80} 
                      height={80}
                      className="rounded-full"
                      priority
                  />
                )}
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