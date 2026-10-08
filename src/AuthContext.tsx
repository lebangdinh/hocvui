import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, query, where, addDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType, logout } from './firebase';
import { UserProfile } from './types';
import { removeProfileServer, eraseAccountServer } from './services/accountDeletion';

interface AuthContextType {
  user: FirebaseUser | null;
  role: 'parent' | 'reviewer' | 'admin';
  profile: UserProfile | null;
  profiles: UserProfile[];
  loading: boolean;
  isAuthReady: boolean;
  selectProfile: (profile: UserProfile | null) => void;
  addProfile: (name: string, grade: number) => Promise<void>;
  deleteProfile: (profileId: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  setFavoriteBadge: (badgeId: string | null) => Promise<void>;
  addPoints: (points: number) => Promise<void>;
  awardBadge: (badgeId: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: 'parent',
  profile: null,
  profiles: [],
  loading: true,
  isAuthReady: false,
  selectProfile: () => {},
  addProfile: async () => {},
  deleteProfile: async () => {},
  deleteAccount: async () => {},
  setFavoriteBadge: async () => {},
  addPoints: async () => {},
  awardBadge: async () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<'parent' | 'reviewer' | 'admin'>('parent');
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    let unsubscribeProfiles: (() => void) | null = null;
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (unsubscribeProfiles) { unsubscribeProfiles(); unsubscribeProfiles = null; }
      setUser(firebaseUser);
      setIsAuthReady(true);
      
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdTokenResult();
          setRole(token.claims.role === 'admin' ? 'admin' : token.claims.role === 'reviewer' ? 'reviewer' : 'parent');
        } catch {
          setRole('parent');
        }
        const profilesRef = collection(db, 'users', firebaseUser.uid, 'profiles');
        
        // Listen to all profiles
        unsubscribeProfiles = onSnapshot(profilesRef, (snapshot) => {
          const profilesData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as UserProfile));
          setProfiles(profilesData);
          
          // If current profile is not in the list anymore, reset it
          setProfile(prev => {
            if (!prev) return null;
            const updated = profilesData.find(p => p.id === prev.id);
            return updated || null;
          });
        }, (error) => {
          console.error('Unable to subscribe to student profiles:', error);
          setLoading(false);
        });

        setLoading(false);
      } else {
        setRole('parent');
        setProfile(null);
        setProfiles([]);
        setLoading(false);
      }
    });

    return () => { unsubscribe(); if (unsubscribeProfiles) unsubscribeProfiles(); };
  }, []);

  const selectProfile = (p: UserProfile | null) => {
    setProfile(p);
    if (p) {
      localStorage.setItem(`lastProfile_${user?.uid}`, p.id);
    } else {
      localStorage.removeItem(`lastProfile_${user?.uid}`);
    }
  };

  const addProfile = async (name: string, grade: number) => {
    if (!user || grade < 1 || grade > 5 || !Number.isInteger(grade)) return;
    const profilesRef = collection(db, 'users', user.uid, 'profiles');
    const newProfileRef = doc(profilesRef); // Pre-generate ID
    const newProfileData = {
      id: newProfileRef.id,
      uid: user.uid,
      displayName: name,
      email: user.email || '',
      grade,
      totalPoints: 0,
      level: 1,
      createdAt: new Date().toISOString(),
      badges: []
    };
    try {
      await setDoc(newProfileRef, newProfileData);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/profiles`);
    }
  };

  const deleteProfile = async (profileId: string) => {
    if (!user) return;
    try {
      await removeProfileServer(profileId);
      if (profile?.id === profileId) selectProfile(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/profiles/${profileId}`);
    }
  };

  const deleteAccount = async () => {
    if (!user) return;
    try {
      await eraseAccountServer();
      selectProfile(null);
      await logout();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}`);
    }
  };

  const setFavoriteBadge = async (badgeId: string | null) => {
    if (!user || !profile) return;
    const profileRef = doc(db, 'users', user.uid, 'profiles', profile.id);
    try {
      await updateDoc(profileRef, { favoriteBadge: badgeId });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}/profiles/${profile.id}`);
    }
  };

  const addPoints = async (points: number) => {
    if (!user || !profile) return;
    const profileRef = doc(db, 'users', user.uid, 'profiles', profile.id);
    try {
      const newTotalPoints = profile.totalPoints + points;
      const newLevel = Math.floor(newTotalPoints / 1000) + 1;
      
      await updateDoc(profileRef, {
        totalPoints: newTotalPoints,
        level: newLevel
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}/profiles/${profile.id}`);
    }
  };

  const awardBadge = async (badgeId: string) => {
    if (!user || !profile) return;
    if (profile.badges?.includes(badgeId)) return;
    
    const profileRef = doc(db, 'users', user.uid, 'profiles', profile.id);
    try {
      const { arrayUnion } = await import('firebase/firestore');
      await updateDoc(profileRef, {
        badges: arrayUnion(badgeId)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}/profiles/${profile.id}`);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      role,
      profile, 
      profiles, 
      loading, 
      isAuthReady, 
      selectProfile, 
      addProfile, 
      deleteProfile,
      deleteAccount,
      setFavoriteBadge,
      addPoints,
      awardBadge,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
