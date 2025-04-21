import { jwtDecode } from "jwt-decode";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const token = localStorage.getItem("token");

  // Redirect to login if no token exists
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const userRole = decoded.role;

    // Convert allowedRoles to array if it's a string
    const rolesArray = Array.isArray(allowedRoles)
      ? allowedRoles
      : [allowedRoles];

    // Check if user's role is included in allowed roles
    // If allowedRoles is empty, allow all roles
    if (rolesArray.length > 0 && !rolesArray.includes(userRole)) {
      return <Navigate to="/notfound" replace />;
    }

    return children;
  } catch (error) {
    console.error("Token error:", error);
    localStorage.removeItem("token"); // Clear invalid token
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
