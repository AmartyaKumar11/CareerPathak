import { useAuth } from '@/contexts/SimpleAuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LogOut, User } from 'lucide-react';

export const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  console.log('Dashboard - User:', user);
  console.log('Dashboard - Location:', location.pathname);
  console.log('Dashboard - Rendering at:', new Date().toLocaleString());

  if (!user) {
    console.log('Dashboard - No user found');
    return <div>Loading or no user...</div>;
  }

  const handleSignOut = () => {
    console.log('Signing out...');
    signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-4">
          <h2 className="text-green-800 font-bold">✅ Dashboard Loaded Successfully!</h2>
          <p className="text-green-700 text-sm mt-1">
            User: {user.name} ({user.email}) | Path: {location.pathname} | Time: {new Date().toLocaleString()}
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">
                CareerPathak Dashboard
              </h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {user?.picture ? (
                    <img 
                      src={user.picture} 
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <User className="h-8 w-8 text-gray-400" />
                  )}
                  <span className="text-sm font-medium">{user?.name}</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <p className="text-lg text-gray-700">
                Welcome to your personalized career guidance dashboard!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <h3 className="font-semibold">Stream Recommendations</h3>
                    <p className="text-sm text-gray-600">Coming soon...</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <h3 className="font-semibold">Nearby Colleges</h3>
                    <p className="text-sm text-gray-600">Coming soon...</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <h3 className="font-semibold">Career Paths</h3>
                    <p className="text-sm text-gray-600">Coming soon...</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
