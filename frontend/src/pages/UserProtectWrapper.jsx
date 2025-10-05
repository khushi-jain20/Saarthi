import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import { useNavigate, Navigate, Outlet } from "react-router-dom"; // Import Navigate and Outlet
import api from "../api";

const UserProtectWrapper = () => {
  const navigate = useNavigate();
  const { user, setUser, loading: contextLoading } = useContext(UserContext);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const verifyUserSession = async () => {
      try {
        const response = await api.get("/auth/profile");
        
        if (response.user?._id) {
          setUser(response.user);
        } else {
          throw new Error("Invalid user profile data from server");
        }
      } catch (err) {
        console.error("Session verification failed:", err.message || err);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        navigate("/login");
      } finally {
        setIsVerifying(false);
      }
    };

    if (!contextLoading) {
      if (!user && token) {
        verifyUserSession();
      } else {
        setIsVerifying(false);
      }
    }
  }, [contextLoading, user, setUser, navigate]);

  const isLoading = contextLoading || isVerifying;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div>Loading session...</div>
      </div>
    );
  }

  // Use <Navigate> component for redirection, which is the modern standard
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Use <Outlet /> to render the nested child routes
  return <Outlet />;
};

// THIS IS THE CRITICAL LINE THAT WAS LIKELY MISSING
export default UserProtectWrapper;