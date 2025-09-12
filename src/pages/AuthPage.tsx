import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import GoogleSignIn from '@/components/auth/GoogleSignIn';
import { GraduationCap } from 'lucide-react';

const AuthPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // If user is already authenticated, redirect to careers page
  React.useEffect(() => {
    if (user) {
      navigate('/careers');
    }
  }, [user, navigate]);

  const handleSignInSuccess = () => {
    navigate('/careers');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <GraduationCap className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">CareerPathak</h1>
          <p className="text-muted-foreground text-sm">
            Your career guidance platform for J&K students
          </p>
        </div>

        {/* Sign In Card */}
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Sign in to access personalized career guidance and explore opportunities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <GoogleSignIn onSuccess={handleSignInSuccess} />
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Why sign in?
                </span>
              </div>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span>Get personalized career recommendations</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span>Save your quiz results and preferences</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span>Access exclusive resources and timelines</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span>Connect with alumni and mentors</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
