import { UserButton, useUser } from "@clerk/clerk-react";

const Navbar = () => {
  const { user } = useUser();

  const getUserName = () => {
    return user?.fullName || user?.firstName || user?.primaryEmailAddress?.emailAddress?.split("@")[0] || "User";
  };

  return (
    <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Welcome back, {getUserName()}</h2>
        <p className="text-sm text-muted-foreground">Manage your X-ray diagnoses and reports</p>
      </div>

      <div className="flex items-center gap-4">
        <UserButton 
          afterSignOutUrl="/auth"
          appearance={{
            elements: {
              avatarBox: "h-10 w-10 ring-2 ring-primary/20 hover:ring-primary/40 transition-all"
            }
          }}
        />
      </div>
    </header>
  );
};

export default Navbar;
