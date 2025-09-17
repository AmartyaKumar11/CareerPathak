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
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface College {
  name: string;
  latitude: number;
  longitude: number;
}

export default function NearbyCollegesMap() {
  const navigate = useNavigate();
  const [colleges, setColleges] = useState<College[]>([]);
  const [filteredColleges, setFilteredColleges] = useState<College[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load colleges data
    const loadColleges = async () => {
      try {
        const response = await fetch('/colleges_latlong_all.json');
        const data = await response.json();
        setColleges(data);
        setFilteredColleges(data);
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
          <p className="text-muted-foreground">Explore colleges across India</p>
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
            <Badge variant="secondary">
              {filteredColleges.length} colleges found
            </Badge>
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
            Click on any marker to see college details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ height: '600px', width: '100%' }}>
            <MapContainer
              center={[20.5937, 78.9629]} // Center of India
              zoom={5}
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
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold mb-2">{college.name}</h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {getCollegeLocation(college.name)}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {getCollegeType(college.name)}
                        </Badge>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{colleges.length}</div>
            <div className="text-sm text-muted-foreground">Total Colleges</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{filteredColleges.length}</div>
            <div className="text-sm text-muted-foreground">Filtered Results</div>
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