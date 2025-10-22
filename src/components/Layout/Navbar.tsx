import { UserResource } from "@clerk/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User as UserIcon } from "lucide-react";

interface NavbarProps {
  user: UserResource;
  onLogout: () => void;
}

const Navbar = ({ user, onLogout }: NavbarProps) => {
  const getInitials = () => {
    const email = user.primaryEmailAddress?.emailAddress || "";
    return email.substring(0, 2).toUpperCase();
  };

  const getUserName = () => {
    return user.fullName || user.firstName || user.primaryEmailAddress?.emailAddress?.split("@")[0] || "User";
  };

  return (
    <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Welcome back, {getUserName()}</h2>
        <p className="text-sm text-muted-foreground">Manage your X-ray diagnoses and reports</p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger className="focus:outline-none">
          <Avatar className="h-10 w-10 ring-2 ring-primary/20 hover:ring-primary/40 transition-all cursor-pointer">
            <AvatarImage src={user.imageUrl} alt={getUserName()} />
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="font-semibold">{getUserName()}</span>
              <span className="text-xs text-muted-foreground font-normal">
                {user.primaryEmailAddress?.emailAddress}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <UserIcon className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};

export default Navbar;