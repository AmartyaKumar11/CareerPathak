import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileView } from '@/components/profile/ProfileView';
import { useProfileStore } from '@/stores/profileStore';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, RefreshCw, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    currentProfile, 
    loadProfile, 
    isLoading, 
    isOnline,
    syncPendingChanges,
    syncQueue
  } = useProfileStore();

  useEffect(() => {
    if (user && !currentProfile) {
      // Try to load existing profile for the user
      loadProfile(user.id).catch(() => {
        // Profile doesn't exist, that's okay
      });
    }
  }, [user, currentProfile, loadProfile]);

  const handleEdit = () => {
    navigate('/profile/edit');
  };

  const handleCreateProfile = () => {
    navigate('/profile/create');
  };

  const handleSync = async () => {
    try {
      await syncPendingChanges();
      toast({
        title: "Sync Completed",
        description: "Your profile has been synchronized with the server.",
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Unable to sync your profile. Please try again later.",
        variant: "destructive",
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Loading profile...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No profile state
  if (!currentProfile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center space-y-8 mt-16">
            <div>
              <UserPlus className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
              <h1 className="text-3xl font-bold">Welcome to CareerPathak!</h1>
              <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
                Let's create your profile to get personalized career guidance, 
                college recommendations, and connect with opportunities in Jammu & Kashmir.
              </p>
            </div>

            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Create Your Profile</CardTitle>
                <CardDescription>
                  Tell us about yourself to unlock personalized features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={handleCreateProfile} className="w-full" size="lg">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Get Started
                </Button>
                
                <div className="text-xs text-muted-foreground text-center">
                  {isOnline ? (
                    <div className="flex items-center justify-center space-x-1">
                      <Wifi className="h-3 w-3 text-green-500" />
                      <span>Online - Data will be synced automatically</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-1">
                      <WifiOff className="h-3 w-3 text-yellow-500" />
                      <span>Offline - Data will sync when you're back online</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Profile exists - show profile view
  return (
    <div className="min-h-screen bg-background">
      {/* Status bar */}
      <div className="bg-muted/30 border-b">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="font-semibold">My Profile</h2>
              
              {/* Sync status */}
              {syncQueue.length > 0 && (
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-yellow-700">
                    {syncQueue.length} change{syncQueue.length > 1 ? 's' : ''} pending sync
                  </span>
                  {isOnline && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSync}
                      disabled={isLoading}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Sync Now
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Connection status */}
            <div className="flex items-center space-x-2 text-sm">
              {isOnline ? (
                <>
                  <Wifi className="h-4 w-4 text-green-500" />
                  <span className="text-green-700">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-yellow-500" />
                  <span className="text-yellow-700">Offline</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <ProfileView
        profile={currentProfile}
        onEdit={handleEdit}
        isEditable={true}
      />
    </div>
  );
};
