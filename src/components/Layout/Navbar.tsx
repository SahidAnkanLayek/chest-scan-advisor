import { useUser } from "@clerk/clerk-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";

interface NavbarProps {
  user: ReturnType<typeof useUser>["user"];
  onLogout: () => void;
}

const Navbar = ({ user, onLogout }: NavbarProps) => {
  if (!user) return null;
  
  const userName = user.fullName || user.primaryEmailAddress?.emailAddress || "User";
  const userInitials = user.firstName && user.lastName 
    ? `${user.firstName[0]}${user.lastName[0]}` 
    : userName.substring(0, 2).toUpperCase();

  return (
    <header className="border-b bg-card">
      <div className="flex h-16 items-center justify-between px-6">
        <div>
          <h2 className="text-lg font-semibold">Welcome back, {user.firstName || "User"}!</h2>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer h-9 w-9">
              <AvatarImage src={user.imageUrl} alt={userName} />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Navbar;