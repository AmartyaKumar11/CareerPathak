import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Mail } from 'lucide-react';

const Auth = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      // Create a mock JWT token for now (in production, this would be handled by Google OAuth)
      const mockToken = 'mock.' + btoa(JSON.stringify({
        sub: 'user-' + Date.now(),
        email: 'student@jk.edu.in',
        name: 'J&K Student',
        picture: '',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600
      }));
      
      await signIn(mockToken);
      navigate('/dashboard');
    } catch (error) {
      console.error('Sign in failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
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
            <Button 
              onClick={handleSignIn}
              disabled={loading}
              className="w-full h-12"
              size="lg"
            >
              <Mail className="h-4 w-4 mr-2" />
              {loading ? 'Signing in...' : 'Continue with Email'}
            </Button>
            
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
  );
};

export default Auth;
