import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  Calendar, 
  TrendingUp,
  LogOut,
  User,
  Settings
} from 'lucide-react';

const CareersPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  const careerStreams = [
    {
      title: "Engineering & Technology",
      description: "Build the future with innovative technology solutions",
      careers: ["Software Engineer", "Civil Engineer", "Mechanical Engineer", "Electronics Engineer"],
      averageSalary: "₹8-25 LPA",
    },
    {
      title: "Science & Research",
      description: "Explore and advance human knowledge through research",
      careers: ["Medical Doctor", "Research Scientist", "Pharmacist", "Biotechnologist"],
      averageSalary: "₹10-40 LPA",
    },
    {
      title: "Commerce & Business",
      description: "Drive economic growth through business and finance",
      careers: ["Chartered Accountant", "Business Analyst", "Investment Banker", "Digital Marketing Manager"],
      averageSalary: "₹8-50 LPA",
    },
    {
      title: "Arts & Humanities",
      description: "Shape society through education, culture, and communication",
      careers: ["Civil Services Officer", "Teacher/Professor", "Journalist", "Psychologist/Counselor"],
      averageSalary: "₹4-25 LPA",
    },
  ];

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">CareerPathak</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {user.picture ? (
                <img 
                  src={user.picture} 
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <User className="h-8 w-8 text-muted-foreground" />
              )}
              <span className="text-sm font-medium">{user.name}</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
              <Settings className="mr-2 h-4 w-4" />
              Profile
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome, {user.name?.split(' ')[0]}!</h1>
          <p className="text-muted-foreground text-lg">
            Explore career opportunities tailored for Jammu & Kashmir students
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold">Take Quiz</h3>
              <p className="text-sm text-muted-foreground">Find your ideal career</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold">Explore Colleges</h3>
              <p className="text-sm text-muted-foreground">Find the right college</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold">Alumni Network</h3>
              <p className="text-sm text-muted-foreground">Connect with graduates</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold">Timeline</h3>
              <p className="text-sm text-muted-foreground">Important dates</p>
            </CardContent>
          </Card>
        </div>

        {/* Career Streams */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Career Streams</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {careerStreams.map((stream, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {stream.title}
                    <Badge variant="secondary">{stream.averageSalary}</Badge>
                  </CardTitle>
                  <CardDescription>{stream.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Popular Careers:</h4>
                    <div className="flex flex-wrap gap-2">
                      {stream.careers.map((career, careerIndex) => (
                        <Badge key={careerIndex} variant="outline" className="text-xs">
                          {career}
                        </Badge>
                      ))}
                    </div>
                    <Button className="w-full mt-4" variant="outline">
                      Explore {stream.title}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Getting Started</h2>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div>
                    <h3 className="font-medium">Complete Your Profile</h3>
                    <p className="text-sm text-muted-foreground">Add your academic details and interests</p>
                  </div>
                  <Button size="sm" className="ml-auto">Start</Button>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <h3 className="font-medium">Take Career Assessment</h3>
                    <p className="text-sm text-muted-foreground">Discover your ideal career path</p>
                  </div>
                  <Button size="sm" variant="outline" className="ml-auto">Take Quiz</Button>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium">Explore Colleges</h3>
                    <p className="text-sm text-muted-foreground">Find colleges that match your goals</p>
                  </div>
                  <Button size="sm" variant="outline" className="ml-auto">Browse</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CareersPage;
