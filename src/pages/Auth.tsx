import { SignInButton, SignUpButton, SignedIn, SignedOut, useUser } from "@clerk/clerk-react";
import { Activity } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Auth = () => {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect authenticated users to dashboard or saved destination
    if (isSignedIn) {
      const savedRedirect = sessionStorage.getItem('clerk_redirect_url');
      if (savedRedirect) {
        sessionStorage.removeItem('clerk_redirect_url');
        navigate(savedRedirect);
      } else {
        navigate("/dashboard");
      }
    }
  }, [isSignedIn, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary rounded-full">
              <Activity className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">X-Ray Diagnosis AI</h1>
          <p className="text-muted-foreground">
            Advanced chest X-ray analysis powered by AI
          </p>
        </div>

        <SignedOut>
          <Card>
            <CardHeader>
              <CardTitle>Welcome Back</CardTitle>
              <CardDescription>
                Sign in to access your X-ray diagnostic tools
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                <Button className="w-full" size="lg">
                  Sign In
                </Button>
              </SignInButton>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Don't have an account?
                  </span>
                </div>
              </div>
              <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                <Button variant="outline" className="w-full" size="lg">
                  Create Account
                </Button>
              </SignUpButton>
            </CardContent>
          </Card>
        </SignedOut>

        <SignedIn>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Redirecting to dashboard...</p>
              </div>
            </CardContent>
          </Card>
        </SignedIn>
      </div>
    </div>
  );
};

export default Auth;