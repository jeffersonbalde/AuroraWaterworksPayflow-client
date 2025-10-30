// src/contexts/AuthContext.jsx - FIXED
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [pendingApprovals, setPendingApprovals] = useState(0);

  // Function to fetch pending approvals count
  const fetchPendingApprovalsCount = async (authToken) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_LARAVEL_API}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const pendingUsers = data.users?.filter(user => user.status === 'pending') || [];
        setPendingApprovals(pendingUsers.length);
      } else {
        setPendingApprovals(0);
      }
    } catch (error) {
      console.error("Failed to fetch pending approvals count:", error);
      setPendingApprovals(0);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_LARAVEL_API}/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);

        if (userData.role === 'admin' || userData.role === 'staff') {
          await fetchPendingApprovalsCount(token);
        }
      } else {
        logout();
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Add this function for refreshing user data
  const refreshUserData = async () => {
    if (token) {
      await fetchUser();
    }
  };

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_LARAVEL_API}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        
        if (data.user?.role === 'admin' || data.user?.role === 'staff') {
          await fetchPendingApprovalsCount(data.token);
        }
        
        return { 
          success: true, 
          redirectTo: data.redirect_to,
          user: data.user 
        };
      } else {
        return { 
          success: false, 
          message: data.message || 'Login failed' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        message: 'Network error. Please try again.' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_LARAVEL_API}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.status === 201) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        
        return { 
          success: true, 
          message: data.message,
          redirectTo: data.redirect_to,
          user: data.user
        };
      } else {
        return { 
          success: false, 
          message: data.message || 'Registration failed',
          errors: data.errors 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        message: 'Network error. Please try again.' 
      };
    }
  };

  const logout = async () => {
    if (token) {
      try {
        await fetch(`${import.meta.env.VITE_LARAVEL_API}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setPendingApprovals(0);
    
    return '/';
  };

  const refreshPendingApprovals = async () => {
    if (token && (user?.role === 'admin' || user?.role === 'staff')) {
      await fetchPendingApprovalsCount(token);
    }
  };

  // FIXED: Include token and refreshUserData in the value
  const value = {
    user,
    token, // ← THIS WAS MISSING
    login,
    register,
    logout,
    loading,
    pendingApprovals,
    refreshPendingApprovals,
    refreshUserData, // ← ADD THIS
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'admin',
    isStaff: user?.role === 'staff',
    isClient: user?.role === 'client',
    isPending: user?.status === 'pending',
    isRejected: user?.status === 'rejected',
    isApproved: user?.status === 'active',
    canManageUsers: user?.role === 'admin',
    canManageBilling: user?.role === 'admin' || user?.role === 'staff',
    canViewReports: user?.role === 'admin' || user?.role === 'staff',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}