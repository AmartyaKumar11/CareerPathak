import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Star, 
  IndianRupee, 
  GraduationCap, 
  Wifi, 
  Book, 
  Home, 
  Trophy,
  Building,
  Users,
  ChevronRight,
  Navigation
} from 'lucide-react';
import { useNearbyColleges } from '@/services/dashboardService';
import { College } from '@/services/dashboardDatabase';

interface CollegeCardProps {
  college: College;
  onViewDetails: (college: College) => void;
}

const CollegeCard = ({ college, onViewDetails }: CollegeCardProps) => {
  const getFacilityIcon = (facility: string) => {
    const icons: Record<string, React.ReactNode> = {
      'WiFi Campus': <Wifi className="w-3 h-3" />,
      'Library': <Book className="w-3 h-3" />,
      'Hostels': <Home className="w-3 h-3" />,
      'Sports Complex': <Trophy className="w-3 h-3" />,
      'Sports Facilities': <Trophy className="w-3 h-3" />,
      'Research Labs': <Building className="w-3 h-3" />,
      'Placement Cell': <Users className="w-3 h-3" />,
      'Training & Placement': <Users className="w-3 h-3" />,
      'Innovation Center': <Building className="w-3 h-3" />,
    };
    return icons[facility] || <Building className="w-3 h-3" />;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Government': return 'bg-green-100 text-green-800';
      case 'Private': return 'bg-blue-100 text-blue-800';
      case 'Deemed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const lowestCutoff = Math.min(...college.cutoffs.map(c => c.cutoff));

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
              {college.name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{college.location.city}, {college.location.state}</span>
              {college.distance && (
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                  {college.distance} km
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={`text-xs px-2 py-1 ${getTypeColor(college.type)}`}>
              {college.type}
            </Badge>
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{college.rating}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Cutoff Information */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-blue-700">JEE Main Cutoff 2024</span>
              <span className="text-sm font-semibold text-blue-900">
                Rank {lowestCutoff.toLocaleString()}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {college.cutoffs.slice(0, 2).map((cutoff, index) => (
                <div key={index} className="text-gray-600">
                  <span className="font-medium">{cutoff.stream.split(' ')[0]}:</span> {cutoff.cutoff}
                </div>
              ))}
            </div>
          </div>
          
          {/* Fees */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Annual Fees:</span>
            <div className="flex items-center gap-1 font-medium text-green-700">
              <IndianRupee className="w-3 h-3" />
              <span>{(college.fees.tuition / 100000).toFixed(1)}L</span>
            </div>
          </div>
          
          {/* Facilities */}
          <div>
            <p className="text-xs text-gray-500 mb-2">Key Facilities:</p>
            <div className="flex flex-wrap gap-1">
              {college.facilities.slice(0, 4).map((facility, index) => (
                <div key={index} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs">
                  {getFacilityIcon(facility)}
                  <span className="truncate max-w-20">{facility.split(' ')[0]}</span>
                </div>
              ))}
              {college.facilities.length > 4 && (
                <div className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600">
                  +{college.facilities.length - 4}
                </div>
              )}
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full group-hover:bg-blue-50 group-hover:border-blue-200"
            onClick={() => onViewDetails(college)}
          >
            View Details
            <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const CollegeSkeleton = () => (
  <Card className="h-full">
    <CardHeader>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <Skeleton className="h-4 w-3/4 mb-2" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-3" />
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-4 w-10" />
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <Skeleton className="h-16 w-full rounded-lg" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div>
          <Skeleton className="h-3 w-24 mb-2" />
          <div className="flex gap-1">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
        <Skeleton className="h-8 w-full" />
      </div>
    </CardContent>
  </Card>
);

interface CollegeDetailsModalProps {
  college: College;
  onClose: () => void;
}

const CollegeDetailsModal = ({ college, onClose }: CollegeDetailsModalProps) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{college.name}</h2>
            <div className="flex items-center gap-2 mt-1 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{college.location.address}</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
        </div>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="cutoffs">Cutoffs</TabsTrigger>
            <TabsTrigger value="facilities">Facilities</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Type</label>
                <p className="text-gray-900">{college.type}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Rating</label>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{college.rating}/5.0</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Annual Tuition</label>
                <p className="text-gray-900">₹{college.fees.tuition.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Hostel Fees</label>
                <p className="text-gray-900">₹{college.fees.hostel.toLocaleString()}</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="cutoffs">
            <div className="space-y-3">
              {college.cutoffs.map((cutoff, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{cutoff.stream}</p>
                    <p className="text-sm text-gray-600">{cutoff.category} Category</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">Rank {cutoff.cutoff.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{cutoff.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="facilities">
            <div className="grid grid-cols-2 gap-3">
              {college.facilities.map((facility, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">{facility}</span>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  </div>
);

export const NearbyColleges = () => {
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const { data: colleges, isLoading, error, isError } = useNearbyColleges(50);

  if (isError) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Nearby Government Colleges</h2>
        </div>
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">
            Unable to load colleges. {error instanceof Error ? error.message : 'Please try again later.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Nearby Government Colleges</h2>
          <p className="text-sm text-gray-600 mt-1">
            Top engineering colleges near you with cutoffs and facilities
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Navigation className="w-4 h-4" />
          <span>Within 50km</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }, (_, i) => (
            <CollegeSkeleton key={i} />
          ))
        ) : (
          colleges?.map((college) => (
            <CollegeCard 
              key={college.id} 
              college={college}
              onViewDetails={setSelectedCollege}
            />
          ))
        )}
      </div>
      
      {!isLoading && colleges && colleges.length === 0 && (
        <Alert>
          <AlertDescription>
            No colleges found in your area. Try expanding your search radius.
          </AlertDescription>
        </Alert>
      )}
      
      {selectedCollege && (
        <CollegeDetailsModal 
          college={selectedCollege} 
          onClose={() => setSelectedCollege(null)} 
        />
      )}
    </div>
  );
};
