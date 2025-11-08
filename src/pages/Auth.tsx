import { SignIn, SignUp } from "@clerk/clerk-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity } from "lucide-react";

const Auth = () => {
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
            Advanced chest X-ray analysis powered by AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="flex justify-center">
              <SignIn 
                routing="path" 
                path="/auth"
                signUpUrl="/auth"
                afterSignInUrl="/dashboard"
              />
            </TabsContent>
            
            <TabsContent value="signup" className="flex justify-center">
              <SignUp 
                routing="path" 
                path="/auth"
                signInUrl="/auth"
                afterSignUpUrl="/dashboard"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;