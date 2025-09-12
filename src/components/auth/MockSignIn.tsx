import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';

interface MockSignInProps {
  onSuccess?: () => void;
}

const MockSignIn: React.FC<MockSignInProps> = ({ onSuccess }) => {
  const { signIn } = useAuth();

  const handleMockSignIn = async () => {
    // Create a mock JWT-like token for testing
    const mockUserData = {
      sub: 'mock-user-123',
      email: 'test@example.com',
      name: 'Test User',
      picture: null,
    };

    // Create a simple mock token (not a real JWT, just for testing)
    const mockToken = `mock.${btoa(JSON.stringify(mockUserData))}.signature`;

    try {
      await signIn(mockToken);
      onSuccess?.();
    } catch (error) {
      console.error('Mock sign-in error:', error);
    }
  };

  return (
    <Button
      onClick={handleMockSignIn}
      variant="secondary"
      className="w-full"
    >
      <User className="mr-2 h-4 w-4" />
      Continue with Test Account
    </Button>
  );
};

export default MockSignIn;
