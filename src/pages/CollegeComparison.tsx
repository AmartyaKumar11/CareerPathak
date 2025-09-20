import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, CheckCircle, XCircle, Wifi, Users, Home, Utensils, Building, DollarSign, Star, GraduationCap } from 'lucide-react';

// Enhanced mock college data with comprehensive, realistic details
const mockCollegeData = {
  'gdc-udhampur': {
    id: 'gdc-udhampur',
    name: 'Government Degree College, Udhampur',
    location: 'Udhampur, Jammu & Kashmir',
    type: 'Government Arts & Science College',
    image: '/placeholder.svg',
    ranking: '#158 (NIRF Overall 2024)',
    established: '1963',
    metrics: {
      fees: {
        annual: '₹12,400',
        tuition: '₹8,200',
        hostel: 'Not available',
        mess: 'Not available',
        other: '₹4,200',
        rating: 4.8
      },
      hostel: {
        available: false,
        rating: 0,
        capacity: 'No hostel facility',
        occupancy: 'N/A',
        facilities: [],
        roomTypes: 'Day scholar college',
        wardenSystem: 'Not applicable'
      },
      mess: {
        available: false,
        rating: 0,
        type: 'External food courts and cafeteria',
        cost: '₹80-150/day (external)',
        timing: 'College canteen: 9:00 AM - 4:00 PM',
        facilities: ['Student canteen', 'Tea stall', 'Local food vendors'],
        hygiene: 'Basic hygiene standards'
      },
      facilities: {
        rating: 3.8,
        library: 'College Library - 45,000 books, INFLIBNET access, Open 9AM-5PM',
        labs: '12 labs: Computer lab, Physics, Chemistry, Biology, Geography',
        sports: 'Playground for cricket/football, Volleyball court, Indoor games',
        medical: 'First aid room, Tie-up with District Hospital Udhampur',
        others: ['Seminar hall (150 seats)', 'Smart classrooms (3)', 'Photocopy center', 'Parking facility']
      },
      internet: {
        available: true,
        rating: 3.2,
        speed: '50 Mbps shared connection',
        coverage: 'Computer lab, Library, Administrative block',
        facilities: ['Wi-Fi in library', 'Computer center access', 'Faculty internet'],
        restrictions: 'Student access during lab hours only'
      },
      faculty: {
        total: 68,
        professors: 12,
        associateProfessors: 24,
        assistantProfessors: 32,
        phd: 38,
        experience: '8.5 years average',
        ratio: '1:22 (Faculty:Student)',
        visiting: '6 guest lecturers, 2 retired professors'
      },
      placements: {
        percentage: '42%',
        averagePackage: '₹3.2 LPA',
        highestPackage: '₹8.5 LPA',
        medianPackage: '₹2.8 LPA',
        topRecruiters: [{'name': 'J&K Bank', 'logo': '🏦'}, {'name': 'BSNL', 'logo': '�'}, {'name': 'India Post', 'logo': '�'}, {'name': 'Local Schools', 'logo': '🎓'}, {'name': 'Cooperative Societies', 'logo': '🤝'}, {'name': 'Small Businesses', 'logo': '🏪'}]
      }
    }
  },
  'gdc-rajouri': {
    id: 'gdc-rajouri',
    name: 'Government Degree College, Rajouri',
    location: 'Rajouri, Jammu & Kashmir',
    type: 'Government Arts & Commerce College',
    image: '/placeholder.svg',
    ranking: '#201 (NIRF Overall 2024)',
    established: '1986',
    metrics: {
      fees: {
        annual: '₹11,800',
        tuition: '₹7,600',
        hostel: '₹18,000/year (Girls hostel only)',
        mess: '₹2,400/month (Hostel students)',
        other: '₹4,200',
        rating: 4.6
      },
      hostel: {
        available: true,
        rating: 3.6,
        capacity: '120 students (Girls only)',
        occupancy: '85%',
        facilities: ['Basic furnished rooms', 'Common washrooms', 'Study hall', 'TV room', 'Security guard'],
        roomTypes: 'Triple/Quad sharing rooms',
        wardenSystem: 'Lady superintendent with student prefects'
      },
      mess: {
        available: true,
        rating: 3.4,
        type: 'Simple vegetarian North Indian meals',
        cost: '₹2,400/month',
        timing: '7:00 AM - 8:30 PM',
        facilities: ['Basic dining hall', 'Simple kitchen'],
        hygiene: 'Regular cleaning, basic standards'
      },
      facilities: {
        rating: 3.5,
        library: 'Central Library - 32,000 books, Newspapers, Study hall for 80 students',
        labs: '8 labs: Computer lab (40 systems), Science labs, Language lab',
        sports: 'Basketball court, Badminton court, Small playground',
        medical: 'First aid facility, Weekly health checkup',
        others: ['Auditorium (200 capacity)', 'Common room', 'Photocopy facility', 'Stationery shop']
      },
      internet: {
        available: true,
        rating: 2.8,
        speed: '25 Mbps shared connection',
        coverage: 'Computer lab and Administrative office only',
        facilities: ['Computer lab access', 'Limited Wi-Fi in office'],
        restrictions: 'Very limited student access, mostly administrative use'
      },
      faculty: {
        total: 45,
        professors: 8,
        associateProfessors: 16,
        assistantProfessors: 21,
        phd: 24,
        experience: '7.2 years average',
        ratio: '1:28 (Faculty:Student)',
        visiting: '4 part-time lecturers'
      },
      placements: {
        percentage: '35%',
        averagePackage: '₹2.8 LPA',
        highestPackage: '₹6.2 LPA',
        medianPackage: '₹2.5 LPA',
        topRecruiters: [{'name': 'J&K Govt', 'logo': '🏛️'}, {'name': 'Teaching Jobs', 'logo': '👨‍🏫'}, {'name': 'SBI', 'logo': '🏦'}, {'name': 'PNB', 'logo': '💳'}, {'name': 'Local NGOs', 'logo': '🤲'}, {'name': 'Private Firms', 'logo': '💼'}]
      }
    }
  }
};

