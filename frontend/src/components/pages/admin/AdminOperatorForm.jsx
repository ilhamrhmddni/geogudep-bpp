import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchUserId,
  createUser,
  editUser,
} from "../../../services/OperatorService"; // Adjust the import based on your service file
import AdminTemplate from "../../templates/AdminTemplate";

const AdminOperatorForm = ({ isEdit }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fullname, setFullname] = useState("");
  const [asal, setAsal] = useState("");
  const [noTelp, setNoTelp] = useState("");
  const [password, setPassword] = useState(""); // State for new password
  const [confirmPassword, setConfirmPassword] = useState(""); // State for confirming new password
  const [role, setRole] = useState("operator"); // Default role
  const [oldPassword, setOldPassword] = useState(""); // State for old password
  const [showOldPassword, setShowOldPassword] = useState(false); // State to toggle visibility of old password
  const navigate = useNavigate();
  const { id } = useParams(); // Get ID from URL

  // Fetch data if it's an edit case
  useEffect(() => {
    if (isEdit && id) {
      const fetchData = async () => {
        try {
          const result = await fetchUserId(id); // Ensure this calls the correct function
          const { data } = result; // Ensure data is retrieved correctly
          setUsername(data.username);
          setEmail(data.email);
          setFullname(data.fullname);
          setAsal(data.asal);
          setNoTelp(data.no_telp);
          setRole(data.role); // Set the current role
          setOldPassword(data.password); // Set the old password
          setIsLoggedIn(data.isLoggedIn ? "true" : "false"); // Set the current status login
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

      fetchData();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Show confirmation popup
    const confirmSubmit = window.confirm(
      isEdit
        ? "Are you sure you want to update the operator data?"
        : "Are you sure you want to save this new operator?"
    );

    if (confirmSubmit) {
      // Check if passwords match
      if (password && password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
      }

      const newData = {
        username,
        email,
        fullname,
        asal,
        no_telp: noTelp,
        role, // Include role in the data
        password: password || undefined, // Include password only if provided
      };

      try {
        if (isEdit && id) {
          // Update the operator data
          await editUser(id, newData);
        } else {
          // Create a new operator
          await createUser(newData);
        }

        // Redirect after submit
        navigate("/admin/operator");
      } catch (error) {
        console.error("Error submitting form:", error);
      }
    } else {
      console.log("Form submission canceled.");
    }
  };

  return (
    <AdminTemplate>
      <div className="flex flex-auto items-center justify-center">
        <div className="p-8 bg-white rounded-lg shadow-xl text-left">
          <h1 className="text-2xl font-bold mb-6 mx-96">
            {isEdit ? "Edit Data Operator" : "Tambah Data Operator"}
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4 ">
            <div className="flex flex-col">
              <label className="mb-1 font-semibold">Username</label>
              <input
                type="text"
                value={username || ""}
                onChange={(e) => setUsername(e.target.value)}
                className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 font-semibold">Email</label>
              <input
                type="email"
                value={email || ""}
                onChange={(e) => setEmail(e.target.value)}
                className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 font-semibold">Full Name</label>
              <input
                type="text"
                value={fullname || ""}
                onChange={(e) => setFullname(e.target.value)}
                className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 font-semibold">Asal</label>
              <input
                type="text"
                value={asal || ""}
                onChange={(e) => setAsal(e.target.value)}
                className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 font-semibold">No. Telepon</label>
              <input
                type="text"
                value={noTelp || ""}
                onChange={(e) => setNoTelp(e.target.value)}
                className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 font-semibold">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
              >
                <option value="operator">Operator</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="mb-1 font-semibold">Old Password</label>
              <div className="flex flex-row ">
                <input
                  type={showOldPassword ? "text" : "password"}
                  value={oldPassword || ""}
                  readOnly
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF] w-full"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="text-sm text-[#9500FF]"
                >
                  {showOldPassword ? "Hide" : "Show"} Old Password
                </button>
              </div>
            </div>
            <br />
            <div className="flex flex-col">
              <label className="mb-1 font-semibold">New Password</label>
              <input
                type="password"
                value={password || ""}
                onChange={(e) => setPassword(e.target.value)}
                className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 font-semibold">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword || ""}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9500FF]"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#9500FF] text-white font-bold p-3 my-6 rounded-md hover:bg-[#9500FF] transition duration-200"
            >
              {isEdit ? "Update" : " Save"}
            </button>
          </form>
        </div>
      </div>
    </AdminTemplate>
  );
};

export default AdminOperatorForm;
