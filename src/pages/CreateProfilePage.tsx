import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { useProfileStore } from '@/stores/profileStore';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Wifi, WifiOff } from 'lucide-react';

export const CreateProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { createProfile, isLoading, isOnline } = useProfileStore();

  const handleSubmit = async (data: any) => {
    try {
      await createProfile(data);
      
      toast({
        title: "Profile Created Successfully!",
        description: isOnline 
          ? "Your profile has been created and will be synced with the server."
          : "Your profile has been created offline. It will sync when you're back online.",
      });

      // Navigate to profile view or dashboard
      navigate('/profile');
    } catch (error) {
      toast({
        title: "Failed to Create Profile",
        description: "Please check your information and try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Status indicator */}
      <div className="bg-muted/30 border-b">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <UserPlus className="h-5 w-5" />
              <span className="font-medium">Create New Profile</span>
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
        mode="create"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </div>
  );
};
