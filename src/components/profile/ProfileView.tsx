import { UserProfile } from '@/stores/profileStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap, 
  School, 
  Target, 
  Heart,
  Settings,
  Wifi,
  WifiOff,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useOnlineStatus } from '@/stores/profileStore';

interface ProfileViewProps {
  profile: UserProfile;
  onEdit: () => void;
  isEditable?: boolean;
}

const LANGUAGE_NAMES = {
  en: 'English',
  hi: 'हिंदी (Hindi)',
  ur: 'اردو (Urdu)',
  ks: 'کٲشُر (Kashmiri)',
  dg: 'डोगरी (Dogri)',
};

const getSyncStatusIcon = (syncStatus: UserProfile['metadata']['syncStatus']) => {
  switch (syncStatus) {
    case 'synced':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case 'offline':
      return <WifiOff className="h-4 w-4 text-gray-500" />;
    case 'conflict':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Loader2 className="h-4 w-4 text-gray-500 animate-spin" />;
  }
};

const getSyncStatusText = (syncStatus: UserProfile['metadata']['syncStatus']) => {
  switch (syncStatus) {
    case 'synced':
      return 'Synced';
    case 'pending':
      return 'Syncing...';
    case 'offline':
      return 'Offline';
    case 'conflict':
      return 'Conflict';
    default:
      return 'Unknown';
  }
};

export const ProfileView = ({
  profile,
  onEdit,
  isEditable = true,
}) => {
  const isOnline = useOnlineStatus();
  const { personalDetails, academicBackground, preferences, metadata } = profile;

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header with Avatar and Basic Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-2xl">
                  {getInitials(personalDetails.firstName, personalDetails.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h1 className="text-3xl font-bold">
                  {personalDetails.firstName} {personalDetails.lastName}
                </h1>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {personalDetails.email}
                </p>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {personalDetails.phone}
                </p>
                <p className="text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {personalDetails.address.city}, {personalDetails.address.state}
                </p>
              </div>
            </div>
            
            {/* Sync Status and Edit Button */}
            <div className="flex flex-col items-end space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                {isOnline ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-gray-500" />
                )}
                <span className="text-muted-foreground">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
                <Separator orientation="vertical" className="h-4" />
                {getSyncStatusIcon(metadata.syncStatus)}
                <span className="text-muted-foreground">
                  {getSyncStatusText(metadata.syncStatus)}
                </span>
              </div>
              
              {isEditable && (
                <Button onClick={onEdit} variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Date of Birth</p>
                <p className="font-medium">{formatDate(personalDetails.dateOfBirth)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Age</p>
                <p className="font-medium">
                  {Math.floor((Date.now() - new Date(personalDetails.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <p className="text-muted-foreground text-sm">Address</p>
              <p className="font-medium">
                {personalDetails.address.street}<br />
                {personalDetails.address.city}, {personalDetails.address.state}<br />
                {personalDetails.address.pincode}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Academic Background */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Academic Background
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Current Class</p>
                <p className="font-medium">{academicBackground.currentClass}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Board</p>
                <p className="font-medium">{academicBackground.board}</p>
              </div>
            </div>

            <div>
              <p className="text-muted-foreground text-sm flex items-center gap-2">
                <School className="h-4 w-4" />
                School/College
              </p>
              <p className="font-medium">{academicBackground.school}</p>
            </div>

            <div>
              <p className="text-muted-foreground text-sm">Current Performance</p>
              <p className="font-medium">{academicBackground.percentage}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subjects */}
      <Card>
        <CardHeader>
          <CardTitle>Subjects</CardTitle>
          <CardDescription>Currently studying subjects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {academicBackground.subjects.map((subject) => (
              <Badge key={subject} variant="secondary">
                {subject}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Career Aspirations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Career Aspirations
          </CardTitle>
          <CardDescription>Fields you're considering for your career</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {academicBackground.aspirations.map((aspiration) => (
              <Badge key={aspiration} variant="default">
                {aspiration}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fields of Interest */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Fields of Interest
          </CardTitle>
          <CardDescription>Industries and sectors that interest you</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {academicBackground.interestedFields.map((field) => (
              <Badge key={field} variant="outline">
                {field}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Your personalization settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Language</p>
              <p className="font-medium">{LANGUAGE_NAMES[preferences.language]}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Theme</p>
              <p className="font-medium capitalize">{preferences.theme}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Notifications</p>
              <p className="font-medium">{preferences.notifications ? 'Enabled' : 'Disabled'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Profile creation and sync details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Created</p>
              <p className="font-medium">{formatDate(metadata.createdAt)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Last Updated</p>
              <p className="font-medium">{formatDate(metadata.updatedAt)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Version</p>
              <p className="font-medium">v{metadata.version}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
