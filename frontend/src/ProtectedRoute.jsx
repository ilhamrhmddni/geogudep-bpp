import { jwtDecode } from "jwt-decode";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const userRole = decoded.role;

    const rolesArray = Array.isArray(allowedRoles)
      ? allowedRoles
      : [allowedRoles];

    if (rolesArray.length > 0 && !rolesArray.includes(userRole)) {
      return <Navigate to="/login" replace />;
    }

    return children;
  } catch (err) {
    console.error("Token invalid:", err);
    localStorage.removeItem("token"); // Bersihin token rusak
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
