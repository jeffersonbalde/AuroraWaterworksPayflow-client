// src/components/AdminClientRoute.jsx
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

const AdminClientRoute = ({ children }) => {
  const { user, isAdmin, isClient, isApproved } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Allow only admin and approved client users
  if (isAdmin || (isClient && isApproved)) {
    return children;
  }

  // Redirect staff and other users to unauthorized page
  return <Navigate to="/unauthorized" replace />;
};

export default AdminClientRoute;