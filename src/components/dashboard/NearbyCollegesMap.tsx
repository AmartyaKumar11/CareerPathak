import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  MapPin, 
  Navigation, 
  Star, 
  Users, 
  GraduationCap,
  Filter,
  Search,
  Phone,
  Globe,
  AlertTriangle,
  ExternalLink,
  DollarSign
} from 'lucide-react';
import { 
  CollegeInfo, 
  dashboardDB, 
  generateMockColleges 
} from '@/services/dashboardDataService';
import { useProfileStore } from '@/stores/profileStore';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
});

// Custom map component to update center
const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

interface CollegeCardProps {
  college: CollegeInfo;
  isCompact?: boolean;
  onViewOnMap?: () => void;
}

const formatDistance = (distance: number): string => {
  if (distance < 1) return `${(distance * 1000).toFixed(0)}m`;
  return `${distance.toFixed(1)}km`;
};

const CollegeCard = ({ college, isCompact = false, onViewOnMap }: CollegeCardProps) => {
  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600 bg-green-50';
    if (rating >= 4.0) return 'text-blue-600 bg-blue-50';
    if (rating >= 3.5) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getCollegeTypeColor = (type: string) => {
    switch (type) {
      case 'Government': return 'text-green-600 bg-green-50';
      case 'Private': return 'text-blue-600 bg-blue-50';
      case 'Deemed': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (isCompact) {
    return (
      <Card className="hover:shadow-md transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">
                {college.name}
              </h3>
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                {college.location.city}, {college.location.state}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={`${getRatingColor(5 - (college.ranking / 20))} text-xs`}>
                  <Star className="w-3 h-3 mr-1" />
                  {(5 - (college.ranking / 20)).toFixed(1)}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {formatDistance(college.distance)}
                </Badge>
              </div>
            </div>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={onViewOnMap}
              className="text-xs p-1 h-8"
            >
              <MapPin className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold text-gray-900 leading-tight">
              {college.name}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1 flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              {college.location.city}, {college.location.state}
            </p>
          </div>
          <div className="text-right">
            <Badge className={`${getRatingColor(5 - (college.ranking / 20))} font-medium`}>
              <Star className="w-3 h-3 mr-1" />
              {(5 - (college.ranking / 20)).toFixed(1)}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Quick Stats */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-blue-600" />
            <span className="font-medium">{formatDistance(college.distance)}</span>
          </div>
          <Badge className={`${getCollegeTypeColor(college.type)} text-xs`}>
            {college.type}
          </Badge>
        </div>

        {/* Courses */}
        <div>
          <p className="text-sm font-medium text-gray-900 mb-2">Available Courses</p>
          <div className="flex flex-wrap gap-1">
            {college.courses.slice(0, 3).map((course, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {course}
              </Badge>
            ))}
            {college.courses.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{college.courses.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Facilities */}
        <div>
          <p className="text-sm font-medium text-gray-900 mb-2">Key Facilities</p>
          <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
            {Object.entries(college.facilities)
              .filter(([_, available]) => available)
              .slice(0, 4)
              .map(([facility, _], index) => (
                <div key={index} className="flex items-center">
                  <div className="w-1 h-1 bg-green-500 rounded-full mr-2" />
                  {facility.charAt(0).toUpperCase() + facility.slice(1)}
                </div>
              ))}
          </div>
        </div>

        {/* College Info */}
        <div className="pt-2 border-t border-gray-100 space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-3 h-3" />
            <span className="text-xs">Ranking: #{college.ranking}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign className="w-3 h-3" />
            <span className="text-xs">Annual Fee: ₹{(college.fees.annual / 100000).toFixed(1)}L</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onViewOnMap}
            className="flex-1 text-xs"
          >
            <MapPin className="w-3 h-3 mr-1" />
            View on Map
          </Button>
          <Button size="sm" className="flex-1 text-xs">
            Learn More
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const LoadingSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <Card key={i} className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-6 w-12" />
          </div>
          <Skeleton className="h-4 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
      </Card>
    ))}
  </div>
);

export const NearbyColleges = ({ limit = 10 }: { limit?: number }) => {
  const [colleges, setColleges] = useState<CollegeInfo[]>([]);
  const [filteredColleges, setFilteredColleges] = useState<CollegeInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedCollege, setSelectedCollege] = useState<CollegeInfo | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number]>([28.6139, 77.2090]); // Default to Delhi
  const { currentProfile } = useProfileStore();

  useEffect(() => {
    loadColleges();
    getCurrentLocation();
  }, [currentProfile, limit]);

  useEffect(() => {
    filterColleges();
  }, [colleges, searchTerm, selectedType]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.log('Location access denied, using default location');
        }
      );
    }
  };

  const loadColleges = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Try to get cached colleges first
      let cachedColleges = await dashboardDB.getColleges();
      
      // If no cached data, generate new ones
      if (cachedColleges.length === 0) {
        const mockColleges = generateMockColleges(userLocation);
        await dashboardDB.saveColleges(mockColleges);
        await dashboardDB.setCacheTimestamp('colleges', Date.now());
        cachedColleges = mockColleges;
      }

      // Sort by distance and limit results
      const sortedColleges = cachedColleges
        .sort((a, b) => a.distance - b.distance)
        .slice(0, limit);

      setColleges(sortedColleges);
    } catch (err) {
      console.error('Error loading colleges:', err);
      setError('Failed to load nearby colleges');
    } finally {
      setIsLoading(false);
    }
  };

  const filterColleges = () => {
    let filtered = colleges;

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(college =>
        college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${college.location.city}, ${college.location.state}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        college.courses.some(course => 
          course.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filter by type
    if (selectedType !== 'All') {
      filtered = filtered.filter(college => college.type === selectedType);
    }

    setFilteredColleges(filtered);
  };

  const handleViewOnMap = (college: CollegeInfo) => {
    setSelectedCollege(college);
  };

  const mapCenter: [number, number] = selectedCollege 
    ? selectedCollege.location.coordinates
    : userLocation;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          {error}. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (colleges.length === 0) {
    return (
      <Alert className="border-blue-200 bg-blue-50">
        <MapPin className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          No colleges found in your area. Try expanding your search radius.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Nearby Colleges
          </h3>
          <p className="text-sm text-gray-600">
            Government and private institutions near you
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {filteredColleges.length} found
        </Badge>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              List View
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Map View
            </TabsTrigger>
          </TabsList>

          <div className="flex flex-1 gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search colleges..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Types</option>
              <option value="Government">Government</option>
              <option value="Private">Private</option>
              <option value="Deemed">Deemed</option>
            </select>
          </div>
        </div>

        <TabsContent value="list" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredColleges.map((college) => (
              <CollegeCard
                key={college.id}
                college={college}
                onViewOnMap={() => handleViewOnMap(college)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="map" className="mt-0">
          <div className="h-[500px] rounded-lg overflow-hidden border">
            <MapContainer
              center={mapCenter}
              zoom={12}
              scrollWheelZoom={false}
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapUpdater center={mapCenter} />
              
              {/* User location marker */}
              <Marker position={userLocation}>
                <Popup>
                  <div className="text-center">
                    <p className="font-medium">Your Location</p>
                  </div>
                </Popup>
              </Marker>

              {/* College markers */}
              {filteredColleges.map((college) => (
                <Marker
                  key={college.id}
                  position={college.location.coordinates}
                >
                  <Popup>
                    <div className="min-w-[200px]">
                      <h3 className="font-semibold text-sm mb-2">{college.name}</h3>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span>{(5 - (college.ranking / 20)).toFixed(1)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Navigation className="w-3 h-3 text-blue-600" />
                          <span>{formatDistance(college.distance)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-gray-600" />
                          <span>{college.type}</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <Button size="sm" className="w-full text-xs">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
