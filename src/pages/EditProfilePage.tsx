import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { useProfileStore } from '@/stores/profileStore';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Wifi, WifiOff, ArrowLeft } from 'lucide-react';

export const EditProfilePage = () => {
  const navigate = useNavigate();
  const { currentProfile, updateProfile, isLoading, isOnline } = useProfileStore();
  const [isEditing, setIsEditing] = useState(false);

  if (!currentProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>No Profile Found</CardTitle>
            <CardDescription>
              You need to create a profile first before editing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/profile/create')} className="w-full">
              Create Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (data: any) => {
    try {
      await updateProfile(data);
      
      toast({
        title: "Profile Updated Successfully!",
        description: isOnline 
          ? "Your changes have been saved and will be synced with the server."
          : "Your changes have been saved offline. They will sync when you're back online.",
      });

      setIsEditing(false);
      navigate('/profile');
    } catch (error) {
      toast({
        title: "Failed to Update Profile",
        description: "Please check your information and try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    navigate('/profile');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Status indicator */}
      <div className="bg-muted/30 border-b">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/profile')}
                className="mr-2"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Edit className="h-5 w-5" />
              <span className="font-medium">Edit Profile</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              {isOnline ? (
                <>
                  <Wifi className="h-4 w-4 text-green-500" />
                  <span className="text-green-700">Online - Changes will be synced</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-yellow-500" />
                  <span className="text-yellow-700">Offline - Changes will be saved locally</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <ProfileForm
        mode="edit"
        initialData={currentProfile}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </div>
  );
};
