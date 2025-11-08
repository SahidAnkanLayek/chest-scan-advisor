import { Outlet } from "react-router-dom";
import { useUser, useClerk } from "@clerk/clerk-react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useToast } from "@/hooks/use-toast";

const DashboardLayout = () => {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
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

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar onLogout={handleLogout} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar user={user} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;