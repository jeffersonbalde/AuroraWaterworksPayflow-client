// src/contexts/AuthContext.jsx - UPDATED WITH DELINQUENT SUPPORT
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

    console.log("🔍 Login API Response:", { // DEBUG
      status: response.status,
      data: data
    });

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
      // Return ALL error data from backend
      return { 
        success: false, 
        error: data.error,
        message: data.message,
        deactivation_info: data.deactivation_info,
        rejection_info: data.rejection_info
      };
    }
  } catch (error) {
    console.error('Login error:', error);
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

  // UPDATED: Added delinquent status and fixed isApproved logic
  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    pendingApprovals,
    refreshPendingApprovals,
    refreshUserData,
    isAuthenticated: !!user && !!token,
    
    // Role helpers
    isAdmin: user?.role === 'admin',
    isStaff: user?.role === 'staff',
    isClient: user?.role === 'client',
    
    // Status helpers - UPDATED
    isPending: user?.status === 'pending',
    isRejected: user?.status === 'rejected',
    isActive: user?.status === 'active',
    isDelinquent: user?.status === 'delinquent', // ADDED THIS
    
    // Combined status helpers - UPDATED
    isApproved: user?.status === 'active' || user?.status === 'delinquent', // DELINQUENT IS CONSIDERED "APPROVED"
    
    // Permission helpers
    canManageUsers: user?.role === 'admin',
    canManageBilling: user?.role === 'admin' || user?.role === 'staff',
    canViewReports: user?.role === 'admin' || user?.role === 'staff',
    
    // Client access helpers - ADDED THESE
    hasFullClientAccess: user?.role === 'client' && (user?.status === 'active' || user?.status === 'delinquent'),
    hasLimitedClientAccess: user?.role === 'client' && (user?.status === 'pending' || user?.status === 'rejected'),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}