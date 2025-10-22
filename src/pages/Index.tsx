import { SignInButton, SignUpButton, useUser } from "@clerk/clerk-react";
import { Activity, ChartBar, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate("/dashboard");
    }
  }, [isLoaded, isSignedIn, navigate]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isSignedIn) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary rounded-full">
              <Activity className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4">X-Ray Diagnosis AI</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Advanced chest X-ray analysis powered by artificial intelligence. 
            Get accurate diagnoses and comprehensive reports in minutes.
          </p>
          <div className="flex gap-4 justify-center">
            <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
              <Button size="lg" className="text-lg px-8">
                Get Started
              </Button>
            </SignUpButton>
            <SignInButton mode="modal" forceRedirectUrl="/dashboard">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Sign In
              </Button>
            </SignInButton>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <div className="p-2 bg-primary/10 rounded-lg w-fit mb-2">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>AI-Powered Analysis</CardTitle>
              <CardDescription>
                State-of-the-art machine learning models analyze chest X-rays with medical-grade accuracy
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="p-2 bg-primary/10 rounded-lg w-fit mb-2">
                <ChartBar className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Detailed Reports</CardTitle>
              <CardDescription>
                Comprehensive diagnostic reports with confidence scores and visual annotations
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="p-2 bg-primary/10 rounded-lg w-fit mb-2">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Secure & Private</CardTitle>
              <CardDescription>
                HIPAA-compliant data handling with encrypted storage and secure authentication
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* How it works */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold text-lg mb-2">Upload X-Ray</h3>
              <p className="text-muted-foreground">
                Securely upload chest X-ray images in standard medical formats
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold text-lg mb-2">AI Analysis</h3>
              <p className="text-muted-foreground">
                Our AI analyzes the image and identifies potential conditions
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold text-lg mb-2">Get Results</h3>
              <p className="text-muted-foreground">
                Receive detailed diagnostic reports with actionable insights
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
