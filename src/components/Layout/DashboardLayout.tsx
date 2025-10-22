import { useEffect } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useUser, useClerk } from "@clerk/clerk-react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import EmailVerificationNotice from "../Auth/EmailVerificationNotice";

const DashboardLayout = () => {
  const { isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      // Store the intended destination for redirect after login
      const destination = location.pathname + location.search;
      sessionStorage.setItem('clerk_redirect_url', destination);
      navigate("/auth");
    }
  }, [isLoaded, isSignedIn, navigate, location]);

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar onLogout={handleLogout} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <EmailVerificationNotice />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;