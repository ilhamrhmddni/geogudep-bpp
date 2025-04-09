import { jwtDecode } from "jwt-decode";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const userRole = decoded.role;

    console.log("Token Role:", userRole);
    console.log("Allowed:", allowedRoles);

    // Biar bisa menerima string atau array
    const allowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!allowed.includes(userRole)) {
      return <Navigate to="/notfound" replace />;
    }

    return children;
  } catch (error) {
    console.error("Token error:", error);
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
