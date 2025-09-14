import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, BookOpen, Building2, DollarSign, Heart, Eye, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const API_BASE_URL = 'http://localhost:3001/api';

interface Recommendation {
  id: string;
  type: 'career' | 'college' | 'scholarship';
  title: string;
  description: string;
  category: string;
  details: any;
  score: number;
  reasoning: string;
  viewed: boolean;
  liked: boolean;
  applied: boolean;
}

interface UserProfile {
  currentClass?: string;
  subjects?: string[];
  academicPerformance?: string;
  careerInterests?: string[];
  skillLevel?: string;
  preferredLocation?: string;
  workStyle?: string;
  personalityType?: string;
}

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    currentClass: '',
    subjects: [] as string[],
    academicPerformance: '',
    careerInterests: [] as string[],
    skillLevel: '',
    preferredLocation: '',
    workStyle: '',
    personalityType: ''
  });

  useEffect(() => {
    fetchRecommendations();
    fetchUserProfile();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/recommendations`);
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load recommendations',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`);
      if (response.ok) {
        const data = await response.json();
        if (data.profile) {
          setUserProfile(data.profile);
          setFormData({
            currentClass: data.profile.currentClass || '',
            subjects: data.profile.subjects || [],
            academicPerformance: data.profile.academicPerformance || '',
            careerInterests: data.profile.careerInterests || [],
            skillLevel: data.profile.skillLevel || '',
            preferredLocation: data.profile.preferredLocation || '',
            workStyle: data.profile.workStyle || '',
            personalityType: data.profile.personalityType || ''
          });
        } else {
          setShowProfileForm(true);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const profile = await response.json();
        setUserProfile(profile);
        setShowProfileForm(false);
        toast({
          title: 'Profile Updated',
          description: 'Your profile has been saved successfully!'
        });
        // Refresh recommendations
        fetchRecommendations();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive'
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleAction = async (recommendationId: string, action: 'viewed' | 'liked' | 'applied') => {
    try {
      const response = await fetch(`${API_BASE_URL}/recommendations/${recommendationId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      if (response.ok) {
        // Update local state
        setRecommendations(prev =>
          prev.map(rec =>
            rec.id === recommendationId ? { ...rec, [action]: true } : rec
          )
        );
        
        toast({
          title: 'Action Recorded',
          description: `Recommendation marked as ${action}!`
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to record action',
        variant: 'destructive'
      });
    }
  };

  const handleSubjectChange = (subject: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      subjects: checked
        ? [...prev.subjects, subject]
        : prev.subjects.filter(s => s !== subject)
    }));
  };

  const handleInterestChange = (interest: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      careerInterests: checked
        ? [...prev.careerInterests, interest]
        : prev.careerInterests.filter(i => i !== interest)
    }));
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'career': return <BookOpen className="h-5 w-5" />;
      case 'college': return <Building2 className="h-5 w-5" />;
      case 'scholarship': return <DollarSign className="h-5 w-5" />;
      default: return <BookOpen className="h-5 w-5" />;
    }
  };

  if (showProfileForm) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>
              Help us provide personalized recommendations by sharing some information about yourself.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={updateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currentClass">Current Class/Level</Label>
                  <Input
                    id="currentClass"
                    value={formData.currentClass}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentClass: e.target.value }))}
                    placeholder="e.g., 12th Grade, 1st Year College"
                  />
                </div>
                
                <div>
                  <Label htmlFor="academicPerformance">Academic Performance</Label>
                  <Select
                    value={formData.academicPerformance}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, academicPerformance: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your performance level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent (90%+)</SelectItem>
                      <SelectItem value="good">Good (75-90%)</SelectItem>
                      <SelectItem value="average">Average (60-75%)</SelectItem>
                      <SelectItem value="below_average">Below Average (&lt;60%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Subjects of Interest</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English', 'History', 'Economics', 'Arts', 'Commerce'].map((subject) => (
                    <div key={subject} className="flex items-center space-x-2">
                      <Checkbox
                        id={subject}
                        checked={formData.subjects.includes(subject)}
                        onCheckedChange={(checked) => handleSubjectChange(subject, checked as boolean)}
                      />
                      <Label htmlFor={subject} className="text-sm">{subject}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Career Interests</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {['Technology', 'Healthcare', 'Engineering', 'Business', 'Arts', 'Science', 'Education', 'Law', 'Finance', 'Media'].map((interest) => (
                    <div key={interest} className="flex items-center space-x-2">
                      <Checkbox
                        id={interest}
                        checked={formData.careerInterests.includes(interest)}
                        onCheckedChange={(checked) => handleInterestChange(interest, checked as boolean)}
                      />
                      <Label htmlFor={interest} className="text-sm">{interest}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="preferredLocation">Preferred Location</Label>
                  <Input
                    id="preferredLocation"
                    value={formData.preferredLocation}
                    onChange={(e) => setFormData(prev => ({ ...prev, preferredLocation: e.target.value }))}
                    placeholder="e.g., Mumbai, Delhi, Bangalore"
                  />
                </div>
                
                <div>
                  <Label htmlFor="workStyle">Work Style</Label>
                  <Select
                    value={formData.workStyle}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, workStyle: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select work style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual Work</SelectItem>
                      <SelectItem value="team">Team Work</SelectItem>
                      <SelectItem value="hybrid">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" disabled={profileLoading} className="w-full">
                {profileLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving Profile...
                  </>
                ) : (
                  'Save Profile & Get Recommendations'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Personalized Recommendations</h1>
          <p className="text-gray-600 mt-2">
            Discover opportunities tailored just for you based on your interests and goals.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowProfileForm(true)}
        >
          Update Profile
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading recommendations...</span>
        </div>
      ) : (
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Recommendations</TabsTrigger>
            <TabsTrigger value="career">Careers</TabsTrigger>
            <TabsTrigger value="college">Colleges</TabsTrigger>
            <TabsTrigger value="scholarship">Scholarships</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recommendations.map((rec) => (
                <RecommendationCard
                  key={rec.id}
                  recommendation={rec}
                  onAction={handleAction}
                />
              ))}
            </div>
          </TabsContent>

          {['career', 'college', 'scholarship'].map((type) => (
            <TabsContent key={type} value={type}>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {recommendations
                  .filter(rec => rec.type === type)
                  .map((rec) => (
                    <RecommendationCard
                      key={rec.id}
                      recommendation={rec}
                      onAction={handleAction}
                    />
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {!loading && recommendations.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No recommendations yet</h3>
          <p className="text-gray-600 mb-4">Complete your profile to get personalized recommendations.</p>
          <Button onClick={() => setShowProfileForm(true)}>
            Complete Profile
          </Button>
        </div>
      )}
    </div>
  );
}

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

function RecommendationCard({ 
  recommendation, 
  onAction 
}: { 
  recommendation: Recommendation; 
  onAction: (id: string, action: 'viewed' | 'liked' | 'applied') => void;
}) {
  const handleView = () => {
    if (!recommendation.viewed) {
      onAction(recommendation.id, 'viewed');
    }
  };

  const handleLike = () => {
    onAction(recommendation.id, 'liked');
  };

  const handleApply = () => {
    onAction(recommendation.id, 'applied');
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleView}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {React.createElement(
              recommendation.type === 'career' ? BookOpen :
              recommendation.type === 'college' ? Building2 : DollarSign,
              { className: "h-5 w-5 text-blue-500" }
            )}
            <Badge variant="secondary" className="capitalize">
              {recommendation.type}
            </Badge>
          </div>
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${getScoreColor(recommendation.score)}`} />
            <span className="text-xs text-gray-500">{Math.round(recommendation.score)}% match</span>
          </div>
        </div>
        
        <CardTitle className="text-lg">{recommendation.title}</CardTitle>
        <CardDescription>{recommendation.description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">{recommendation.reasoning}</p>
          
          {recommendation.details && (
            <div className="space-y-2">
              {recommendation.type === 'career' && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Salary:</span>
                    <span>{recommendation.details.averageSalary}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Education:</span>
                    <span className="text-right">{recommendation.details.education}</span>
                  </div>
                </>
              )}
              
              {recommendation.type === 'college' && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Location:</span>
                    <span>{recommendation.details.location}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Type:</span>
                    <span className="capitalize">{recommendation.details.type}</span>
                  </div>
                </>
              )}
              
              {recommendation.type === 'scholarship' && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Amount:</span>
                    <span>{recommendation.details.amount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Provider:</span>
                    <span>{recommendation.details.provider}</span>
                  </div>
                </>
              )}
            </div>
          )}
          
          <div className="flex space-x-2 pt-2">
            <Button
              variant={recommendation.liked ? "default" : "outline"}
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleLike();
              }}
              className="flex-1"
            >
              <Heart className={`h-4 w-4 mr-1 ${recommendation.liked ? 'fill-current' : ''}`} />
              {recommendation.liked ? 'Liked' : 'Like'}
            </Button>
            
            <Button
              variant={recommendation.applied ? "default" : "outline"}
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleApply();
              }}
              className="flex-1"
            >
              <Send className="h-4 w-4 mr-1" />
              {recommendation.applied ? 'Applied' : 'Apply'}
            </Button>
          </div>
          
          {recommendation.viewed && (
            <div className="flex items-center text-xs text-gray-500">
              <Eye className="h-3 w-3 mr-1" />
              Viewed
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
