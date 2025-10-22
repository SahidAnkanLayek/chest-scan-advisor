import { useState } from "react";
import { useUser, useClerk } from "@clerk/clerk-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const EmailVerificationNotice = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);

  if (!user || user.primaryEmailAddress?.verification?.status === "verified") {
    return null;
  }

  const handleResendCode = async () => {
    try {
      setIsResending(true);
      await user.primaryEmailAddress?.prepareVerification({
        strategy: "email_code",
      });
      toast({
        title: "Verification code sent",
        description: "Check your email for the verification code.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend verification code",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="p-4 border-b bg-yellow-50 dark:bg-yellow-950/20">
      <Alert className="border-yellow-400 dark:border-yellow-600">
        <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
        <AlertDescription className="flex items-center justify-between">
          <div className="flex-1">
            <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
              Email verification required
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Please verify your email address ({user.primaryEmailAddress?.emailAddress}) to access all features.
              Check your inbox for the verification code.
            </p>
          </div>
          <div className="flex gap-2 ml-4">
            <Button
              onClick={handleResendCode}
              disabled={isResending}
              size="sm"
              variant="outline"
              className="border-yellow-600 text-yellow-700 hover:bg-yellow-100 dark:border-yellow-500 dark:text-yellow-300 dark:hover:bg-yellow-950/40"
            >
              <Mail className="h-4 w-4 mr-2" />
              {isResending ? "Sending..." : "Resend code"}
            </Button>
            <Button
              onClick={handleSignOut}
              size="sm"
              variant="ghost"
              className="text-yellow-700 hover:bg-yellow-100 dark:text-yellow-300 dark:hover:bg-yellow-950/40"
            >
              Sign out
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default EmailVerificationNotice;
