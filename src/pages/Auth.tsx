
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap } from 'lucide-react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const Auth = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (credentialResponse.credential) {
      await signIn(credentialResponse.credential);
      navigate('/dashboard');
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-3 bg-primary/10 rounded-full">
                  <GraduationCap className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl">Welcome to CareerPathak</CardTitle>
                <p className="text-muted-foreground mt-2">
                  Your personalized career guidance platform for J&K students
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => alert('Google Sign In Failed')}
                width="100%"
              />
              <div className="text-center space-y-2">
                <p className="text-xs text-muted-foreground">
                  By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </CardContent>
          </Card>
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Empowering students across Jammu & Kashmir with personalized career guidance
            </p>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Auth;
