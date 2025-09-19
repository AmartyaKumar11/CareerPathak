import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;

// Create custom icons for different college types
const jkIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const allIndiaIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface College {
  name: string;
  latitude: number;
  longitude: number;
  source?: string; // Track which dataset the college comes from
}

export default function NearbyCollegesMap() {
  const navigate = useNavigate();
  const [colleges, setColleges] = useState<College[]>([]);
  const [filteredColleges, setFilteredColleges] = useState<College[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [jkCollegeCount, setJkCollegeCount] = useState(0);
  const [allIndiaCollegeCount, setAllIndiaCollegeCount] = useState(0);

  useEffect(() => {
    // Load both college datasets
    const loadColleges = async () => {
      try {
        // Load J&K specific colleges
        const jkResponse = await fetch('/colleges_jk.json');
        const jkData = await jkResponse.json();
        const jkColleges = jkData.map((college: College) => ({
          ...college,
          source: 'J&K'
        }));
        
        // Load all India colleges
        const allIndiaResponse = await fetch('/colleges_latlong_all.json');
        const allIndiaData = await allIndiaResponse.json();
        const allIndiaColleges = allIndiaData.map((college: College) => ({
          ...college,
          source: 'All India'
        }));
        
        // Combine both datasets, prioritizing J&K colleges at the beginning
        const combinedColleges = [...jkColleges, ...allIndiaColleges];
        
        setJkCollegeCount(jkColleges.length);
        setAllIndiaCollegeCount(allIndiaColleges.length);
        setColleges(combinedColleges);
        setFilteredColleges(combinedColleges);
        
        console.log(`Loaded ${jkColleges.length} J&K colleges and ${allIndiaColleges.length} All India colleges`);
      } catch (error) {
        console.error('Failed to load colleges data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadColleges();
  }, []);

  useEffect(() => {
    // Filter colleges based on search term
    if (searchTerm.trim() === '') {
      setFilteredColleges(colleges);
    } else {
      const filtered = colleges.filter(college =>
        college.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredColleges(filtered);
    }
  }, [searchTerm, colleges]);

  const getCollegeLocation = (name: string) => {
    const parts = name.split(',');
    if (parts.length >= 2) {
      return parts.slice(-2).join(',').trim();
    }
    return 'India';
  };

  const getCollegeType = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('engineering') || lowerName.includes('technical')) return 'Engineering';
    if (lowerName.includes('medical') || lowerName.includes('mbbs')) return 'Medical';
    if (lowerName.includes('business') || lowerName.includes('management')) return 'Business';
    if (lowerName.includes('university')) return 'University';
    return 'College';
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading colleges map...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nearby Colleges</h1>
          <p className="text-muted-foreground">Explore colleges in J&K and across India</p>
        </div>
      </div>

      {/* Search and Filter */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Search colleges by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary">
                {filteredColleges.length} total
              </Badge>
              <Badge variant="destructive" className="bg-red-500">
                {filteredColleges.filter(c => c.source === 'J&K').length} J&K
              </Badge>
              <Badge variant="default" className="bg-blue-500">
                {filteredColleges.filter(c => c.source === 'All India').length} All India
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Colleges Map
          </CardTitle>
          <CardDescription>
            <div className="space-y-1">
              <div>Click on any marker to see college details</div>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  J&K Colleges
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  All India Colleges
                </span>
              </div>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ height: '600px', width: '100%' }}>
            <MapContainer
              center={[33.7782, 76.5762]} // Jammu & Kashmir center
              zoom={6}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filteredColleges.map((college, index) => (
                <Marker
                  key={index}
                  position={[college.latitude, college.longitude]}
                  icon={college.source === 'J&K' ? jkIcon : allIndiaIcon}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold mb-2">{college.name}</h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {getCollegeLocation(college.name)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {getCollegeType(college.name)}
                          </Badge>
                          <Badge 
                            variant={college.source === 'J&K' ? 'destructive' : 'default'}
                            className="text-xs"
                          >
                            {college.source}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Lat: {college.latitude.toFixed(4)}, Lng: {college.longitude.toFixed(4)}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{colleges.length}</div>
            <div className="text-sm text-muted-foreground">Total Colleges</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{jkCollegeCount}</div>
            <div className="text-sm text-muted-foreground">J&K Colleges</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{allIndiaCollegeCount}</div>
            <div className="text-sm text-muted-foreground">All India Colleges</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {new Set(colleges.map(c => getCollegeLocation(c.name))).size}
            </div>
            <div className="text-sm text-muted-foreground">Locations Covered</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}