import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Redirect to home if authenticated, otherwise to welcome page
    if (isAuthenticated) {
      navigate("/home");
    } else {
      navigate("/welcome");
    }
  }, [isAuthenticated, navigate]);

  return null; // Render nothing, just redirect
};

export default Index;