import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Activity, Mail } from "lucide-react";
import { z } from "zod";

const emailSchema = z
  .string()
  .email("Please enter a valid email address")
  .min(1, "Email is required")
  .refine(
    (email) => {
      // Block common temporary email domains
      const tempDomains = [
        'tempmail.com', 'throwaway.email', '10minutemail.com', 
        'guerrillamail.com', 'mailinator.com', 'maildrop.cc'
      ];
      const domain = email.split('@')[1]?.toLowerCase();
      return !tempDomains.includes(domain);
    },
    { message: "Temporary email addresses are not allowed" }
  );

const Auth = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email format
    const emailValidation = emailSchema.safeParse(email);
    if (!emailValidation.success) {
      toast({
        title: "Invalid Email",
        description: emailValidation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        shouldCreateUser: true,
      },
    });

    setLoading(false);

    if (error) {
      // Check for network/connectivity errors
      const isNetworkError = error.message?.toLowerCase().includes('fetch') || 
                            error.message?.toLowerCase().includes('network') ||
                            error.message?.toLowerCase().includes('timeout');
      
      toast({
        title: isNetworkError ? "Connection Error" : "Error",
        description: isNetworkError 
          ? "Unable to connect to the authentication service. Please check your internet connection and try again in a few moments."
          : error.message,
        variant: "destructive",
        duration: 8000,
      });
    } else {
      // Store email in sessionStorage for verification page
      sessionStorage.setItem('otp_email', email.trim().toLowerCase());
      
      toast({
        title: "OTP Sent!",
        description: "A 6-digit code has been sent to your email. Please check your inbox (and spam folder).",
        duration: 8000,
      });
      
      // Redirect to verification page
      navigate("/verify");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary rounded-full">
              <Activity className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">X-Ray Diagnosis AI</CardTitle>
          <CardDescription>
            Enter your email to receive a secure one-time password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                We'll send a 6-digit OTP to this email
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending OTP..." : "Send OTP"}
            </Button>
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                Check your spam folder if you don't receive the OTP within 2 minutes
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;