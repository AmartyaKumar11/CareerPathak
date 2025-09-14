import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  BarChart3, 
  Target, 
  Users, 
  DollarSign,
  GraduationCap,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { 
  CareerPath, 
  dashboardDB, 
  generateMockCareerPaths 
} from '@/services/dashboardDataService';
import { useProfileStore } from '@/stores/profileStore';

// Chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

interface VisualizationCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

const VisualizationCard = ({ title, description, children, action }: VisualizationCardProps) => (
  <Card className="h-full">
    <CardHeader className="pb-4">
      <div className="flex items-start justify-between">
        <div>
          <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
        {action}
      </div>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

const formatSalary = (amount: number): string => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${(amount / 1000).toFixed(0)}K`;
};

const getSalaryTrendIcon = (trend: number) => {
  if (trend > 0) return <ArrowUp className="w-4 h-4 text-green-600" />;
  if (trend < 0) return <ArrowDown className="w-4 h-4 text-red-600" />;
  return <Minus className="w-4 h-4 text-gray-600" />;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">{`${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {`${entry.dataKey}: ${typeof entry.value === 'number' && entry.dataKey.includes('salary') ? formatSalary(entry.value) : entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const LoadingSkeleton = () => (
  <div className="space-y-6">
    {[1, 2, 3].map((i) => (
      <Card key={i} className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-8 w-24" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </Card>
    ))}
  </div>
);

export const CareerVisualizationCharts = () => {
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPath, setSelectedPath] = useState<CareerPath | null>(null);
  const { currentProfile } = useProfileStore();

  useEffect(() => {
    loadCareerPaths();
  }, [currentProfile]);

  const loadCareerPaths = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Try to get cached career paths first
      let cachedPaths = await dashboardDB.getCareerPaths();
      
      // If no cached data, generate new ones
      if (cachedPaths.length === 0) {
        const mockPaths = generateMockCareerPaths();
        await dashboardDB.saveCareerPaths(mockPaths);
        await dashboardDB.setCacheTimestamp('careerPaths', Date.now());
        cachedPaths = mockPaths;
      }

      setCareerPaths(cachedPaths);
      if (cachedPaths.length > 0) {
        setSelectedPath(cachedPaths[0]);
      }
    } catch (err) {
      console.error('Error loading career paths:', err);
      setError('Failed to load career path data');
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare data for salary progression chart
  const salaryProgressionData = selectedPath?.salaryProgression.map((salary, index) => ({
    year: `Year ${index + 1}`,
    salary: salary,
    experience: index + 1
  })) || [];

  // Prepare data for skills demand chart
  const skillsData = selectedPath 
    ? [...selectedPath.requiredSkills.technical, ...selectedPath.requiredSkills.soft].map((skill, index) => ({
        name: skill,
        demand: Math.floor(Math.random() * 100) + 50, // Mock demand percentage
        growth: Math.floor(Math.random() * 30) + 5 // Mock growth rate
      }))
    : [];

  // Prepare data for career comparison
  const comparisonData = careerPaths.slice(0, 5).map(path => ({
    name: path.title,
    avgSalary: path.salaryProgression.reduce((acc, curr) => acc + curr.salary, 0) / path.salaryProgression.length,
    growth: path.jobMarketTrend.length > 0 ? path.jobMarketTrend[path.jobMarketTrend.length - 1].growth : 0,
    demand: Math.floor(Math.random() * 50) + 50 // Mock demand score
  }));

  // Prepare data for industry distribution (using related careers as categories)
  const industryData = careerPaths.reduce((acc: any[], path) => {
    const category = path.relatedCareers[0] || 'Other';
    const existing = acc.find(item => item.name === category);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: category, value: 1 });
    }
    return acc;
  }, []);

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

  if (careerPaths.length === 0) {
    return (
      <Alert className="border-blue-200 bg-blue-50">
        <BarChart3 className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          No career path data available. Complete your profile to get personalized insights.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Career Path Visualizations
          </h3>
          <p className="text-sm text-gray-600">
            Interactive charts and insights for career planning
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedPath?.id || ''}
            onChange={(e) => {
              const path = careerPaths.find(p => p.id === e.target.value);
              setSelectedPath(path || null);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {careerPaths.map(path => (
              <option key={path.id} value={path.id}>{path.title}</option>
            ))}
          </select>
        </div>
      </div>

      <Tabs defaultValue="salary" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="salary">Salary Growth</TabsTrigger>
          <TabsTrigger value="skills">Skills Demand</TabsTrigger>
          <TabsTrigger value="comparison">Career Comparison</TabsTrigger>
          <TabsTrigger value="insights">Market Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="salary" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <VisualizationCard
              title="Salary Progression"
              description="Expected salary growth over time"
              action={
                <Badge variant="secondary" className="flex items-center gap-1">
                  {getSalaryTrendIcon(selectedPath?.jobMarketTrend[selectedPath.jobMarketTrend.length - 1]?.growth || 0)}
                  +{selectedPath?.jobMarketTrend[selectedPath.jobMarketTrend.length - 1]?.growth || 0}%
                </Badge>
              }
            >
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salaryProgressionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={formatSalary} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="salary" 
                      stroke="#0088FE" 
                      fill="#0088FE" 
                      fillOpacity={0.1}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </VisualizationCard>

            <VisualizationCard
              title="Career Milestones"
              description="Key achievements and progression markers"
            >
              <div className="space-y-4 h-64 overflow-y-auto">
                {selectedPath?.timeline.map((milestone, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{milestone.phase}</h4>
                      <p className="text-sm text-gray-600 mt-1">{milestone.duration}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">
                          {formatSalary((salaryProgressionData[index] as any)?.salary || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </VisualizationCard>
          </div>
        </TabsContent>

        <TabsContent value="skills" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <VisualizationCard
              title="Skills Demand"
              description="Market demand for required skills"
            >
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={skillsData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip />
                    <Bar dataKey="demand" fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </VisualizationCard>

            <VisualizationCard
              title="Skill Growth Trends"
              description="Growth rate of each skill demand"
            >
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={skillsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="growth" 
                      stroke="#FF8042" 
                      strokeWidth={3}
                      dot={{ fill: '#FF8042', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </VisualizationCard>
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <VisualizationCard
              title="Career Comparison"
              description="Compare different career paths"
            >
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={formatSalary} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="avgSalary" fill="#0088FE" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </VisualizationCard>

            <VisualizationCard
              title="Growth Rate Comparison"
              description="Career growth rates across paths"
            >
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="growth" 
                      stroke="#00C49F" 
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </VisualizationCard>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <VisualizationCard
              title="Industry Distribution"
              description="Career opportunities by industry"
            >
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={industryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {industryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </VisualizationCard>

            <VisualizationCard
              title="Market Insights"
              description="Key statistics and trends"
            >
              <div className="h-64 space-y-6 p-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {careerPaths.length}
                  </div>
                  <p className="text-sm text-gray-600">Career paths analyzed</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatSalary(comparisonData.reduce((acc, curr) => acc + curr.avgSalary, 0) / comparisonData.length)}
                    </div>
                    <p className="text-xs text-gray-600">Average Salary</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {(comparisonData.reduce((acc, curr) => acc + curr.growth, 0) / comparisonData.length).toFixed(1)}%
                    </div>
                    <p className="text-xs text-gray-600">Average Growth</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 text-sm">Trending Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPath && [...selectedPath.requiredSkills.technical, ...selectedPath.requiredSkills.soft].slice(0, 5).map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <Button className="w-full" size="sm">
                    <Target className="w-4 h-4 mr-2" />
                    Explore Career Paths
                  </Button>
                </div>
              </div>
            </VisualizationCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
