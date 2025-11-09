import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { Activity, ArrowLeft, RefreshCw } from "lucide-react";

const Verify = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [email, setEmail] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const navigate = useNavigate();
  const { toast } = useToast();
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Get email from sessionStorage
    const storedEmail = sessionStorage.getItem('otp_email');
    if (!storedEmail) {
      toast({
        title: "Session Expired",
        description: "Please request a new OTP",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    setEmail(storedEmail);

    // Check if user is already authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    // Start countdown timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          toast({
            title: "OTP Expired",
            description: "Please request a new OTP",
            variant: "destructive",
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [navigate, toast]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerifyOTP = async (otpCode: string) => {
    if (otpCode.length !== 6) return;

    setLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otpCode,
      type: 'email',
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Verification Failed",
        description: error.message === "Token has expired or is invalid" 
          ? "OTP is incorrect or has expired. Please try again or request a new one."
          : error.message,
        variant: "destructive",
      });
      setOtp("");
    } else {
      sessionStorage.removeItem('otp_email');
      toast({
        title: "Success!",
        description: "You have been successfully authenticated",
      });
      navigate("/dashboard");
    }
  };

  const handleResendOTP = async () => {
    setResending(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });

    setResending(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      // Reset timer
      setTimeLeft(300);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      toast({
        title: "OTP Resent!",
        description: "A new 6-digit code has been sent to your email",
      });
      setOtp("");
    }
  };

  const handleBackToLogin = () => {
    sessionStorage.removeItem('otp_email');
    navigate("/auth");
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
          <CardTitle className="text-3xl font-bold">Verify Your Email</CardTitle>
          <CardDescription>
            Enter the 6-digit code sent to
            <br />
            <span className="font-medium text-foreground">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value) => {
                setOtp(value);
                if (value.length === 6) {
                  handleVerifyOTP(value);
                }
              }}
              disabled={loading || timeLeft === 0}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {timeLeft > 0 ? (
                  <>
                    Code expires in{" "}
                    <span className="font-semibold text-foreground">
                      {formatTime(timeLeft)}
                    </span>
                  </>
                ) : (
                  <span className="text-destructive font-semibold">OTP Expired</span>
                )}
              </p>
            </div>

            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span>Verifying...</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleResendOTP}
              disabled={resending || timeLeft > 240} // Can resend after 1 minute
            >
              {resending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Resending...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {timeLeft > 240 ? `Resend in ${formatTime(300 - timeLeft)}` : "Resend OTP"}
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={handleBackToLogin}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
          </div>

          <div className="p-3 bg-muted/50 rounded-md">
            <p className="text-xs text-muted-foreground text-center">
              Didn't receive the code? Check your spam folder or click resend
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Verify;
