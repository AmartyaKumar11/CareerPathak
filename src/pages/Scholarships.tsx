import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  ExternalLink,
  Filter,
  Search,
  Award,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  GraduationCap
} from 'lucide-react';
import scholarshipsData from '../../all_scholarships.json';

interface Scholarship {
  name: string;
  provider: string;
  applicable_region: string;
  application_period: string;
  eligibility: string;
  benefits: string;
  how_to_apply: string;
  links: string[];
}

const Scholarships: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scholarships, setScholarships] = useState<Scholarship[]>(scholarshipsData);
  const [filteredScholarships, setFilteredScholarships] = useState<Scholarship[]>(scholarshipsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    gender: 'all',
    education: 'all',
    amount: 'all',
    region: 'all'
  });

  // Filter scholarships based on current filters and search
  useEffect(() => {
    let filtered = scholarships.filter(scholarship => {
      const matchesSearch = scholarship.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          scholarship.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          scholarship.eligibility.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesGender = filters.gender === 'all' || 
                          (filters.gender === 'women' && scholarship.name.toLowerCase().includes('women')) ||
                          (filters.gender === 'men' && !scholarship.name.toLowerCase().includes('women'));

      const matchesEducation = filters.education === 'all' ||
                              (filters.education === 'high-school' && scholarship.eligibility.toLowerCase().includes('10+2')) ||
                              (filters.education === 'undergraduate' && (scholarship.eligibility.toLowerCase().includes('ug') || scholarship.eligibility.toLowerCase().includes('bachelor'))) ||
                              (filters.education === 'postgraduate' && (scholarship.eligibility.toLowerCase().includes('pg') || scholarship.eligibility.toLowerCase().includes('post')));

      const matchesAmount = filters.amount === 'all' ||
                          (filters.amount === 'low' && scholarship.benefits.includes('₹') && extractAmount(scholarship.benefits) < 50000) ||
                          (filters.amount === 'medium' && scholarship.benefits.includes('₹') && extractAmount(scholarship.benefits) >= 50000 && extractAmount(scholarship.benefits) < 200000) ||
                          (filters.amount === 'high' && scholarship.benefits.includes('₹') && extractAmount(scholarship.benefits) >= 200000);

      const matchesRegion = filters.region === 'all' || 
                          scholarship.applicable_region.toLowerCase().includes(filters.region.toLowerCase());

      return matchesSearch && matchesGender && matchesEducation && matchesAmount && matchesRegion;
    });

    setFilteredScholarships(filtered);
  }, [searchTerm, filters, scholarships]);

  const extractAmount = (benefitText: string): number => {
    const match = benefitText.match(/₹(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:lakh|L)?/i);
    if (!match) return 0;
    
    const amount = parseFloat(match[1].replace(/,/g, ''));
    return benefitText.toLowerCase().includes('lakh') || benefitText.toLowerCase().includes('l') 
      ? amount * 100000 
      : amount;
  };

  const resetFilters = () => {
    setFilters({
      gender: 'all',
      education: 'all',
      amount: 'all',
      region: 'all'
    });
    setSearchTerm('');
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Scholarships</h1>
                <p className="text-muted-foreground">
                  {filteredScholarships.length} of {scholarships.length} scholarships
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Filters Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search scholarships..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Gender Filter */}
              <div>
                <Label>Gender</Label>
                <Select value={filters.gender} onValueChange={(value) => setFilters({...filters, gender: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="women">Women Only</SelectItem>
                    <SelectItem value="men">General/Men</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Education Level */}
              <div>
                <Label>Education</Label>
                <Select value={filters.education} onValueChange={(value) => setFilters({...filters, education: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="high-school">High School</SelectItem>
                    <SelectItem value="undergraduate">Undergraduate</SelectItem>
                    <SelectItem value="postgraduate">Postgraduate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Amount Filter */}
              <div>
                <Label>Amount</Label>
                <Select value={filters.amount} onValueChange={(value) => setFilters({...filters, amount: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Amounts</SelectItem>
                    <SelectItem value="low">Under ₹50K</SelectItem>
                    <SelectItem value="medium">₹50K - ₹2L</SelectItem>
                    <SelectItem value="high">Above ₹2L</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reset Button */}
              <div className="flex items-end">
                <Button variant="outline" onClick={resetFilters} className="w-full">
                  Reset Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scholarships Grid */}
        {filteredScholarships.length === 0 ? (
          <div className="text-center py-12">
            <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No scholarships found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters or search terms
            </p>
            <Button onClick={resetFilters}>Reset Filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredScholarships.map((scholarship, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">{scholarship.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{scholarship.provider}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 ml-2">
                      {scholarship.benefits.length > 30 
                        ? scholarship.benefits.substring(0, 30) + "..." 
                        : scholarship.benefits}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Eligibility */}
                    <div>
                      <p className="text-sm font-medium mb-1">Eligibility</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {scholarship.eligibility}
                      </p>
                    </div>

                    {/* Application Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Period</p>
                          <p className="text-muted-foreground">{scholarship.application_period}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Region</p>
                          <p className="text-muted-foreground">{scholarship.applicable_region}</p>
                        </div>
                      </div>
                    </div>

                    {/* Apply Button */}
                    <Button className="w-full" asChild>
                      <a 
                        href={scholarship.links[0]} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Apply Now
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Scholarships;