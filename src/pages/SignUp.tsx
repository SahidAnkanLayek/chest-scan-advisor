import { SignUp, useClerk, useUser } from "@clerk/clerk-react";
import { Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SignUpPage = () => {
  const { loaded } = useClerk();
  const { isSignedIn } = useUser();
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (loaded) {
      setIsReady(true);
    }
  }, [loaded]);

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (isSignedIn && loaded) {
      navigate("/dashboard");
    }
  }, [isSignedIn, loaded, navigate]);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading authentication...</p>
        </div>
      </div>
    );
  }

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
        <SignUp 
          signInUrl="/auth"
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-lg"
            }
          }}
        />
      </div>
    </div>
  );
};

export default SignUpPage;
