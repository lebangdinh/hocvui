import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, query, where, addDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType, logout } from './firebase';
import { UserProfile } from './types';
import { eraseAccountServer } from './services/accountDeletion';
import { moveProfileToTrash, restoreProfileFromTrash, purgeTrashedProfile, purgeExpiredTrashForSignedInParent, isTrashed } from './services/profileTrash';

interface AuthContextType {
  user: FirebaseUser | null;
  role: 'parent' | 'reviewer' | 'admin';
  profile: UserProfile | null;
  profiles: UserProfile[];
  trashProfiles: UserProfile[];
  trashError: string | null;
  profilesError: string | null;
  loading: boolean;
  isAuthReady: boolean;
  selectProfile: (profile: UserProfile | null) => void;
  addProfile: (name: string, grade: number) => Promise<void>;
  deleteProfile: (profileId: string) => Promise<void>;
  restoreProfile: (profileId: string) => Promise<void>;
  purgeProfile: (profileId: string) => Promise<void>;
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
  trashProfiles: [],
  trashError: null,
  profilesError: null,
  loading: true,
  isAuthReady: false,
  selectProfile: () => {},
  addProfile: async () => {},
  deleteProfile: async () => {},
  restoreProfile: async () => {},
  purgeProfile: async () => {},
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
  const [trashProfiles, setTrashProfiles] = useState<UserProfile[]>([]);
  const [trashError, setTrashError] = useState<string | null>(null);
  const [profilesError, setProfilesError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    let unsubscribeProfiles: (() => void) | null = null;
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      let cleanupRequested = false;
      if (unsubscribeProfiles) { unsubscribeProfiles(); unsubscribeProfiles = null; }
      setUser(firebaseUser);
      setProfilesError(null);
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
          setProfilesError(null);
          const allProfiles = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as UserProfile));
          const profilesData = allProfiles.filter(p => !isTrashed(p));
          setProfiles(profilesData);
          setTrashProfiles(allProfiles.filter(p => isTrashed(p)));
          if (!cleanupRequested && !snapshot.metadata.fromCache) {
            cleanupRequested = true;
            void purgeExpiredTrashForSignedInParent()
              .then(() => setTrashError(null))
              .catch(error => setTrashError(error instanceof Error ? error.message : 'Chưa dọn được Thùng rác quá hạn.'));
          }
          
          // If current profile is not in the list anymore, reset it
          setProfile(prev => {
            if (!prev) return null;
            const updated = profilesData.find(p => p.id === prev.id);
            return updated || null;
          });
        }, (error) => {
          console.error('Unable to subscribe to student profiles:', error.code);
          setProfilesError(error.code === 'permission-denied'
            ? 'Firebase chưa cho phép đọc hồ sơ. Cần xuất bản Firestore Rules của Học Vui V5.'
            : 'Không tải được hồ sơ học sinh. Vui lòng kiểm tra kết nối và thử lại.');
          setLoading(false);
        });

        setLoading(false);
      } else {
        setRole('parent');
        setProfile(null);
        setProfiles([]);
        setTrashProfiles([]);
        setTrashError(null);
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
    if (!user) throw new Error('Bạn cần đăng nhập trước khi xóa hồ sơ.');
    await moveProfileToTrash(profileId);
    if (profile?.id === profileId) selectProfile(null);
  };

  const restoreProfile = async (profileId: string) => {
    if (!user) throw new Error('Vui lòng đăng nhập.');
    await restoreProfileFromTrash(profileId);
  };

  const purgeProfile = async (profileId: string) => {
    if (!user) throw new Error('Vui lòng đăng nhập.');
    await purgeTrashedProfile(profileId);
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
      trashProfiles,
      trashError,
      profilesError,
      loading, 
      isAuthReady, 
      selectProfile, 
      addProfile, 
      deleteProfile,
      restoreProfile,
      purgeProfile,
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
