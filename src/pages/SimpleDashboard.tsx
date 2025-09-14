import { useAuth } from '@/contexts/SimpleAuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

const SimpleDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  // Redirect to auth if not authenticated
  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">CareerPathak Dashboard</h1>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <span className="font-medium">{user.name}</span>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Welcome Back!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Hello {user.name}, ready to explore your career options?
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Profile Complete:</span>
                  <span className="font-semibold text-primary">85%</span>
                </div>
                <div className="flex justify-between">
                  <span>Recommendations:</span>
                  <span className="font-semibold text-primary">12</span>
                </div>
                <div className="flex justify-between">
                  <span>Nearby Colleges:</span>
                  <span className="font-semibold text-primary">8</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Complete aptitude assessment</li>
                <li>• Review college recommendations</li>
                <li>• Update career preferences</li>
                <li>• Schedule counseling session</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Stream Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <h4 className="font-medium">Computer Science Engineering</h4>
                    <p className="text-sm text-muted-foreground">Based on your aptitude</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary">92%</div>
                    <div className="text-xs text-muted-foreground">Match</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <h4 className="font-medium">Electronics Engineering</h4>
                    <p className="text-sm text-muted-foreground">Good technical fit</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary">87%</div>
                    <div className="text-xs text-muted-foreground">Match</div>
                  </div>
                </div>
                
                <Button className="w-full">View All Recommendations</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Nearby Government Colleges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <h4 className="font-medium">NIT Srinagar</h4>
                    <p className="text-sm text-muted-foreground">2.5 km away</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary">95k</div>
                    <div className="text-xs text-muted-foreground">Cutoff</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <h4 className="font-medium">IIIT Jammu</h4>
                    <p className="text-sm text-muted-foreground">15 km away</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary">88k</div>
                    <div className="text-xs text-muted-foreground">Cutoff</div>
                  </div>
                </div>
                
                <Button className="w-full">View College Map</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Debug Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>✅ Authentication: Working</p>
              <p>✅ Dashboard: Loaded successfully</p>
              <p>✅ User: {user.email}</p>
              <p>✅ Timestamp: {new Date().toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SimpleDashboard;
