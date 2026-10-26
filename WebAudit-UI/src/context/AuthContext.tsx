import React, { createContext, useContext, useEffect, useState } from 'react';
import { loadConfig } from '../services/config';

export interface User {
  name: string;
  email: string;
  picture?: string;
  sub?: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  loginWithRedirect: (options?: unknown) => void;
  logout: (options?: unknown) => void;
  getAccessTokenSilently: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  loginWithRedirect: () => {},
  logout: () => {},
  getAccessTokenSilently: async () => '',
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>({
    name: 'Local Developer',
    email: 'local-dev-user@webaudit.local',
  });

  useEffect(() => {
    let mounted = true;
    loadConfig().then((config) => {
      if (!mounted) return;
      const isAuth0Configured = Boolean(
        config.auth?.domain &&
        config.auth.domain !== 'YOUR_AUTH0_DOMAIN' &&
        config.auth.clientId
      );

      // Check stored session override for testing login/logout
      const storedAuth = sessionStorage.getItem('webaudit_auth');
      if (storedAuth !== null) {
        const authed = storedAuth === 'true';
        setIsAuthenticated(authed);
        setUser(authed ? { name: 'Local Developer', email: 'local-dev-user@webaudit.local' } : null);
      } else {
        // By default in local dev, user is authenticated so all features can be explored locally
        setIsAuthenticated(true);
        setUser({ name: 'Local Developer', email: 'local-dev-user@webaudit.local' });
      }
      setIsLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const loginWithRedirect = () => {
    sessionStorage.setItem('webaudit_auth', 'true');
    setIsAuthenticated(true);
    setUser({ name: 'Local Developer', email: 'local-dev-user@webaudit.local' });
  };

  const logout = () => {
    sessionStorage.setItem('webaudit_auth', 'false');
    setIsAuthenticated(false);
    setUser(null);
  };

  const getAccessTokenSilently = async () => {
    return 'local-dev-token';
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        loginWithRedirect,
        logout,
        getAccessTokenSilently,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