export const CollegeComparison = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [colleges, setColleges] = useState<any[]>([]);

  useEffect(() => {
    // First check if colleges were passed via navigation state
    if (location.state?.colleges) {
      const selectedColleges = location.state.colleges;
      // Map selected colleges to our detailed mock data
      const mappedColleges = selectedColleges.map((college: any) => {
        // Create a mapping from college names to our mock data IDs
        const collegeMapping: { [key: string]: string } = {
          'Government Degree College, Udhampur': 'gdc-udhampur',
          'Government Degree College, Rajouri': 'gdc-rajouri'
        };
        
        const mockId = collegeMapping[college.name] || college.id;
        const mockData = mockCollegeData[mockId as keyof typeof mockCollegeData];
        
        // If we have mock data, use it; otherwise fall back to formatted data
        if (mockData) {
          return mockData;
        } else {
          // Fallback formatting for unknown colleges
          return {
            id: college.id || college.name.toLowerCase().replace(/\s+/g, '-'),
            name: college.name,
            location: college.location,
            type: college.type,
            ranking: 'Not specified',
            established: 'Not specified',
            image: college.image || '/placeholder.svg',
            metrics: {
              fees: {
                annual: college.fees,
                tuition: 'Not specified',
                hostel: 'Not specified',
                mess: 'Not specified',
                other: 'Not specified',
                rating: 4.0
              },
              hostel: {
                available: true,
                rating: college.rating || 4.0,
                capacity: 'Not specified',
                occupancy: 'Not specified',
                facilities: ['Basic facilities'],
                roomTypes: 'Not specified',
                wardenSystem: 'Standard system'
              },
              mess: {
                available: true,
                rating: 3.8,
                type: 'Multi-cuisine',
                cost: 'Not specified',
                timing: 'Standard timing',
                facilities: ['Main dining'],
                hygiene: 'Standard hygiene'
              },
              facilities: {
                rating: college.rating || 4.0,
                library: 'Library available',
                labs: 'Labs available',
                sports: 'Sports facilities',
                medical: 'Medical center',
                others: ['Basic facilities']
              },
              internet: {
                available: true,
                rating: 4.0,
                speed: 'High-speed',
                coverage: 'Campus-wide',
                facilities: ['Wi-Fi'],
                restrictions: 'Standard policy'
              },
              faculty: {
                total: 'Not specified',
                professors: 'Not specified',
                associateProfessors: 'Not specified',
                assistantProfessors: 'Not specified',
                phd: 'Most faculty',
                experience: 'Experienced',
                ratio: 'Good ratio',
                visiting: 'Guest faculty'
              },
              placements: {
                percentage: 'Good placement rate',
                averagePackage: 'Competitive packages',
                highestPackage: 'High packages available',
                medianPackage: 'Good median',
                topRecruiters: [{'name': 'Various Companies', 'logo': '🏢'}]
              }
            }
          };
        }
      });
      setColleges(mappedColleges);
    } else {
      // Fallback to URL parameters for mock data, default to our two colleges
      const collegeIds = searchParams.get('colleges')?.split(',') || ['gdc-udhampur', 'gdc-rajouri'];
      const collegeData = collegeIds.map(id => mockCollegeData[id as keyof typeof mockCollegeData]).filter(Boolean);
      setColleges(collegeData.length > 0 ? collegeData : [mockCollegeData['gdc-udhampur'], mockCollegeData['gdc-rajouri']]);
    }
  }, [searchParams, location.state]);

  const getRatingColor = (rating: number | string) => {
    if (typeof rating === 'string') return 'text-muted-foreground';
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-blue-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRatingStars = (rating: number | string) => {
    if (typeof rating === 'string') return '-';
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  };

  if (colleges.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">College Comparison</h1>
        </div>
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">No colleges selected for comparison.</p>
          <Button onClick={() => navigate('/career-insights-portal/0?colleges=gdc-udhampur,gdc-rajouri')} className="mt-4">
            Browse Colleges
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">College Comparison</h1>
          <p className="text-muted-foreground">Compare {colleges.length} colleges side by side</p>
        </div>
      </div>

      {/* College Headers */}
            {/* College Headers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        {colleges.map((college) => (
          <Card key={college.id} className="text-center">
            <CardHeader className="pb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Building className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-lg leading-tight">{college.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{college.location}</p>
              <div className="space-y-2">
                <Badge variant="outline">{college.type}</Badge>
                {college.ranking && (
                  <p className="text-xs text-primary font-medium">{college.ranking}</p>
                )}
                {college.established && (
                  <p className="text-xs text-muted-foreground">Est. {college.established}</p>
                )}
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Comparison Table */}
      <div className="space-y-6">
        {/* Fees Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Fee Structure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3">Component</TableHead>
                  {colleges.map((college) => (
                    <TableHead key={college.id} className="text-center w-1/3">
                      {college.name.replace('Government Degree College, ', 'GDC ')}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Total Annual Fees</TableCell>
                  {colleges.map((college) => (
                    <TableCell key={college.id} className="text-center">
                      <div className="font-bold text-lg text-primary">{college.metrics.fees.annual}</div>
                      <div className={`text-sm ${getRatingColor(college.metrics.fees.rating)}`}>
                        {getRatingStars(college.metrics.fees.rating)} ({college.metrics.fees.rating})
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Tuition Fees</TableCell>
                  {colleges.map((college) => (
                    <TableCell key={college.id} className="text-center">{college.metrics.fees.tuition}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Hostel Fees</TableCell>
                  {colleges.map((college) => (
                    <TableCell key={college.id} className="text-center">{college.metrics.fees.hostel}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Mess Fees</TableCell>
                  {colleges.map((college) => (
                    <TableCell key={college.id} className="text-center">{college.metrics.fees.mess}</TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Hostel Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              Hostel Facilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/4">Aspect</TableHead>
                  {colleges.map((college) => (
                    <TableHead key={college.id} className="text-center">
                      {college.name.split(' ').slice(0, 2).join(' ')}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Overall Rating</TableCell>
                  {colleges.map((college) => (
                    <TableCell key={college.id} className="text-center">
                      <div className={`text-lg font-bold ${getRatingColor(college.metrics.hostel.rating)}`}>
                        {getRatingStars(college.metrics.hostel.rating)} ({college.metrics.hostel.rating})
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Capacity</TableCell>
                  {colleges.map((college) => (
                    <TableCell key={college.id} className="text-center">{college.metrics.hostel.capacity}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Occupancy</TableCell>
                  {colleges.map((college) => (
                    <TableCell key={college.id} className="text-center">{college.metrics.hostel.occupancy}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Room Types</TableCell>
                  {colleges.map((college) => (
                    <TableCell key={college.id} className="text-center">{college.metrics.hostel.roomTypes}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Facilities</TableCell>
                  {colleges.map((college) => (
                    <TableCell key={college.id} className="text-center">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {college.metrics.hostel.facilities.slice(0, 3).map((facility: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">{facility}</Badge>
                        ))}
                        {college.metrics.hostel.facilities.length > 3 && (
                          <Badge variant="outline" className="text-xs">+{college.metrics.hostel.facilities.length - 3}</Badge>
                        )}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Mess Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="w-5 h-5" />
              Mess & Dining
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/4">Aspect</TableHead>
                  {colleges.map((college) => (
                    <TableHead key={college.id} className="text-center">
                      {college.name.split(' ').slice(0, 2).join(' ')}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Overall Rating</TableCell>
                  {colleges.map((college) => (
                    <TableCell key={college.id} className="text-center">
                      <div className={`text-lg font-bold ${getRatingColor(college.metrics.mess.rating)}`}>
                        {getRatingStars(college.metrics.mess.rating)} ({college.metrics.mess.rating})
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Cuisine Type</TableCell>
                  {colleges.map((college) => (
                    <TableCell key={college.id} className="text-center">{college.metrics.mess.type}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Monthly Cost</TableCell>
                  {colleges.map((college) => (
                    <TableCell key={college.id} className="text-center font-semibold">{college.metrics.mess.cost}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Timing</TableCell>
                  {colleges.map((college) => (
                    <TableCell key={college.id} className="text-center">{college.metrics.mess.timing}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Hygiene Standards</TableCell>
                  {colleges.map((college) => (
                    <TableCell key={college.id} className="text-center">{college.metrics.mess.hygiene}</TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Internet & Connectivity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="w-5 h-5" />
              Internet & Connectivity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/4">Aspect</TableHead>
                  {colleges.map((college) => (
                    <TableHead key={college.id} className="text-center">
                      {college.name.split(' ').slice(0, 2).join(' ')}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Overall Rating</TableCell>
                  {colleges.map((college) => (
                    <TableCell key={college.id} className="text-center">
                      <div className={`text-lg font-bold ${getRatingColor(college.metrics.internet.rating)}`}>
                        {getRatingStars(college.metrics.internet.rating)} ({college.metrics.internet.rating})
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Speed</TableCell>
                  {colleges.map((college) => (
                    <TableCell key={college.id} className="text-center font-semibold">{college.metrics.internet.speed}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Coverage</TableCell>
                  {colleges.map((college) => (
                    <TableCell key={college.id} className="text-center">{college.metrics.internet.coverage}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Access Policy</TableCell>
                  {colleges.map((college) => (
                    <TableCell key={college.id} className="text-center">{college.metrics.internet.restrictions}</TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Faculty Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Faculty & Academic Staff
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/4">Aspect</TableHead>
                  {colleges.map((college) => (
                    <TableHead key={college.id} className="text-center">
                      {college.name.split(' ').slice(0, 2).join(' ')}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Total Faculty</TableCell>
                  {colleges.map((college) => (
                    <TableCell key={college.id} className="text-center font-semibold">{college.metrics.faculty.total}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">PhD Holders</TableCell>
                  {colleges.map((college) => (
                    <TableCell key={college.id} className="text-center">{college.metrics.faculty.phd}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Average Experience</TableCell>
                  {colleges.map((college) => (
                    <TableCell key={college.id} className="text-center">{college.metrics.faculty.experience}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Faculty:Student Ratio</TableCell>
                  {colleges.map((college) => (
                    <TableCell key={college.id} className="text-center font-semibold text-primary">{college.metrics.faculty.ratio}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Visiting Faculty</TableCell>
                  {colleges.map((college) => (
                    <TableCell key={college.id} className="text-center">{college.metrics.faculty.visiting}</TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Placement Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Placements & Career Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3">Metric</TableHead>
                  {colleges.map((college) => (
                    <TableHead key={college.id} className="text-center w-1/3">
                      {college.name.replace('Government Degree College, ', 'GDC ')}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Placement Percentage</TableCell>
                  {colleges.map((college) => (
                    <TableCell key={college.id} className="text-center">
                      <div className="font-bold text-lg text-green-600">{college.metrics.placements.percentage}</div>
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Average Package</TableCell>
                  {colleges.map((college) => (
                    <TableCell key={college.id} className="text-center font-semibold">{college.metrics.placements.averagePackage}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Highest Package</TableCell>
                  {colleges.map((college) => (
                    <TableCell key={college.id} className="text-center font-semibold text-primary">{college.metrics.placements.highestPackage}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Median Package</TableCell>
                  {colleges.map((college) => (
                    <TableCell key={college.id} className="text-center">{college.metrics.placements.medianPackage}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Top Recruiters</TableCell>
                  {colleges.map((college) => (
                    <TableCell key={college.id} className="text-center">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {college.metrics.placements.topRecruiters.slice(0, 4).map((recruiter: any, index: number) => (
                          <div key={index} className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-xs">
                            <span className="text-base">{recruiter.logo}</span>
                            <span>{recruiter.name}</span>
                          </div>
                        ))}
                        {college.metrics.placements.topRecruiters.length > 4 && (
                          <Badge variant="secondary" className="text-xs">+{college.metrics.placements.topRecruiters.length - 4}</Badge>
                        )}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-center mt-8">
        <Button onClick={() => navigate('/career-insights-portal/0?colleges=gdc-udhampur,gdc-rajouri')} className="mr-4">
          Browse More Colleges
        </Button>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Back to Recommendations
        </Button>
      </div>
    </div>
  );
};