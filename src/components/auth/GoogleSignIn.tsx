import { useEffect } from 'react';
import { useAuth } from '@/contexts/SimpleAuthContext';

declare global {
  interface Window {
    google: any;
    handleGoogleCallback: (response: any) => void;
  }
}

interface GoogleSignInProps {
  onSuccess?: () => void;
}

const GoogleSignIn: React.FC<GoogleSignInProps> = ({ onSuccess }) => {
  const { signIn } = useAuth();

  useEffect(() => {
    // Create a global callback function
    window.handleGoogleCallback = async (response: any) => {
      try {
        console.log('Google sign-in callback triggered');
        await signIn(response.credential);
        console.log('Sign-in successful, calling onSuccess');
        onSuccess?.();
      } catch (error) {
        console.error('Google sign-in error:', error);
      }
    };

    // Load Google Identity Services script
    if (typeof window !== 'undefined' && !window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      
      script.onload = () => {
        initializeGoogleSignIn();
      };
      
      script.onerror = () => {
        console.error('Failed to load Google Identity Services script');
      };
    } else if (window.google) {
      initializeGoogleSignIn();
    }

    return () => {
      // Cleanup
      if (window.handleGoogleCallback) {
        delete window.handleGoogleCallback;
      }
    };
  }, []);

  const initializeGoogleSignIn = () => {
    if (window.google && window.google.accounts) {
      try {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: window.handleGoogleCallback,
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: false, // Disable FedCM to avoid CORS issues
        });

        // Render the sign-in button
        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-div'),
          {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left'
          }
        );
      } catch (error) {
        console.error('Error initializing Google Sign-In:', error);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Google's built-in sign-in button */}
      <div id="google-signin-div" className="w-full"></div>
    </div>
  );
};

export default GoogleSignIn;
