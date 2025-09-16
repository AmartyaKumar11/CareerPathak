import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

interface AuthContextType {
  user: User | null;
  signIn: (credential: string) => Promise<void>;
  signOut: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (credential: string): Promise<void> => {
    try {
      setLoading(true);
      let userData: User;

      if (credential.startsWith('mock.')) {
        // Handle mock token for testing
        const payload = JSON.parse(atob(credential.split('.')[1]));
        userData = {
          id: payload.sub,
          email: payload.email,
          name: payload.name,
          picture: payload.picture,
        };
      } else {
        // Handle real JWT credential from Google
        const payload = JSON.parse(atob(credential.split('.')[1]));
        userData = {
          id: payload.sub,
          email: payload.email,
          name: payload.name,
          picture: payload.picture,
        };
      }
      
      console.log('🔑 User data after Google sign-in:', userData);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      // Register user in backend
      console.log('📡 Sending registration request to backend...');
      fetch('http://localhost:3001/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          googleId: userData.id,
          email: userData.email,
          name: userData.name
        })
      })
        .then(res => {
          console.log('📡 Backend response status:', res.status);
          return res.json();
        })
        .then(data => console.log('✅ Backend registration response:', data))
        .catch(err => console.error('❌ Backend registration error:', err));
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = (): void => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value: AuthContextType = {
    user,
    signIn,
    signOut,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
