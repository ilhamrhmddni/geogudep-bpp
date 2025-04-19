import { jwtDecode } from "jwt-decode";
import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import LoginPage from "./components/pages/LoginPage";
import NotFound from "./components/pages/NotFound";
import AdminEvent from "./components/pages/admin/AdminEvent";
import AdminEventForm from "./components/pages/admin/AdminEventForm";
import AdminGeografis from "./components/pages/admin/AdminGeografis";
import AdminGugusDepan from "./components/pages/admin/AdminGugusDepan";
import AdminKwarran from "./components/pages/admin/AdminKwarran";
import AdminKwarranForm from "./components/pages/admin/AdminKwarranForm";
import AdminRequestLaporanGudep from "./components/pages/admin/AdminLaporanGudep";
import AdminOperator from "./components/pages/admin/AdminOperator";
import AdminOperatorForm from "./components/pages/admin/AdminOperatorForm";
import AdminPesertaDidik from "./components/pages/admin/AdminPesertaDidik";
import AdminPrestasi from "./components/pages/admin/AdminPrestasi";
import AdminProfile from "./components/pages/admin/AdminProfile";
import OperatorEventForm from "./components/pages/operator/OperatorEventForm";
import OperatorGeografis from "./components/pages/operator/OperatorGeografis";
import OperatorGugusDepan from "./components/pages/operator/OperatorGugusDepan";
import OperatorPesertaDidik from "./components/pages/operator/OperatorPesertaDidik";
import OperatorPesertaDidikForm from "./components/pages/operator/OperatorPesertaDidikForm";
import OperatorPrestasi from "./components/pages/operator/OperatorPrestasi";
import OperatorPrestasiForm from "./components/pages/operator/OperatorPrestasiForm";
import OperatorProfile from "./components/pages/operator/OperatorProfile";
import UserDashboard from "./components/pages/user/UserDashboard";
import UserGugusdepan from "./components/pages/user/UserGugusdepan";
import UserLaporan from "./components/pages/user/UserLaporan";

const App = () => {
  const token = localStorage.getItem("token");
  let roleUser = "";

  if (token) {
    try {
      const decoded = jwtDecode(token);
      roleUser = decoded.role;
    } catch (error) {
      console.error("Invalid token");
    }
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Operator Routes */}
        <Route
          path="/operator/gugusdepan"
          element={
            <ProtectedRoute allowedRoles="operator">
              <OperatorGugusDepan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operator/geografis"
          element={
            <ProtectedRoute allowedRoles="operator">
              <OperatorGeografis />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operator/prestasi"
          element={
            <ProtectedRoute allowedRoles="operator">
              <OperatorPrestasi />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operator/prestasi/add"
          element={
            <ProtectedRoute allowedRoles="operator">
              <OperatorPrestasiForm isEdit={false} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operator/prestasi/edit/:id"
          element={
            <ProtectedRoute allowedRoles="operator">
              <OperatorPrestasiForm isEdit={true} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operator/event/add"
          element={
            <ProtectedRoute allowedRoles="operator">
              <OperatorEventForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operator/pesertadidik"
          element={
            <ProtectedRoute allowedRoles="operator">
              <OperatorPesertaDidik />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operator/pesertadidik/add"
          element={
            <ProtectedRoute allowedRoles="operator">
              <OperatorPesertaDidikForm isEdit={false} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operator/pesertadidik/edit/:id"
          element={
            <ProtectedRoute allowedRoles="operator">
              <OperatorPesertaDidikForm isEdit={true} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operator/profile"
          element={
            <ProtectedRoute allowedRoles="operator">
              <OperatorProfile />
            </ProtectedRoute>
          }
        />
        {/* Admin Routes */}
        <Route
          path="/admin/kwarran/add"
          element={
            <ProtectedRoute allowedRoles="admin">
              <AdminKwarranForm isEdit={false} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/kwarran/edit/:id"
          element={
            <ProtectedRoute allowedRoles="admin">
              <AdminKwarranForm isEdit={true} />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/kwarran"
          element={
            <ProtectedRoute allowedRoles="admin">
              <AdminKwarran />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/operator"
          element={
            <ProtectedRoute allowedRoles="admin">
              <AdminOperator />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/operator/add"
          element={
            <ProtectedRoute allowedRoles="admin">
              <AdminOperatorForm isEdit={false} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/operator/edit/:id"
          element={
            <ProtectedRoute allowedRoles="admin">
              <AdminOperatorForm isEdit={true} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/pesertadidik"
          element={
            <ProtectedRoute allowedRoles="admin">
              <AdminPesertaDidik />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/gugusdepan"
          element={
            <ProtectedRoute allowedRoles="admin">
              <AdminGugusDepan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/geografis"
          element={
            <ProtectedRoute allowedRoles="admin">
              <AdminGeografis />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/event"
          element={
            <ProtectedRoute allowedRoles="admin">
              <AdminEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/event/add"
          element={
            <ProtectedRoute allowedRoles="admin">
              <AdminEventForm isEdit={false} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/event/edit/:id"
          element={
            <ProtectedRoute allowedRoles="admin">
              <AdminEventForm isEdit={true} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/laporangudep"
          element={
            <ProtectedRoute allowedRoles="admin">
              <AdminRequestLaporanGudep />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/prestasi"
          element={
            <ProtectedRoute allowedRoles="admin">
              <AdminPrestasi />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute allowedRoles="admin">
              <AdminProfile />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<UserDashboard />} />
        <Route path="/gugusdepan" element={<UserGugusdepan />} />
        <Route path="/laporan" element={<UserLaporan />} />
        {/* Catch-all route for 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
